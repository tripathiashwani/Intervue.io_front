export interface Poll {
  id: string;
  question: string;
  options: string[];
  timeLimit: number;
  timeRemaining: number;
  createdAt: Date;
  isActive: boolean;
}

export interface Student {
  name: string;
  socketId: string;
  hasAnswered: boolean;
}

export interface PollResults {
  [optionIndex: number]: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  senderName: string;
  senderType: 'teacher' | 'student';
  timestamp: Date;
}

export interface PollHistory {
  id: string;
  question: string;
  options: string[];
  results: PollResults;
  totalAnswers: number;
  studentsCount: number;
  createdAt: Date;
  endedAt: Date;
}

export type UserType = 'teacher' | 'student' | null;
