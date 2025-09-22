import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher');
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="brand-header">
          <div className="brand-pill">
            🎯 Intervue Poll
          </div>
        </div>
        
        <div className="welcome-section">
          <h1>Welcome to the Live Polling System</h1>
          <p>Please select the role that best describes you to begin using the live polling system</p>
        </div>

        <div className="role-selection">
          <div 
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>
          
          <div 
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view how live poll results in real-time.</p>
          </div>
        </div>

        <button 
          className="continue-button"
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
