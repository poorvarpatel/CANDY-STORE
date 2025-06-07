import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import ClassSelection from './components/TeacherPages/ClassSelection.jsx';
import ClassDashboard from './components/TeacherPages/ClassDashboard.jsx';
import StudentDetail from './components/TeacherPages/StudentDetail.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';

// Mock data
const mockTeacher = {
  name: "Ms. Johnson",
  classes: [
    { id: 1, name: "Biology 101", studentCount: 6 },
    { id: 2, name: "Advanced Biology", studentCount: 6 },
    { id: 3, name: "AP Biology", studentCount: 6 }
  ]
};

const mockStudents = [
  { id: 1, name: "Alice Anderson", email: "alice.a@school.edu", notes: "" },
  { id: 2, name: "Bob Chen", email: "bob.c@school.edu", notes: "Struggles with cell division concepts" },
  { id: 3, name: "Emma Davis", email: "emma.d@school.edu", notes: "" },
  { id: 4, name: "James Wilson", email: "james.w@school.edu", notes: "Excellent at memorization, needs help with application" },
  { id: 5, name: "Maria Garcia", email: "maria.g@school.edu", notes: "" },
  { id: 6, name: "Oliver Kim", email: "oliver.k@school.edu", notes: "Visual learner, responds well to diagrams" }
];

const App = () => {
  // User authentication state
  const [currentUser, setCurrentUser] = useState(null);
  
  // Teacher flow state
  const [currentView, setCurrentView] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentNotes, setStudentNotes] = useState({});

  // Auto-save notes simulation
  useEffect(() => {
    const saveNotes = () => {
      // Simulate API call to save notes
      console.log('Auto-saving notes:', studentNotes);
    };
    
    const timeoutId = setTimeout(saveNotes, 1000);
    return () => clearTimeout(timeoutId);
  }, [studentNotes]);

  // Authentication handlers
  const handleLogin = (role, userData) => {
    setCurrentUser({ role, ...userData });
    // Reset teacher flow state when logging in
    setCurrentView('classes');
    setSelectedClass(null);
    setSelectedStudent(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Reset all state
    setCurrentView('classes');
    setSelectedClass(null);
    setSelectedStudent(null);
    setStudentNotes({});
  };

  // Teacher flow handlers
  const handleNoteChange = (studentId, note) => {
    setStudentNotes(prev => ({
      ...prev,
      [studentId]: note
    }));
  };

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setCurrentView('dashboard');
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setCurrentView('student-detail');
  };

  const handleBackToClasses = () => {
    setCurrentView('classes');
    setSelectedClass(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedStudent(null);
  };

  // If no user is logged in, show login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Student flow
  if (currentUser.role === 'student') {
    return (
      <div>
        {/* Add logout button for testing */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <StudentDashboard 
          studentName={currentUser.name}
          studentData={currentUser}
        />
      </div>
    );
  }

  // Teacher flow (existing logic)
  if (currentUser.role === 'teacher') {
    return (
      <div>
        {/* Add logout button for testing */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Render current teacher view */}
        {currentView === 'classes' && (
          <ClassSelection 
            teacher={mockTeacher}
            onClassSelect={handleClassSelect}
          />
        )}
        
        {currentView === 'dashboard' && (
          <ClassDashboard 
            selectedClass={selectedClass}
            students={mockStudents}
            studentNotes={studentNotes}
            onNoteChange={handleNoteChange}
            onStudentSelect={handleStudentSelect}
            onBackToClasses={handleBackToClasses}
          />
        )}
        
        {currentView === 'student-detail' && (
          <StudentDetail 
            selectedClass={selectedClass}
            selectedStudent={selectedStudent}
            studentNotes={studentNotes}
            onNoteChange={handleNoteChange}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return <LoginPage onLogin={handleLogin} />;
};

export default App;