import React, { useState, useEffect } from 'react';
import { Poll } from '../../types';
import './PollAnswer.css';

interface PollAnswerProps {
  poll: Poll;
  onSubmitAnswer: (optionIndex: number) => void;
  timeRemaining: number;
  hasAnswered: boolean;
}

const PollAnswer: React.FC<PollAnswerProps> = ({ 
  poll, 
  onSubmitAnswer, 
  timeRemaining, 
  hasAnswered 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Reset selection when new poll starts
    setSelectedOption(null);
    setIsSubmitting(false);
  }, [poll.id]);

  const handleOptionSelect = (index: number) => {
    if (hasAnswered || isSubmitting) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || hasAnswered || isSubmitting) return;
    
    setIsSubmitting(true);
    onSubmitAnswer(selectedOption);
  };

  const getTimerColor = () => {
    if (timeRemaining > 30) return '#4CAF50';
    if (timeRemaining > 10) return '#ff9800';
    return '#f44336';
  };

  const getProgressPercentage = () => {
    return (timeRemaining / poll.timeLimit) * 100;
  };

  if (hasAnswered) {
    return (
      <div className="poll-answer answered">
        <div className="answered-message">
          <div className="check-animation">
            <div className="check-icon">✓</div>
          </div>
          <h2>Answer Submitted!</h2>
          <p>Your answer has been recorded. Results will be shown when the poll ends.</p>
          <div className="selected-answer">
            <strong>Your answer:</strong> {poll.options[selectedOption || 0]}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-answer">
      {/* Header with Question and Timer */}
      <div className="poll-header">
        <div className="question-number">Question 1</div>
        <div className="timer-display">
          <span className="timer-icon">🕒</span>
          <span className="timer-value">
            {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Question Bar */}
      <div className="question-bar">
        {poll.question}
      </div>

      {/* Options Container */}
      <div className="options-container">
        {poll.options.map((option, index) => (
          <div
            key={index}
            className={`option-item ${selectedOption === index ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(index)}
          >
            <div className="option-number">
              {index + 1}
            </div>
            <div className="option-text">{option}</div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="submit-container">
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default PollAnswer;
