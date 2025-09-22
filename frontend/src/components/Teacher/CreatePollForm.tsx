import React, { useState } from 'react';
import './CreatePollForm.css';

interface CreatePollFormProps {
  onCreatePoll: (question: string, options: string[], timeLimit: number) => void;
}

const CreatePollForm: React.FC<CreatePollFormProps> = ({ onCreatePoll }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please provide at least 2 options');
      return;
    }

    onCreatePoll(question.trim(), validOptions, timeLimit);
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
  };

  return (
    <div className="create-poll-form">
      <h2>Create New Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your poll question..."
            maxLength={200}
          />
          <small>{question.length}/200 characters</small>
        </div>

        <div className="form-group">
          <label>Options</label>
          {options.map((option, index) => (
            <div key={index} className="option-input">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                maxLength={100}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  className="remove-option"
                  onClick={() => handleRemoveOption(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          {options.length < 6 && (
            <button
              type="button"
              className="add-option"
              onClick={handleAddOption}
            >
              + Add Option
            </button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="timeLimit">Time Limit (seconds)</label>
          <div className="time-controls">
            <input
              type="range"
              id="timeLimit"
              min="15"
              max="300"
              step="15"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
            <span className="time-display">{timeLimit}s</span>
          </div>
          <div className="time-presets">
            {[30, 60, 90, 120].map((preset) => (
              <button
                key={preset}
                type="button"
                className={`time-preset ${timeLimit === preset ? 'active' : ''}`}
                onClick={() => setTimeLimit(preset)}
              >
                {preset}s
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="create-poll-button">
          🚀 Create Poll
        </button>
      </form>
    </div>
  );
};

export default CreatePollForm;
