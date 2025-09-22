import React from 'react';
import { Poll, PollResults as PollResultsType } from '../../types';
import './PollResults.css';

interface PollResultsProps {
  poll: Poll;
  results: PollResultsType;
  totalAnswers: number;
  studentsCount: number;
}

const PollResults: React.FC<PollResultsProps> = ({ poll, results, totalAnswers, studentsCount }) => {
  const getPercentage = (optionIndex: number) => {
    if (totalAnswers === 0) return 0;
    return Math.round((results[optionIndex] || 0) / totalAnswers * 100);
  };

  const getMaxVotes = () => {
    return Math.max(...Object.values(results), 0);
  };

  return (
    <div className="poll-results">
      <div className="results-header">
        <h3>Live Results</h3>
        <div className="stats">
          <span className="stat">
            📊 {totalAnswers} / {studentsCount} answered
          </span>
          <span className="stat">
            ⏱️ {poll.isActive ? 'Active' : 'Ended'}
          </span>
        </div>
      </div>

      <div className="options-results">
        {poll.options.map((option, index) => {
          const votes = results[index] || 0;
          const percentage = getPercentage(index);
          const isWinning = votes === getMaxVotes() && votes > 0;

          return (
            <div key={index} className={`option-result ${isWinning ? 'winning' : ''}`}>
              <div className="option-header">
                <span className="option-text">{option}</span>
                <span className="option-stats">
                  {votes} votes ({percentage}%)
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {!poll.isActive && totalAnswers === 0 && (
        <div className="no-responses">
          <p>😔 No responses received for this poll</p>
        </div>
      )}

      {poll.isActive && totalAnswers === studentsCount && studentsCount > 0 && (
        <div className="all-answered">
          <p>🎉 All students have answered!</p>
        </div>
      )}
    </div>
  );
};

export default PollResults;
