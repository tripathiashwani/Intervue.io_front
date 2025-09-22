import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setPollHistory } from '../../store/appSlice';
import { socketService } from '../../services/socketService';
import { PollHistory as PollHistoryType } from '../../types';
import './PollHistory.css';

const PollHistory: React.FC = () => {
  const dispatch = useDispatch();
  const { pollHistory } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    // Fetch poll history when component mounts
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/poll/history');
        if (response.ok) {
          const history = await response.json();
          dispatch(setPollHistory(history));
        }
      } catch (error) {
        console.error('Failed to fetch poll history:', error);
      }
    };

    fetchHistory();
  }, [dispatch]);

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getWinningOption = (poll: PollHistoryType) => {
    if (!poll.results || Object.keys(poll.results).length === 0) return null;
    
    const maxVotes = Math.max(...Object.values(poll.results));
    const winningIndex = Object.entries(poll.results).find(([_, votes]) => votes === maxVotes)?.[0];
    
    if (winningIndex !== undefined && maxVotes > 0) {
      return {
        index: parseInt(winningIndex),
        option: poll.options[parseInt(winningIndex)],
        votes: maxVotes
      };
    }
    return null;
  };

  return (
    <div className="poll-history">
      <div className="history-header">
        <h2>Poll History</h2>
        <span className="history-count">{pollHistory.length} polls</span>
      </div>

      {pollHistory.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">📊</div>
          <p>No poll history available</p>
          <small>Past polls will appear here after you create and run them</small>
        </div>
      ) : (
        <div className="history-list">
          {pollHistory.map((poll) => {
            const winningOption = getWinningOption(poll);
            
            return (
              <div key={poll.id} className="history-item">
                <div className="poll-summary">
                  <div className="poll-question">
                    <h3>{poll.question}</h3>
                    <div className="poll-meta">
                      <span className="poll-date">{formatDate(poll.createdAt)}</span>
                      <span className="poll-stats">
                        {poll.totalAnswers} / {poll.studentsCount} responses
                      </span>
                    </div>
                  </div>
                  
                  {winningOption && (
                    <div className="winning-answer">
                      <span className="winner-badge">🏆 Winner</span>
                      <span className="winner-text">
                        {winningOption.option} ({winningOption.votes} votes)
                      </span>
                    </div>
                  )}
                </div>

                <div className="poll-results-detailed">
                  <h4>Results:</h4>
                  <div className="options-breakdown">
                    {poll.options.map((option, index) => {
                      const votes = poll.results[index] || 0;
                      const percentage = poll.totalAnswers > 0 ? Math.round((votes / poll.totalAnswers) * 100) : 0;
                      const isWinner = winningOption?.index === index;

                      return (
                        <div key={index} className={`option-breakdown ${isWinner ? 'winner' : ''}`}>
                          <div className="option-info">
                            <span className="option-text">{option}</span>
                            <span className="option-votes">{votes} votes ({percentage}%)</span>
                          </div>
                          <div className="mini-progress">
                            <div 
                              className="mini-progress-fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {poll.totalAnswers === 0 && (
                    <div className="no-responses-history">
                      <span>😔 No responses received</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PollHistory;
