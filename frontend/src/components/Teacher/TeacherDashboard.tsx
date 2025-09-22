import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { socketService } from '../../services/socketService';
import {
  setUserType,
  setConnectionStatus,
  setCurrentPoll,
  setPollResults,
  setStudents,
  addChatMessage,
  setChatHistory,
  setPollHistory,
  setTimeRemaining,
  updateResultsData,
  endPoll,
  setShowChat,
} from '../../store/appSlice';
import CreatePollForm from './CreatePollForm';
import PollResults from './PollResults';
import StudentsList from './StudentsList';
import PollHistory from './PollHistory';
import './TeacherDashboard.css';

const TeacherDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  
  const {
    currentPoll,
    pollResults,
    students,
    isConnected,
    timeRemaining,
    showChat,
    totalAnswers,
    studentsCount,
  } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    dispatch(setUserType('teacher'));
    socketService.joinAsTeacher();

    // Socket event listeners
    const handleConnect = () => {
      dispatch(setConnectionStatus(true));
    };

    const handleDisconnect = () => {
      dispatch(setConnectionStatus(false));
    };

    const handleTeacherJoined = () => {
      console.log('Teacher joined successfully');
    };

    const handlePollStatus = (data: any) => {
      if (data.poll) {
        dispatch(setCurrentPoll(data.poll));
        dispatch(setPollResults(data.results || {}));
        dispatch(updateResultsData({
          results: data.results || {},
          totalAnswers: data.totalAnswers || 0,
          studentsCount: data.studentsCount || 0,
        }));
      }
      dispatch(setStudents(data.students || []));
      if (data.timeRemaining !== undefined) {
        dispatch(setTimeRemaining(data.timeRemaining));
      }
    };

    const handleNewPoll = (data: any) => {
      dispatch(setCurrentPoll(data.poll));
      dispatch(setTimeRemaining(data.timeRemaining));
    };

    const handlePollCreated = (poll: any) => {
      dispatch(setCurrentPoll(poll));
    };

    const handleResultsUpdated = (data: any) => {
      dispatch(updateResultsData({
        results: data.results,
        totalAnswers: data.totalAnswers,
        studentsCount: data.studentsCount,
      }));
    };

    const handleStudentsUpdated = (students: any[]) => {
      dispatch(setStudents(students));
    };

    const handleTimerUpdate = (data: any) => {
      dispatch(setTimeRemaining(data.timeRemaining));
    };

    const handlePollEnded = (data: any) => {
      dispatch(endPoll({
        poll: data.poll,
        results: data.results,
        totalAnswers: data.totalAnswers,
        studentsCount: data.studentsCount,
      }));
    };

    const handleNewMessage = (message: any) => {
      dispatch(addChatMessage(message));
    };

    const handleChatHistory = (messages: any[]) => {
      dispatch(setChatHistory(messages));
    };

    const handlePollHistory = (history: any[]) => {
      dispatch(setPollHistory(history));
    };

    const handlePollError = (error: any) => {
      alert(error.message);
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('teacher-joined', handleTeacherJoined);
    socket.on('poll-status', handlePollStatus);
    socket.on('new-poll', handleNewPoll);
    socket.on('poll-created', handlePollCreated);
    socket.on('results-updated', handleResultsUpdated);
    socket.on('students-updated', handleStudentsUpdated);
    socket.on('timer-update', handleTimerUpdate);
    socket.on('poll-ended', handlePollEnded);
    socket.on('new-message', handleNewMessage);
    socket.on('chat-history', handleChatHistory);
    socket.on('poll-history', handlePollHistory);
    socket.on('poll-error', handlePollError);

    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('teacher-joined', handleTeacherJoined);
      socket.off('poll-status', handlePollStatus);
      socket.off('new-poll', handleNewPoll);
      socket.off('poll-created', handlePollCreated);
      socket.off('results-updated', handleResultsUpdated);
      socket.off('students-updated', handleStudentsUpdated);
      socket.off('timer-update', handleTimerUpdate);
      socket.off('poll-ended', handlePollEnded);
      socket.off('new-message', handleNewMessage);
      socket.off('chat-history', handleChatHistory);
      socket.off('poll-history', handlePollHistory);
      socket.off('poll-error', handlePollError);
    };
  }, [dispatch]);

  const handleCreatePoll = (question: string, options: string[], timeLimit: number) => {
    socketService.createPoll(question, options, timeLimit);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      socketService.removeStudent(studentId);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Teacher Dashboard</h1>
          <div className="header-actions">
            <div className="connection-status">
              <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            <button 
              className="chat-toggle"
              onClick={() => dispatch(setShowChat(!showChat))}
            >
              💬 Chat {showChat ? '✕' : ''}
            </button>
            <button className="home-button" onClick={() => navigate('/')}>
              🏠 Home
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-section">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              Current Poll
            </button>
            <button 
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Poll History
            </button>
          </div>

          {activeTab === 'current' ? (
            <div className="current-poll-section">
              {!currentPoll || !currentPoll.isActive ? (
                <CreatePollForm onCreatePoll={handleCreatePoll} />
              ) : (
                <div className="active-poll">
                  <div className="poll-header">
                    <h2>{currentPoll.question}</h2>
                    <div className="poll-timer">
                      Time Remaining: <span className="timer">{formatTime(timeRemaining)}</span>
                    </div>
                  </div>
                  <PollResults 
                    poll={currentPoll}
                    results={pollResults}
                    totalAnswers={totalAnswers}
                    studentsCount={studentsCount}
                  />
                </div>
              )}
            </div>
          ) : (
            <PollHistory />
          )}
        </div>

        <div className="sidebar">
          <StudentsList 
            students={students}
            onRemoveStudent={handleRemoveStudent}
          />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
