import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import './StudentResults.css';

const StudentResults: React.FC = () => {
  const { 
    currentPoll, 
    pollResults, 
    selectedAnswer, 
    totalAnswers, 
    studentsCount,
    timeRemaining 
  } = useSelector((state: RootState) => state.app);

  if (!currentPoll) {
    return (
      <div className="student-results">
        <div className="no-poll">
          <h2>No poll results available</h2>
          <p>Wait for the teacher to start a new poll.</p>
        </div>
      </div>
    );
  }

  const getPercentage = (optionIndex: number) => {
    if (totalAnswers === 0) return 0;
    return Math.round(((pollResults[optionIndex] || 0) / totalAnswers) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="student-results">
      <div className="results-container">
        {/* Header with Question and Timer */}
        <div className="poll-header">
          <h1 className="question-title">Question 1</h1>
          <div className="timer-display">⏱️ {formatTime(timeRemaining)}</div>
        </div>

        {/* Question Text Bar */}
        <div className="question-bar">
          <span className="question-text">{currentPoll.question}</span>
        </div>

        {/* Results Container */}
        <div className="poll-results-box">
          {currentPoll.options.map((option, index) => {
            const percentage = getPercentage(index);

            return (
              <div key={index} className="result-row">
                <div 
                  className="progress-bar-container"
                  style={{ backgroundColor: '#f1f5f9' }}
                >
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: '#7c3aed'
                    }}
                  >
                    <div className="progress-content">
                      <div className="option-info">
                        <div className="option-number">{index + 1}</div>
                        <span className="option-name">{option}</span>
                      </div>
                    </div>
                  </div>
                  <div className="percentage-outside">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Waiting Message */}
        <div className="waiting-section">
          <p className="waiting-text">Wait for the teacher to ask a new question..</p>
        </div>
      </div>

      {/* Chat Icon - Bottom Right */}
      <div className="chat-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </div>
    </div>
  );
};

export default StudentResults;
