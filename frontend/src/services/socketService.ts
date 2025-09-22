import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    // For Vercel deployment, use relative URL in production
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : (process.env.REACT_APP_SERVER_URL || 'http://localhost:5000');
    this.socket = io(serverUrl);
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Event handlers
  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Teacher methods
  joinAsTeacher() {
    this.emit('teacher-join');
  }

  createPoll(question: string, options: string[], timeLimit: number = 60) {
    this.emit('create-poll', { question, options, timeLimit });
  }

  removeStudent(studentId: string) {
    this.emit('remove-student', { studentId });
  }

  // Student methods
  joinAsStudent(name: string) {
    this.emit('student-join', { name });
  }

  submitAnswer(optionIndex: number) {
    this.emit('submit-answer', { optionIndex });
  }

  // Chat methods
  sendMessage(message: string) {
    this.emit('send-message', { message });
  }
}

export const socketService = new SocketService();
