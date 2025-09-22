const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure CORS for Vercel deployment
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
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

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

let currentPoll = null;
let students = new Map();
let pollResults = new Map();
let pollHistory = [];
let pollTimer = null;
let chatMessages = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running on Vercel' });
});

app.get('/api/poll/current', (req, res) => {
  res.json({
    poll: currentPoll,
    results: Object.fromEntries(pollResults),
    totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
    studentsCount: students.size
  });
});

app.get('/api/poll/history', (req, res) => {
  res.json(pollHistory);
});

// Catch all handler for React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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
    
    if (currentPoll) {
      socket.emit('new-poll', {
        poll: currentPoll,
        timeRemaining: currentPoll.timeRemaining
      });
    }

    socket.emit('chat-history', chatMessages);
    broadcastToTeachers('students-updated', Array.from(students.values()));
    
    console.log(`Student ${name} joined with ID: ${studentId}`);
  });

  socket.on('teacher-join', () => {
    socket.userType = 'teacher';
    socket.emit('teacher-joined');
    
    socket.emit('poll-status', {
      currentPoll,
      results: Object.fromEntries(pollResults),
      students: Array.from(students.values()),
      totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
      studentsCount: students.size
    });

    socket.emit('chat-history', chatMessages);
    socket.emit('poll-history', pollHistory);
    
    console.log('Teacher joined');
  });

  socket.on('create-poll', (data) => {
    if (socket.userType !== 'teacher') return;

    const { question, options, timeLimit = 60 } = data;
    
    if (currentPoll && currentPoll.isActive && currentPoll.timeRemaining > 0 && !allStudentsAnswered()) {
      socket.emit('poll-error', { message: 'Cannot create new poll. Students are still answering.' });
      return;
    }

    if (currentPoll && !pollHistory.some(p => p.id === currentPoll.id)) {
      savePollToHistory();
    }

    currentPoll = {
      id: uuidv4(),
      question,
      options,
      timeLimit,
      timeRemaining: timeLimit,
      createdAt: new Date(),
      isActive: true
    };

    pollResults.clear();
    options.forEach((_, index) => {
      pollResults.set(index, 0);
    });

    students.forEach(student => {
      student.hasAnswered = false;
    });

    startPollTimer();

    io.emit('new-poll', {
      poll: currentPoll,
      timeRemaining: currentPoll.timeRemaining
    });

    socket.emit('poll-created', { success: true });
    
    console.log('New poll created:', question);
  });

  socket.on('submit-answer', (data) => {
    if (socket.userType !== 'student') return;
    
    const { answerIndex } = data;
    const student = students.get(socket.studentId);
    
    if (!student || student.hasAnswered || !currentPoll || !currentPoll.isActive) {
      return;
    }

    student.hasAnswered = true;
    const currentCount = pollResults.get(answerIndex) || 0;
    pollResults.set(answerIndex, currentCount + 1);

    socket.emit('answer-submitted', { success: true });
    
    broadcastResults();
    
    if (allStudentsAnswered()) {
      endPoll();
    }
    
    console.log(`Student ${student.name} answered: ${answerIndex}`);
  });

  socket.on('send-message', (data) => {
    const { message, senderName, senderType } = data;
    
    const chatMessage = {
      id: uuidv4(),
      message,
      senderName,
      senderType,
      timestamp: new Date()
    };
    
    chatMessages.push(chatMessage);
    
    io.emit('new-message', chatMessage);
  });

  socket.on('remove-student', (data) => {
    if (socket.userType !== 'teacher') return;
    
    const { studentId } = data;
    students.delete(studentId);
    
    broadcastToTeachers('students-updated', Array.from(students.values()));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (socket.userType === 'student' && socket.studentId) {
      students.delete(socket.studentId);
      broadcastToTeachers('students-updated', Array.from(students.values()));
    }
  });
});

function broadcastToTeachers(event, data) {
  io.sockets.sockets.forEach((socket) => {
    if (socket.userType === 'teacher') {
      socket.emit(event, data);
    }
  });
}

function broadcastResults() {
  io.emit('results-updated', {
    results: Object.fromEntries(pollResults),
    totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
    studentsCount: students.size
  });
}

function allStudentsAnswered() {
  if (students.size === 0) return true;
  return Array.from(students.values()).every(student => student.hasAnswered);
}

function startPollTimer() {
  if (pollTimer) {
    clearInterval(pollTimer);
  }

  pollTimer = setInterval(() => {
    if (currentPoll && currentPoll.isActive) {
      currentPoll.timeRemaining--;
      
      io.emit('timer-update', { timeRemaining: currentPoll.timeRemaining });
      
      if (currentPoll.timeRemaining <= 0) {
        endPoll();
      }
    }
  }, 1000);
}

function endPoll() {
  if (currentPoll) {
    currentPoll.isActive = false;
    
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }

    if (!pollHistory.some(p => p.id === currentPoll.id)) {
      savePollToHistory();
    }
    
    io.emit('poll-ended', {
      results: Object.fromEntries(pollResults),
      totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0)
    });
    
    console.log('Poll ended');
  }
}

function savePollToHistory() {
  if (currentPoll) {
    const pollData = {
      ...currentPoll,
      results: Object.fromEntries(pollResults),
      totalAnswers: Array.from(pollResults.values()).reduce((sum, count) => sum + count, 0),
      endedAt: new Date()
    };
    
    pollHistory.push(pollData);
    
    broadcastToTeachers('poll-history', pollHistory);
  }
}

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;