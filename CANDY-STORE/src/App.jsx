import React, { useState, useEffect } from 'react';
import ClassSelection from './components/ClassSelection.jsx';
import ClassDashboard from './components/ClassDashboard.jsx';
import StudentDetail from './components/StudentDetail.jsx';


<div className="bg-red-500 text-white p-4">
  If this is red with white text, Tailwind is working!
</div>

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

  // Render current view
  if (currentView === 'classes') {
    return (
      <ClassSelection 
        teacher={mockTeacher}
        onClassSelect={handleClassSelect}
      />
    );
  } else if (currentView === 'dashboard') {
    return (
      <ClassDashboard 
        selectedClass={selectedClass}
        students={mockStudents}
        studentNotes={studentNotes}
        onNoteChange={handleNoteChange}
        onStudentSelect={handleStudentSelect}
        onBackToClasses={handleBackToClasses}
      />
    );
  } else if (currentView === 'student-detail') {
    return (
      <StudentDetail 
        selectedClass={selectedClass}
        selectedStudent={selectedStudent}
        studentNotes={studentNotes}
        onNoteChange={handleNoteChange}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }
};

export default App;