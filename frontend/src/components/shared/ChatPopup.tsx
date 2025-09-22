import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setShowChat } from '../../store/appSlice';
import { socketService } from '../../services/socketService';
import './ChatPopup.css';

const ChatPopup: React.FC = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    showChat, 
    chatMessages, 
    userType, 
    studentName,
    isConnected 
  } = useSelector((state: RootState) => state.app);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !isConnected) return;
    
    socketService.sendMessage(message.trim());
    setMessage('');
  };

  const handleClose = () => {
    dispatch(setShowChat(false));
  };

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!showChat) return null;

  return (
    <div className={`chat-popup ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">💬</span>
          <span>Live Chat</span>
          <span className="online-indicator">
            {isConnected ? '🟢' : '🔴'} {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
        <div className="chat-controls">
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? '🔼' : '🔽'}
          </button>
          <button 
            className="close-btn"
            onClick={handleClose}
            title="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-messages">
            {chatMessages.length === 0 ? (
              <div className="no-messages">
                <p>💬 No messages yet</p>
                <small>Start the conversation!</small>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.senderType === 'teacher' ? 'teacher' : 'student'} ${
                    userType === 'student' && msg.senderName === studentName ? 'own' : ''
                  }`}
                >
                  <div className="message-header">
                    <span className="sender-name">
                      {msg.senderType === 'teacher' ? '👩‍🏫' : '👨‍🎓'} {msg.senderName}
                    </span>
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div className="message-content">
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="input-container">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  !isConnected 
                    ? 'Disconnected...' 
                    : userType === 'teacher' 
                      ? 'Message students...' 
                      : 'Message teacher and classmates...'
                }
                maxLength={500}
                disabled={!isConnected}
                className="message-input"
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={!message.trim() || !isConnected}
              >
                📤
              </button>
            </div>
            <div className="char-counter">
              {message.length}/500
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatPopup;
