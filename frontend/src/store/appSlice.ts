import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Poll, Student, PollResults, ChatMessage, PollHistory, UserType } from '../types';

interface AppState {
  userType: UserType;
  studentName: string;
  studentId: string;
  currentPoll: Poll | null;
  pollResults: PollResults;
  students: Student[];
  chatMessages: ChatMessage[];
  pollHistory: PollHistory[];
  isConnected: boolean;
  selectedAnswer: number | null;
  showResults: boolean;
  timeRemaining: number;
  showChat: boolean;
  totalAnswers: number;
  studentsCount: number;
}

const initialState: AppState = {
  userType: null,
  studentName: '',
  studentId: '',
  currentPoll: null,
  pollResults: {},
  students: [],
  chatMessages: [],
  pollHistory: [],
  isConnected: false,
  selectedAnswer: null,
  showResults: false,
  timeRemaining: 0,
  showChat: false,
  totalAnswers: 0,
  studentsCount: 0,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setUserType: (state, action: PayloadAction<UserType>) => {
      state.userType = action.payload;
    },
    
    setStudentInfo: (state, action: PayloadAction<{ name: string; id: string }>) => {
      state.studentName = action.payload.name;
      state.studentId = action.payload.id;
    },
    
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    
    setCurrentPoll: (state, action: PayloadAction<Poll | null>) => {
      state.currentPoll = action.payload;
      if (action.payload) {
        state.timeRemaining = action.payload.timeRemaining;
        state.showResults = false;
        state.selectedAnswer = null;
      }
    },
    
    setPollResults: (state, action: PayloadAction<PollResults>) => {
      state.pollResults = action.payload;
    },
    
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
    
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatMessages.push(action.payload);
    },
    
    setChatHistory: (state, action: PayloadAction<ChatMessage[]>) => {
      state.chatMessages = action.payload;
    },
    
    setPollHistory: (state, action: PayloadAction<PollHistory[]>) => {
      state.pollHistory = action.payload;
    },
    
    setSelectedAnswer: (state, action: PayloadAction<number | null>) => {
      state.selectedAnswer = action.payload;
    },
    
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload;
    },
    
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
      if (action.payload <= 0) {
        state.showResults = true;
      }
    },
    
    toggleChat: (state) => {
      state.showChat = !state.showChat;
    },
    
    setShowChat: (state, action: PayloadAction<boolean>) => {
      state.showChat = action.payload;
    },
    
    updateResultsData: (state, action: PayloadAction<{ results: PollResults; totalAnswers: number; studentsCount: number }>) => {
      state.pollResults = action.payload.results;
      state.totalAnswers = action.payload.totalAnswers;
      state.studentsCount = action.payload.studentsCount;
    },
    
    endPoll: (state, action: PayloadAction<{ poll: Poll; results: PollResults; totalAnswers: number; studentsCount: number }>) => {
      state.currentPoll = { ...action.payload.poll, isActive: false };
      state.pollResults = action.payload.results;
      state.totalAnswers = action.payload.totalAnswers;
      state.studentsCount = action.payload.studentsCount;
      state.showResults = true;
      state.timeRemaining = 0;
    },
    
    resetState: () => initialState,
  },
});

export const {
  setUserType,
  setStudentInfo,
  setConnectionStatus,
  setCurrentPoll,
  setPollResults,
  setStudents,
  addChatMessage,
  setChatHistory,
  setPollHistory,
  setSelectedAnswer,
  setShowResults,
  setTimeRemaining,
  toggleChat,
  setShowChat,
  updateResultsData,
  endPoll,
  resetState,
} = appSlice.actions;

export default appSlice.reducer;
