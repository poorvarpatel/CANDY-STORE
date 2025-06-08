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

  // 🔗 NEW: Quiz assignment state
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);

  // Auto-save notes simulation
  useEffect(() => {
    const saveNotes = () => {
      // Simulate API call to save notes
      console.log('Auto-saving notes:', studentNotes);
    };
    
    const timeoutId = setTimeout(saveNotes, 1000);
    return () => clearTimeout(timeoutId);
  }, [studentNotes]);

  // 🔗 NEW: Load saved quizzes on app start AND when user changes
  useEffect(() => {
    const loadQuizzes = () => {
      const savedQuizzes = localStorage.getItem('assignedQuizzes');
      if (savedQuizzes) {
        try {
          const parsedQuizzes = JSON.parse(savedQuizzes);
          setAssignedQuizzes(parsedQuizzes);
          console.log('📚 Loaded quizzes from localStorage:', parsedQuizzes.length);
        } catch (error) {
          console.error('Error loading saved quizzes:', error);
          setAssignedQuizzes([]);
        }
      }
    };

    loadQuizzes();
  }, [currentUser]); // 🔗 Re-load when user changes

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
    // Reset all state EXCEPT assignedQuizzes (those should persist)
    setCurrentView('classes');
    setSelectedClass(null);
    setSelectedStudent(null);
    setStudentNotes({});
    setStudentFocusGoals({});
    setGeneralLessonContent('');
    setGeneralLessonFiles([]);
    setPersonalizedContent({});
    // 🔗 FIXED: Don't clear assignedQuizzes - they should persist across logins
    console.log('👋 Logged out, but quizzes persist in localStorage');
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

  // 🔗 NEW: Enhanced quiz assignment with better persistence
  const handleAssignQuiz = async (quizAssignment) => {
    try {
      // Add the quiz to the shared state
      const updatedQuizzes = [...assignedQuizzes, quizAssignment];
      setAssignedQuizzes(updatedQuizzes);
      
      // Save to localStorage for persistence
      localStorage.setItem('assignedQuizzes', JSON.stringify(updatedQuizzes));
      
      console.log('✅ Quiz assigned and saved:', quizAssignment);
      console.log('📚 Total quizzes now:', updatedQuizzes.length);
      console.log('💾 localStorage updated');
      
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Error assigning quiz:', error);
      throw error;
    }
  };

  // 🔗 NEW: Handle quiz completion by student
  const handleQuizComplete = (quizId, results) => {
    const updatedQuizzes = assignedQuizzes.map(quiz => 
      quiz.id === quizId 
        ? { ...quiz, status: 'completed', results, completedAt: new Date().toISOString() }
        : quiz
    );
    
    setAssignedQuizzes(updatedQuizzes);
    localStorage.setItem('assignedQuizzes', JSON.stringify(updatedQuizzes));
    
    console.log('✅ Quiz completed:', quizId, results);
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
    
    return `🎯 PERSONALIZED QUIZ FOR ${student.name.toUpperCase()}

📚 Based on General Lesson: ${content.substring(0, 200)}${content.length > 200 ? '...' : ''}${fileInfo}
🎯 Student Focus: ${studentFocusGoals[student.id] || 'General biology concepts'}

🔬 PERSONALIZED QUESTIONS:

1. Cell Membrane Structure
   Q: What are the main components of the cell membrane that ${student.name} should focus on?
   A) Phospholipids, proteins, cholesterol
   B) Only proteins
   C) Only phospholipids
   Correct: A

2. Nucleus Function
   Q: Based on your learning goals, describe the nucleus role in:
   A) Protein synthesis control
   B) Energy production  
   C) Waste removal
   Correct: A

3. Mitochondria Energy
   Q: How do mitochondria produce ATP for cellular energy?
   [Student should explain the electron transport chain]

4. Cell Division Phases
   Q: Order these mitosis phases: Metaphase, Prophase, Anaphase, Telophase
   Correct Order: Prophase → Metaphase → Anaphase → Telophase

5. DNA vs RNA Differences
   Q: What makes RNA different from DNA in structure and function?
   [Open-ended response focusing on ${student.name}'s weak areas]

🎮 INTERACTIVE ELEMENTS:
- Drag-and-drop organelle matching
- Timeline sequencing for cell division
- Virtual microscope simulation
- Concept mapping exercises

✅ DIFFICULTY: Adapted for ${student.name}'s current level
🎯 FOCUS AREAS: ${notes || 'Core concepts'}
📊 ESTIMATED TIME: 15-20 minutes
🏆 SUCCESS CRITERIA: 80% accuracy with explanations`;
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
    // 🔗 NEW: Check quiz persistence on login page
    const savedQuizCount = (() => {
      try {
        const saved = localStorage.getItem('assignedQuizzes');
        return saved ? JSON.parse(saved).length : 0;
      } catch {
        return 0;
      }
    })();

    return (
      <div>
        <LoginPage onLogin={handleLogin} />
        {/* 🔗 DEBUG: Show persisted quiz count */}
        {savedQuizCount > 0 && (
          <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <div className="font-semibold text-green-800">✅ Quizzes Persisted</div>
            <div className="text-green-700">{savedQuizCount} quiz{savedQuizCount !== 1 ? 'es' : ''} saved</div>
          </div>
        )}
      </div>
    );
  }

  // Student flow
  if (currentUser.role === 'student') {
    // 🔗 IMPROVED: Better student quiz filtering with debugging
    const currentStudentId = mockStudents.find(s => s.name === currentUser.name)?.id;
    const studentQuizzes = assignedQuizzes.filter(quiz => quiz.studentId === currentStudentId);
    
    console.log(`👩‍🎓 Student ${currentUser.name} (ID: ${currentStudentId}) has ${studentQuizzes.length} assigned quizzes`);
    console.log('All quizzes:', assignedQuizzes.length);

    return (
      <div>
        {/* Add logout button for testing */}
        <div className="fixed top-4 right-4 z-50 flex space-x-2">
          {/* 🔗 NEW: Debug info */}
          {/* <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1 text-xs">
            Quizzes: {studentQuizzes.length}
          </div> */}
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
          assignedQuizzes={studentQuizzes} // 🔗 NEW: Pass filtered quizzes
          onQuizComplete={handleQuizComplete} // 🔗 NEW: Pass completion handler
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
            onAssignQuiz={handleAssignQuiz} // 🔗 NEW: Pass quiz assignment handler
          />
        )}
        
        {/* 🔗 IMPROVED: Enhanced quiz status indicator with refresh */}
        <div className="fixed bottom-4 left-4 bg-white border rounded-lg shadow-lg p-3 text-sm">
          <div className="font-semibold text-gray-800 mb-2">📊 Quiz Management</div>
          <div className="space-y-1 text-gray-600">
            <div>Total Assigned: {assignedQuizzes.length}</div>
            <div>Completed: {assignedQuizzes.filter(q => q.status === 'completed').length}</div>
            <div>Pending: {assignedQuizzes.filter(q => q.status !== 'completed').length}</div>
            <button 
              onClick={() => {
                const saved = localStorage.getItem('assignedQuizzes');
                if (saved) {
                  setAssignedQuizzes(JSON.parse(saved));
                  console.log('🔄 Refreshed quiz data from localStorage');
                }
              }}
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return <LoginPage onLogin={handleLogin} />;
};

export default App;