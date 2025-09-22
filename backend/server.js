const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for production and development
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001", 
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// In-memory storage (replace with database in production)
let currentPoll = null;
let students = new Map(); // studentId -> { name, socketId, hasAnswered }
let pollResults = new Map(); // optionIndex -> count
let pollHistory = []; // Array of past polls
let pollTimer = null;
let chatMessages = []; // Array of chat messages

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/poll/current', (req, res) => {
  res.json({
    poll: currentPoll,
    results: currentPoll ? Object.fromEntries(pollResults) : {},
    timeRemaining: currentPoll ? currentPoll.timeRemaining : 0
  });
});

app.get('/api/poll/history', (req, res) => {
  res.json(pollHistory);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Student joins with name
  socket.on('student-join', (data) => {
    const { name } = data;
    const studentId = uuidv4();
    
    students.set(studentId, {
      name,
      socketId: socket.id,
      hasAnswered: false
    });

    socket.studentId = studentId;
    socket.userType = 'student';
    
    socket.emit('student-joined', { studentId, name });
    
    // Send current poll if exists
    if (currentPoll) {
      socket.emit('new-poll', {
        poll: currentPoll,
        timeRemaining: currentPoll.timeRemaining
      });
    }

    // Send current chat messages
    socket.emit('chat-history', chatMessages);
    
    // Broadcast updated student list to teachers
    broadcastToTeachers('students-updated', Array.from(students.values()));
    
    console.log(`Student ${name} joined with ID: ${studentId}`);
  });

  // Teacher joins
  socket.on('teacher-join', () => {
    socket.userType = 'teacher';
    socket.emit('teacher-joined');
    
    // Send current state
    socket.emit('poll-status', {
      poll: currentPoll,
      results: currentPoll ? Object.fromEntries(pollResults) : {},
      students: Array.from(students.values()),
      timeRemaining: currentPoll ? currentPoll.timeRemaining : 0
    });

    // Send chat history
    socket.emit('chat-history', chatMessages);
    
    // Send poll history
    socket.emit('poll-history', pollHistory);
    
    console.log('Teacher joined');
  });

  // Teacher creates a new poll
  socket.on('create-poll', (data) => {
    if (socket.userType !== 'teacher') return;

    const { question, options, timeLimit = 60 } = data;
    
    // Check if can create new poll
    if (currentPoll && currentPoll.isActive && currentPoll.timeRemaining > 0 && !allStudentsAnswered()) {
      socket.emit('poll-error', { message: 'Cannot create new poll. Students are still answering.' });
      return;
    }

    // Save previous poll to history if it exists and hasn't been saved yet
    if (currentPoll && !pollHistory.some(p => p.id === currentPoll.id)) {
      savePollToHistory();
    }

    // Create new poll
    currentPoll = {
      id: uuidv4(),
      question,
      options,
      timeLimit,
      timeRemaining: timeLimit,
      createdAt: new Date(),
      isActive: true
    };

    // Reset results and student answers
    pollResults.clear();
    options.forEach((_, index) => {
      pollResults.set(index, 0);
    });

    students.forEach(student => {
      student.hasAnswered = false;
    });

    // Start timer
    startPollTimer();

    // Broadcast to all clients
    io.emit('new-poll', {
      poll: currentPoll,
      timeRemaining: currentPoll.timeRemaining
    });

    broadcastToTeachers('poll-created', currentPoll);
    
    console.log('New poll created:', question);
  });

  // Student submits answer
  socket.on('submit-answer', (data) => {
    if (socket.userType !== 'student' || !currentPoll || !currentPoll.isActive) return;

    const { optionIndex } = data;
    const student = students.get(socket.studentId);
    
    if (!student || student.hasAnswered) return;

    // Record answer
    student.hasAnswered = true;
    pollResults.set(optionIndex, (pollResults.get(optionIndex) || 0) + 1);

    // Send confirmation to student
    socket.emit('answer-submitted', { optionIndex });

    // Broadcast updated results
    broadcastResults();

    // Check if all students answered
    if (allStudentsAnswered()) {
      endPoll();
    }

    console.log(`Student ${student.name} answered option ${optionIndex}`);
  });

  // Chat message
  socket.on('send-message', (data) => {
    const { message } = data;
    let senderName = 'Anonymous';
    let senderType = 'student';

    if (socket.userType === 'teacher') {
      senderName = 'Teacher';
      senderType = 'teacher';
    } else if (socket.studentId && students.has(socket.studentId)) {
      senderName = students.get(socket.studentId).name;
      senderType = 'student';
    }

    const chatMessage = {
      id: uuidv4(),
      message,
      senderName,
      senderType,
      timestamp: new Date()
    };

    chatMessages.push(chatMessage);
    
    // Keep only last 100 messages
    if (chatMessages.length > 100) {
      chatMessages = chatMessages.slice(-100);
    }

    // Broadcast to all clients
    io.emit('new-message', chatMessage);
  });

  // Teacher removes student
  socket.on('remove-student', (data) => {
    if (socket.userType !== 'teacher') return;

    const { studentId } = data;
    const student = students.get(studentId);
    
    if (student) {
      // Disconnect the student
      const studentSocket = io.sockets.sockets.get(student.socketId);
      if (studentSocket) {
        studentSocket.emit('removed-by-teacher');
        studentSocket.disconnect();
      }

      students.delete(studentId);
      broadcastToTeachers('students-updated', Array.from(students.values()));
      
      console.log(`Student ${student.name} removed by teacher`);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.studentId && students.has(socket.studentId)) {
      const student = students.get(socket.studentId);
      students.delete(socket.studentId);
      
      // Check if all remaining students have answered after disconnect
      if (currentPoll && currentPoll.isActive && allStudentsAnswered()) {
        endPoll();
      }
      
      broadcastToTeachers('students-updated', Array.from(students.values()));
      console.log(`Student ${student.name} disconnected`);
    } else if (socket.userType === 'teacher') {
      console.log('Teacher disconnected');
    }
  });
});

// Helper functions
function broadcastToTeachers(event, data) {
  io.sockets.sockets.forEach(socket => {
    if (socket.userType === 'teacher') {
      socket.emit(event, data);
    }
  });
}

function broadcastResults() {
  const results = Object.fromEntries(pollResults);
  io.emit('results-updated', {
    results,
    totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
    studentsCount: students.size
  });
}

function allStudentsAnswered() {
  if (students.size === 0) return true;
  
  // Count only connected students
  const connectedStudents = Array.from(students.values()).filter(student => {
    // Check if the student's socket is still connected
    const studentSocket = io.sockets.sockets.get(student.socketId);
    return studentSocket && studentSocket.connected;
  });
  
  if (connectedStudents.length === 0) return true;
  
  return connectedStudents.every(student => student.hasAnswered);
}

function startPollTimer() {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(() => {
    if (currentPoll && currentPoll.isActive) {
      currentPoll.timeRemaining--;
      
      // Broadcast time update
      io.emit('timer-update', { timeRemaining: currentPoll.timeRemaining });

      if (currentPoll.timeRemaining <= 0) {
        endPoll();
      }
    }
  }, 1000);
}

function endPoll() {
  if (!currentPoll) return;

  currentPoll.isActive = false;
  currentPoll.timeRemaining = 0;

  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }

  // Save poll to history before showing results
  savePollToHistory();

  // Show results to everyone
  const finalResults = {
    poll: currentPoll,
    results: Object.fromEntries(pollResults),
    totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
    studentsCount: students.size
  };

  io.emit('poll-ended', finalResults);
  
  // Send updated poll history to teacher
  io.emit('poll-history', pollHistory);
  
  console.log('Poll ended:', currentPoll.question);
}

function savePollToHistory() {
  if (!currentPoll) return;

  const pollRecord = {
    ...currentPoll,
    results: Object.fromEntries(pollResults),
    totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
    studentsCount: students.size,
    endedAt: new Date()
  };

  pollHistory.unshift(pollRecord);
  
  // Keep only last 50 polls in history
  if (pollHistory.length > 50) {
    pollHistory = pollHistory.slice(0, 50);
  }
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
