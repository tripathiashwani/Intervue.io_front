import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store';
import { socketService } from '../../services/socketService';
import {
  setUserType,
  setStudentInfo,
  setConnectionStatus,
  setCurrentPoll,
  setPollResults,
  addChatMessage,
  setChatHistory,
  setSelectedAnswer,
  setShowResults,
  setTimeRemaining,
  updateResultsData,
  endPoll,
  setShowChat,
} from '../../store/appSlice';
import StudentLogin from './StudentLogin';
import PollAnswer from './PollAnswer';
import StudentResults from './StudentResults';
import './StudentDashboard.css';

const StudentDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isJoined, setIsJoined] = useState(false);
  
  const {
    studentName,
    studentId,
    currentPoll,
    selectedAnswer,
    showResults,
    timeRemaining,
    isConnected,
    showChat,
  } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    dispatch(setUserType('student'));

    // Socket event listeners
    const handleConnect = () => {
      dispatch(setConnectionStatus(true));
    };

    const handleDisconnect = () => {
      dispatch(setConnectionStatus(false));
    };

    const handleStudentJoined = (data: any) => {
      dispatch(setStudentInfo({ name: data.name, id: data.studentId }));
      setIsJoined(true);
      console.log(`Student ${data.name} joined with ID: ${data.studentId}`);
    };

    const handleNewPoll = (data: any) => {
      dispatch(setCurrentPoll(data.poll));
      dispatch(setTimeRemaining(data.timeRemaining));
      dispatch(setSelectedAnswer(null));
      dispatch(setShowResults(false));
    };

    const handleResultsUpdated = (data: any) => {
      if (selectedAnswer !== null) {
        dispatch(updateResultsData({
          results: data.results,
          totalAnswers: data.totalAnswers,
          studentsCount: data.studentsCount,
        }));
        dispatch(setShowResults(true));
      }
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

    const handleAnswerSubmitted = (data: any) => {
      dispatch(setSelectedAnswer(data.optionIndex));
      dispatch(setShowResults(true));
    };

    const handleNewMessage = (message: any) => {
      dispatch(addChatMessage(message));
    };

    const handleChatHistory = (messages: any[]) => {
      dispatch(setChatHistory(messages));
    };

    const handleRemovedByTeacher = () => {
      alert('You have been removed from the poll by the teacher.');
      navigate('/');
    };

    // Register event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('student-joined', handleStudentJoined);
    socket.on('new-poll', handleNewPoll);
    socket.on('results-updated', handleResultsUpdated);
    socket.on('timer-update', handleTimerUpdate);
    socket.on('poll-ended', handlePollEnded);
    socket.on('answer-submitted', handleAnswerSubmitted);
    socket.on('new-message', handleNewMessage);
    socket.on('chat-history', handleChatHistory);
    socket.on('removed-by-teacher', handleRemovedByTeacher);

    // Cleanup function
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('student-joined', handleStudentJoined);
      socket.off('new-poll', handleNewPoll);
      socket.off('results-updated', handleResultsUpdated);
      socket.off('timer-update', handleTimerUpdate);
      socket.off('poll-ended', handlePollEnded);
      socket.off('answer-submitted', handleAnswerSubmitted);
      socket.off('new-message', handleNewMessage);
      socket.off('chat-history', handleChatHistory);
      socket.off('removed-by-teacher', handleRemovedByTeacher);
    };
  }, [dispatch, navigate, selectedAnswer]);

  const handleJoin = (name: string) => {
    socketService.joinAsStudent(name);
  };

  const handleSubmitAnswer = (optionIndex: number) => {
    socketService.submitAnswer(optionIndex);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isJoined) {
    return <StudentLogin onJoin={handleJoin} />;
  }

  return (
    <div className="student-dashboard">
      {!currentPoll ? (
        <div className="waiting-screen">
          <div className="brand-header">
            <div className="brand-pill">
              🎯 Intervue Poll
            </div>
          </div>
          
          <div className="waiting-content">
            <div className="spinner-container">
              <div className="loading-spinner"></div>
            </div>
            <h2>Wait for the teacher to ask questions..</h2>
          </div>

          <button 
            className="chat-button"
            onClick={() => dispatch(setShowChat(!showChat))}
            title="Open Chat"
          >
            💬
          </button>
        </div>
      ) : (
        <>
          <div className="student-content">
            {showResults || !currentPoll.isActive ? (
              <StudentResults />
            ) : (
              <div className="active-poll-container">
                <div className="poll-timer-display">
                  <span className="timer-label">Time Remaining:</span>
                  <span className="timer-value">{formatTime(timeRemaining)}</span>
                </div>
                <PollAnswer 
                  poll={currentPoll}
                  onSubmitAnswer={handleSubmitAnswer}
                  timeRemaining={timeRemaining}
                  hasAnswered={selectedAnswer !== null}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
