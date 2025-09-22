import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { socketService } from './services/socketService';
import LandingPage from './components/LandingPage';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import ChatPopup from './components/shared/ChatPopup';
import './App.css';

function App() {
  useEffect(() => {
    // Connect to socket server when app loads
    socketService.connect();

    return () => {
      // Cleanup socket connection when app unmounts
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ChatPopup />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
