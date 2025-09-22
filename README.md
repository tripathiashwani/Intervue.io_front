# Live Polling System

A real-time polling system with Teacher and Student personas built with React and Express.js.

## 🚀 Features

### Teacher Features
- ✅ Create new polls with custom questions and options
- ✅ View live polling results in real-time
- ✅ Control when new questions can be asked
- ✅ Remove students from polls (bonus feature)
- ✅ View past poll results (bonus feature)
- ✅ Configure poll time limits (bonus feature)
- ✅ Chat with students (bonus feature)

### Student Features
- ✅ Enter unique name on first visit
- ✅ Submit answers to active polls
- ✅ View live results after submission
- ✅ 60-second timer for answering questions
- ✅ Chat with teacher and other students (bonus feature)

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Redux Toolkit
- **Backend**: Express.js + Socket.io
- **Real-time Communication**: Socket.io
- **State Management**: Redux Toolkit
- **Styling**: Custom CSS with responsive design

## 📁 Project Structure

```
Intervue.io/
├── backend/              # Express.js server with Socket.io
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   ├── .env            # Environment variables
│   └── .gitignore      # Backend ignore rules
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Teacher/ # Teacher interface components
│   │   │   ├── Student/ # Student interface components
│   │   │   └── shared/  # Shared components (Chat, etc.)
│   │   ├── store/      # Redux store and slices
│   │   ├── services/   # API and Socket services
│   │   ├── types/      # TypeScript type definitions
│   │   └── App.tsx     # Main app component
│   ├── package.json    # Frontend dependencies
│   ├── .env           # Frontend environment variables
│   └── public/        # Static assets
├── README.md          # Project documentation
├── DEPLOYMENT.md      # Deployment guide
└── package.json       # Root package.json for scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation & Running

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tripathiashwani/Intervue.io.git
   cd Intervue.io
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start the backend server:**
   ```bash
   npm run start:backend
   ```
   Server will run on http://localhost:5000

4. **Start the frontend (in a new terminal):**
   ```bash
   npm run start:frontend
   ```
   App will open on http://localhost:3000

5. **Access the application:**
   - Open http://localhost:3000 in your browser
   - Choose "Teacher" or "Student" to get started!

## 📖 How to Use

### For Teachers:
1. Click "Join as Teacher" on the landing page
2. Create a new poll with your question and options
3. Set a custom time limit (15-300 seconds)
4. Watch live results as students answer
5. Use the chat feature to communicate with students
6. View past poll results in the History tab

### For Students:
1. Click "Join as Student" on the landing page
2. Enter your unique name
3. Wait for teacher to create a poll
4. Select your answer and submit before time runs out
5. View live results after submitting
6. Use chat to ask questions or discuss

## ✨ Key Features Implemented

### Core Requirements ✅
- [x] Functional system with all core features working
- [x] Teacher can create polls and students can answer them
- [x] Both teacher and student can view poll results
- [x] Real-time updates with Socket.io
- [x] 60-second timer with visual countdown
- [x] Unique student names per session
- [x] Question flow control (no new questions until all answered or timeout)

### Bonus Features ✅
- [x] **Chat popup** for interaction between students and teachers
- [x] **Teacher can view past poll results** (stored in memory)
- [x] **Configurable poll time limit** by teacher (15-300 seconds)
- [x] **Option for teacher to remove a student**
- [x] **Well-designed user interface** with responsive design
- [x] **Professional styling** following modern UI/UX principles

## 🎨 UI/UX Design

The application features a modern, responsive design with:
- **Clean and intuitive interface**
- **Consistent color scheme** and typography
- **Smooth animations** and transitions
- **Mobile-responsive** layout
- **Accessibility features** (proper contrast, keyboard navigation)
- **Real-time visual feedback** for all interactions

## 🔧 Technical Implementation

### Real-time Features
- **Socket.io** for bidirectional communication
- **Redux** for consistent state management
- **TypeScript** for type safety
- **Automatic reconnection** handling
- **Error handling** and user feedback

### Performance & Scalability
- **In-memory storage** for quick response times
- **Efficient state updates** with Redux Toolkit
- **Optimized re-renders** with React best practices
- **Connection pooling** for multiple users

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for various platforms including:
- **Heroku** (Backend)
- **Vercel** (Frontend)
- **Railway** (Backend alternative)
- **Netlify** (Frontend alternative)

## 🔒 Security & Best Practices

- Input validation and sanitization
- XSS protection
- CORS configuration
- Rate limiting considerations
- Secure environment variable handling

## 📊 Project Status

- ✅ **Backend Development** - Complete
- ✅ **Frontend Development** - Complete  
- ✅ **Real-time Features** - Complete
- ✅ **UI/UX Design** - Complete
- ✅ **Testing** - Manual testing complete
- ✅ **Documentation** - Complete
- 🚀 **Ready for Deployment**

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements.

## 📄 License

MIT License - Feel free to use this project for educational or commercial purposes.

## 👨‍💻 Author

**Ashwani Tripathi**
- GitHub: [@tripathiashwani](https://github.com/tripathiashwani)

---

**Note**: This project was built as a comprehensive solution demonstrating real-time web application development with modern technologies. It showcases full-stack development skills including React, Express.js, Socket.io, TypeScript, and responsive web design.
