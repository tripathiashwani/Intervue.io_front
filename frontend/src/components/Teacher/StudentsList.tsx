import React from 'react';
import { Student } from '../../types';
import './StudentsList.css';

interface StudentsListProps {
  students: Student[];
  onRemoveStudent: (studentId: string) => void;
}

const StudentsList: React.FC<StudentsListProps> = ({ students, onRemoveStudent }) => {
  return (
    <div className="students-list">
      <div className="students-header">
        <h3>Students ({students.length})</h3>
      </div>
      
      <div className="students-container">
        {students.length === 0 ? (
          <div className="no-students">
            <p>📝 No students connected</p>
            <small>Students will appear here when they join</small>
          </div>
        ) : (
          <div className="students-grid">
            {students.map((student, index) => {
              // Extract student ID from the student object or use index as fallback
              const studentId = (student as any).id || `student-${index}`;
              
              return (
                <div key={studentId} className="student-card">
                  <div className="student-info">
                    <div className="student-avatar">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="student-details">
                      <div className="student-name">{student.name}</div>
                      <div className="student-status">
                        <span className={`status-dot ${student.hasAnswered ? 'answered' : 'waiting'}`}></span>
                        {student.hasAnswered ? 'Answered' : 'Waiting...'}
                      </div>
                    </div>
                  </div>
                  <button 
                    className="remove-student-btn"
                    onClick={() => onRemoveStudent(studentId)}
                    title="Remove student"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsList;
