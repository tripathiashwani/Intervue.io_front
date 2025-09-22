import React, { useState } from 'react';
import './StudentLogin.css';

interface StudentLoginProps {
  onJoin: (name: string) => void;
}

const StudentLogin: React.FC<StudentLoginProps> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      alert('Name must be at least 2 characters long');
      return;
    }

    if (name.trim().length > 30) {
      alert('Name must be less than 30 characters');
      return;
    }

    setIsJoining(true);
    onJoin(name.trim());
  };

  return (
    <div className="student-login">
      <div className="login-container">
        <div className="brand-header">
          <div className="brand-pill">
            � Intervue Poll
          </div>
        </div>
        
        <div className="welcome-section">
          <h1>Let's Get Started</h1>
          <p>If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Enter your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Rahul Bajaj"
              disabled={isJoining}
              required
            />
          </div>

          <button 
            type="submit" 
            className="join-button"
            disabled={isJoining || !name.trim()}
          >
            {isJoining ? 'Joining...' : 'Join Session'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
