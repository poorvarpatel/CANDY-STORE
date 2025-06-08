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
    { id: 1, name: "Biology 101", studentCount: 8 },
    { id: 2, name: "Advanced Biology", studentCount: 8 },
    { id: 3, name: "AP Biology", studentCount: 8 }
  ]
};

const mockStudents = [
  { id: 1, name: "Alice Anderson", email: "alice.a@school.edu", notes: "" },
  { id: 2, name: "Bob Chen", email: "bob.c@school.edu", notes: "Struggles with cell division concepts" },
  { id: 3, name: "Emma Davis", email: "emma.d@school.edu", notes: "" },
  { id: 4, name: "James Wilson", email: "james.w@school.edu", notes: "Excellent at memorization, needs help with application" },
  { id: 5, name: "Maria Garcia", email: "maria.g@school.edu", notes: "" },
  { id: 6, name: "Oliver Kim", email: "oliver.k@school.edu", notes: "Visual learner, responds well to diagrams" },
  { id: 7, name: "Sophia Lee", email: "sophia.l@school.edu", notes: "" },
  { id: 8, name: "Liam Masterson", email: "liam.m@school.edu", notes: "Needs to review mitosis" },
];

const App = () => {
  // User authentication state
  const [currentUser, setCurrentUser] = useState(null);
  
  // Teacher flow state
  const [currentView, setCurrentView] = useState('classes');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentNotes, setStudentNotes] = useState({});
  const [studentFocusGoals, setStudentFocusGoals] = useState({});

  // General lesson state (auto-syncs to all students)
  const [generalLessonContent, setGeneralLessonContent] = useState('');
  const [generalLessonFiles, setGeneralLessonFiles] = useState([]);

  // Personalized content per student (generated from processing)
  const [personalizedContent, setPersonalizedContent] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

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
    setStudentFocusGoals({});
    setGeneralLessonContent('');
    setGeneralLessonFiles([]);
    setPersonalizedContent({});
  };

  // Teacher flow handlers
  const handleNoteChange = (studentId, note) => {
    setStudentNotes(prev => ({
      ...prev,
      [studentId]: note
    }));
  };

  const handleFocusGoalChange = (studentId, goal) => {
    setStudentFocusGoals(prev => ({
      ...prev,
      [studentId]: goal
    }));
  };

  // Handle general lesson content changes (auto-sync)
  const handleGeneralLessonChange = (content, files) => {
    setGeneralLessonContent(content);
    setGeneralLessonFiles(files);
    console.log('📚 General lesson content auto-synced to all students');
  };

  // Process content to create personalized content for each student
  const handleProcessContent = async () => {
    if (!generalLessonContent.trim() && generalLessonFiles.length === 0) {
      console.log('No general content to process');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create personalized content for each student
      const newPersonalizedContent = {};
      
      for (const student of mockStudents) {
        const studentNote = studentNotes[student.id] || student.notes || '';
        
        // Simulate AI processing - would be replaced with real API call
        const personalizedText = await simulateAIProcessing(
          generalLessonContent,
          generalLessonFiles,
          student,
          studentNote
        );
        
        newPersonalizedContent[student.id] = personalizedText;
      }
      
      setPersonalizedContent(newPersonalizedContent);
      console.log('✨ Personalized content generated for all students');
      
    } catch (error) {
      console.error('Error processing content:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate AI processing (replace with real API call)
  const simulateAIProcessing = async (content, files, student, notes) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const fileInfo = files.length > 0 ? `\n\nShared Files: ${files.map(f => f.name).join(', ')}` : '';
    
    return `⚠️ Backend not running yet!

When the backend is ready, here's what will be generated for ${student.name}:

🎯 PERSONALIZED LEARNING CONTENT:

📚 General Lesson Context:
${content.substring(0, 200)}${content.length > 200 ? '...' : ''}${fileInfo}

👤 Student Profile:
- Name: ${student.name}
- Notes: ${notes || 'No specific notes'}

🧠 AI-Generated Personalized Content:
1. Key concepts tailored to ${student.name}'s learning style
2. Specific focus areas based on teacher notes
3. 8-12 personalized quiz questions
4. Difficulty adjustments based on student's strengths/struggles
5. Visual aids recommendations (especially for visual learners)
6. Practice exercises targeting identified weak areas

✅ Next step: Build backend API to generate real personalized content using AI.

This content was generated from:
- General lesson: "${content.substring(0, 50)}..."
- Student notes: "${notes.substring(0, 50)}..."`;
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

  // Teacher flow
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
            studentFocusGoals={studentFocusGoals}
            onFocusGoalChange={handleFocusGoalChange}
            onStudentSelect={handleStudentSelect}
            onBackToClasses={handleBackToClasses}
            // General lesson props
            generalLessonContent={generalLessonContent}
            generalLessonFiles={generalLessonFiles}
            onGeneralLessonChange={handleGeneralLessonChange}
            personalizedContent={personalizedContent}
            onProcessContent={handleProcessContent}
            isProcessing={isProcessing}
          />
        )}
        
        {currentView === 'student-detail' && (
          <StudentDetail 
            selectedClass={selectedClass}
            selectedStudent={selectedStudent}
            studentNotes={studentNotes}
            onNoteChange={handleNoteChange}
            studentFocusGoals={studentFocusGoals}
            onFocusGoalChange={handleFocusGoalChange}
            onBackToDashboard={handleBackToDashboard}
            // General lesson props
            generalLessonContent={generalLessonContent}
            generalLessonFiles={generalLessonFiles}
            personalizedContent={personalizedContent}
          />
        )}
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return <LoginPage onLogin={handleLogin} />;
};

export default App;