import React, { useState } from 'react';
import { BookOpen, FileText, User, Upload, Loader2, Play, Download, Send } from 'lucide-react';
import GameBoard from '../GameBoard/Gameboard'; // Import GameBoard

const StudentDetail = ({ 
  selectedClass, 
  selectedStudent, 
  studentNotes, 
  onNoteChange, 
  studentFocusGoals,
  onFocusGoalChange,
  onBackToDashboard,
  // General lesson props
  generalLessonContent,
  generalLessonFiles,
  personalizedContent,
  onAssignQuiz // 🔗 NEW: Function to assign quiz to student
}) => {
  const [chartView, setChartView] = useState('accuracy');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [lessonContent, setLessonContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conceptSummary, setConceptSummary] = useState('');
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false); // 🔗 NEW: Loading state for assignment

  // Get this student's personalized content
  const studentPersonalizedContent = personalizedContent && personalizedContent[selectedStudent?.id];
  const highlightColors = [
    'bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-pink-100', 'bg-purple-100', 'bg-orange-100'
  ];

  // 🔗 NEW: Function to assign the personalized quiz to the student
  const handleAssignQuizToStudent = async () => {
    const contentToAssign = studentPersonalizedContent || conceptSummary;
    
    if (!contentToAssign) {
      alert('Please generate personalized content first before assigning a quiz!');
      return;
    }

    setIsAssigning(true);
    
    try {
      // Create quiz assignment object
      const quizAssignment = {
        id: Date.now(), // Simple ID generation
        title: `Personalized Quiz - ${selectedStudent?.name}`,
        content: contentToAssign,
        studentId: selectedStudent?.id,
        studentName: selectedStudent?.name,
        className: selectedClass?.name,
        teacher: "Ms. Johnson", // You can make this dynamic
        assignedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Due in 1 week
        difficulty: "Personalized",
        topic: "Biology",
        status: "assigned",
        playerCount: "Personalized Game",
        focusAreas: studentFocusGoals[selectedStudent?.id] || '',
        teacherNotes: studentNotes[selectedStudent?.id] || '',
        type: "personalized" // 🔗 NEW: Mark as personalized quiz
      };

      // Call the parent function to assign the quiz
      if (onAssignQuiz) {
        await onAssignQuiz(quizAssignment);
        alert(`✅ Personalized quiz successfully assigned to ${selectedStudent?.name}!\n\nThe student will see this in their dashboard as a new assignment.`);
      } else {
        // Fallback - in a real app, this would call an API
        console.log('Quiz assigned:', quizAssignment);
        alert('Quiz assignment created! (Note: onAssignQuiz prop not provided)');
      }
      
    } catch (error) {
      console.error('Error assigning quiz:', error);
      alert('Error assigning quiz. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  // Export content as PDF
  const handleExportContent = async () => {
    setIsExporting(true);
    
    try {
      const contentToExport = studentPersonalizedContent || conceptSummary;
      const currentDate = new Date().toLocaleDateString();
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate the HTML content for the PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Personalized Content - ${selectedStudent?.name}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #4F46E5;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #4F46E5;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .meta-info {
              background: #F3F4F6;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .meta-info h3 {
              margin-top: 0;
              color: #374151;
            }
            .content {
              white-space: pre-wrap;
              font-family: 'Courier New', monospace;
              background: #F9FAFB;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #10B981;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #E5E7EB;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Personalized Learning Content</h1>
            <p><strong>Student:</strong> ${selectedStudent?.name}</p>
            <p><strong>Class:</strong> ${selectedClass?.name}</p>
            <p><strong>Generated:</strong> ${currentDate}</p>
          </div>
          
          <div class="meta-info">
            <h3>Student Information</h3>
            <p><strong>Focus Goals:</strong> ${studentFocusGoals[selectedStudent?.id] || 'No specific focus areas set'}</p>
            <p><strong>Teacher Notes:</strong> ${studentNotes[selectedStudent?.id] || selectedStudent?.notes || 'No notes available'}</p>
          </div>
          
          <div class="content">
${contentToExport}
          </div>
          
          <div class="footer">
            <p>Generated by AI Educational Assistant | ${currentDate}</p>
            <p>This personalized content was created specifically for ${selectedStudent?.name}</p>
          </div>
        </body>
        </html>
      `;
      
      // Write content and trigger print
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait a bit for content to load, then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing (user can cancel this)
        printWindow.onafterprint = () => {
          printWindow.close();
        };
        
        setIsExporting(false);
      }, 500);
      
    } catch (error) {
      console.error('Error exporting content:', error);
      alert('Error exporting content. Please try again.');
      setIsExporting(false);
    }
  };

  // Launch the game with personalized content (for teacher preview)
  const handleLaunchGame = () => {
    const contentToUse = studentPersonalizedContent || conceptSummary;
    if (!contentToUse) {
      alert('Please generate personalized content first before creating a quiz game!');
      return;
    }
    setIsPlayingGame(true);
  };

  // Exit game and return to student detail
  const handleExitGame = () => {
    setIsPlayingGame(false);
  };

  // If in game mode, show GameBoard instead
  if (isPlayingGame) {
    const contentToUse = studentPersonalizedContent || conceptSummary;
    return (
      <GameBoard
        pathTiles={null} // TODO: Generate or get path tiles
        questionsData={contentToUse}
        studentName={selectedStudent?.name}
        onExitGame={handleExitGame}
        gameData={{
          mode: 'practice',
          title: `${selectedStudent?.name}'s Personalized Quiz Preview`,
          personalizedContent: contentToUse
        }}
      />
    );
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processLessonContent = async () => {
    setIsProcessing(true);
    try {
      // Combine uploaded files and text content
      let contentToProcess = lessonContent;
      
      if (!contentToProcess.trim() && uploadedFiles.length > 0) {
        contentToProcess = `Uploaded files: ${uploadedFiles.map(f => f.name).join(', ')}. Please process these files for personalized educational content.`;
      }
      
      // Combine general lesson with personalized content
      const combinedContent = `
GENERAL LESSON CONTENT:
${generalLessonContent || 'No general lesson content'}

PERSONALIZED FOCUS FOR ${selectedStudent?.name}:
${studentFocusGoals[selectedStudent?.id] || 'No specific focus areas'}

ADDITIONAL PERSONALIZED CONTENT:
${contentToProcess || 'No additional content'}

STUDENT NOTES:
${studentNotes[selectedStudent?.id] || selectedStudent?.notes || 'No student notes'}
      `.trim();

      // Call backend API for personalized content (will build this next)
      const response = await fetch('http://localhost:3001/api/process-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: combinedContent,
          type: 'student', // Indicates this is for individual student
          studentName: selectedStudent?.name,
          studentFocus: studentFocusGoals[selectedStudent?.id] || '',
          className: selectedClass?.name
        })
      });

      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.content) {
        setConceptSummary(result.content);
      } else {
        throw new Error(result.error || 'Failed to process content');
      }
      
    } catch (error) {
      console.error('Error processing lesson:', error);
      
      // For now, show a helpful message about the backend
      if (error.message.includes('fetch')) {
        setConceptSummary(`🎯 PERSONALIZED QUIZ FOR ${selectedStudent?.name.toUpperCase()}

📚 Based on General Lesson: ${generalLessonContent ? 'Cell Biology Fundamentals' : 'No base lesson'}
🎯 Student Focus: ${studentFocusGoals[selectedStudent?.id] || 'General biology concepts'}

🔬 PERSONALIZED QUESTIONS:

1. Cell Membrane Structure
   Q: What are the main components of the cell membrane that ${selectedStudent?.name} should focus on?
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
   [Open-ended response focusing on ${selectedStudent?.name}'s weak areas]

🎮 INTERACTIVE ELEMENTS:
- Drag-and-drop organelle matching
- Timeline sequencing for cell division
- Virtual microscope simulation
- Concept mapping exercises

✅ DIFFICULTY: Adapted for ${selectedStudent?.name}'s current level
🎯 FOCUS AREAS: ${studentFocusGoals[selectedStudent?.id] || 'Core concepts'}
📊 ESTIMATED TIME: 15-20 minutes
🏆 SUCCESS CRITERIA: 80% accuracy with explanations`);
      } else {
        setConceptSummary(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const mockImprovementData = [
    { date: '2/1', sessions: 1, totalQuestions: 8 },
    { date: '2/3', sessions: 1, totalQuestions: 12 },
    { date: '2/6', sessions: 3, totalQuestions: 24 },
    { date: '2/8', sessions: 1, totalQuestions: 10 },
    { date: '2/10', sessions: 1, totalQuestions: 15 },
    { date: '2/12', sessions: 1, totalQuestions: 18 },
    { date: '2/15', sessions: 1, totalQuestions: 14 },
    { date: '2/17', sessions: 1, totalQuestions: 16 },
    { date: '2/19', sessions: 1, totalQuestions: 22 },
    { date: '2/22', sessions: 1, totalQuestions: 19 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToDashboard}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to {selectedClass?.name}
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{selectedStudent?.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Teacher Notes */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Teacher Notes
            </h2>
          </div>
          <div className="p-6">
            <textarea
              value={studentNotes[selectedStudent?.id] || selectedStudent?.notes || ''}
              onChange={(e) => onNoteChange(selectedStudent?.id, e.target.value)}
              placeholder="Add notes about this student's learning patterns, strengths, and areas for improvement..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-32"
            />
            <p className="text-xs text-gray-500 mt-2">Notes auto-save as you type and are used to create personalized content</p>
          </div>
        </div>

        {/* General Lesson Section - Auto-synced from ClassDashboard */}
        {(generalLessonContent || (generalLessonFiles && generalLessonFiles.length > 0)) && (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                General Lesson Content
              </h2>
              <p className="text-gray-600 text-sm mt-1">Content automatically synced from class dashboard</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Display general lesson files */}
              {generalLessonFiles && generalLessonFiles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shared Files
                  </label>
                  <div className="space-y-2">
                    {generalLessonFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <span className="text-sm text-blue-700">{file.name}</span>
                        <span className="text-xs text-blue-600">Shared file</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General lesson content - read-only, auto-synced */}
              {generalLessonContent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    General Content
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 min-h-32">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{generalLessonContent}</pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    This content is automatically synced from the class dashboard
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personalized Content Input Section */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Create Personalized Content for {selectedStudent?.name}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Add specific focus areas and content for this student - this will be combined with the general lesson</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Student Focus Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Focus Goals for {selectedStudent?.name}
              </label>
              <textarea
                value={studentFocusGoals[selectedStudent?.id] || ''}
                onChange={(e) => onFocusGoalChange(selectedStudent?.id, e.target.value)}
                placeholder="Specific learning goals or focus areas for this student (e.g., 'Focus on nucleus components from provided list')"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-20"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Additional Lesson Files for {selectedStudent?.name}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload lesson files for additional personalized content</p>
                <p className="text-xs text-gray-500 mb-4">Supports PDF, DOC, DOCX, JPG, XLS, PPT</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="student-file-upload"
                />
                <label
                  htmlFor="student-file-upload"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer inline-block"
                >
                  Choose Files
                </label>
              </div>
              
              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Personalized Content for {selectedStudent?.name}
              </label>
              <textarea
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Add additional content specific to this student (this will be combined with the general lesson)..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y h-32"
              />
            </div>

            {/* Process Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Generate Personalized Learning Content</h4>
              <p className="text-sm text-blue-700 mb-4">
                Combine the general lesson with this student's specific focus areas and additional content to create personalized questions and learning materials.
              </p>
              <button
                onClick={processLessonContent}
                disabled={!generalLessonContent && !lessonContent.trim() && uploadedFiles.length === 0}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Personalized Content...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Create Personalized Content</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Personalized Content Section - 🔗 UPDATED WITH ASSIGNMENT BUTTON */}
        {(studentPersonalizedContent || conceptSummary) && (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Generated Personalized Content for {selectedStudent?.name}
              </h2>
              <p className="text-gray-600 text-sm mt-1">AI-generated content based on general lesson + personalized focus</p>
            </div>
            
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">AI-Generated Personalized Learning Content</h4>
                
                {/* SCROLLABLE CONTENT AREA */}
                <div className="max-h-96 overflow-y-auto border border-green-300 rounded-md bg-white">
                  <pre className="text-sm text-green-700 whitespace-pre-wrap p-4 font-sans leading-relaxed">
                    {studentPersonalizedContent || conceptSummary}
                  </pre>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  {/* 🔗 UPDATED: Now assigns quiz to student instead of launching locally */}
                  <button 
                    onClick={handleAssignQuizToStudent}
                    disabled={isAssigning}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center space-x-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Assigning...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>📤 Assign Quiz to {selectedStudent?.name}</span>
                      </>
                    )}
                  </button>
                  
                  {/* <button 
                    onClick={handleLaunchGame}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>👀 Preview Quiz Game</span>
                  </button> */}
                  
                  {/* WORKING EXPORT BUTTON */}
                  <button 
                    onClick={handleExportContent}
                    disabled={isExporting}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center space-x-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={processLessonContent}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Regenerate
                  </button>
                  <button 
                    onClick={() => setConceptSummary('')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Analytics with Tab-style Interface */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 pb-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Analytics</h2>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setChartView('games')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${
                  chartView === 'games' 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm">Games Played</div>
              </button>
              <button
                onClick={() => setChartView('accuracy')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${
                  chartView === 'accuracy' 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold">147/183</div>
                <div className="text-sm">Overall Accuracy 80.3%</div>
              </button>
              <button
                onClick={() => setChartView('improvement')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${
                  chartView === 'improvement' 
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl font-bold">+12%</div>
                <div className="text-sm">Improvement Last 30 Days</div>
              </button>
            </div>
          </div>
          
          <div className="p-6 pt-6">
            {chartView === 'games' && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Game Activity Calendar</h4>
                <div className="grid grid-cols-7 gap-2">
                  {/* Calendar header */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar dates with activity */}
                  {Array.from({length: 28}, (_, i) => {
                    const day = i + 1;
                    const activityDates = [1, 3, 6, 8, 10, 12, 15, 17, 19, 22];
                    const questionsCount = activityDates.includes(day) ? 
                      (day === 6 ? 24 : day === 19 ? 22 : Math.floor(Math.random() * 15) + 8) : 0;
                    
                    let bgColor = 'bg-gray-100';
                    if (questionsCount > 20) bgColor = 'bg-red-600 text-white';
                    else if (questionsCount > 15) bgColor = 'bg-red-400 text-white';
                    else if (questionsCount > 10) bgColor = 'bg-red-300';
                    else if (questionsCount > 5) bgColor = 'bg-red-200';
                    else if (questionsCount > 0) bgColor = 'bg-red-100';
                    
                    return (
                      <div key={day} className={`text-center p-3 rounded-lg transition-colors ${bgColor} ${questionsCount > 0 ? 'cursor-pointer hover:scale-105' : ''}`}>
                        <div className="text-sm font-medium">{day}</div>
                        {questionsCount > 0 && (
                          <div className="text-xs mt-1">{questionsCount}q</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-100 rounded"></div>
                    <span>1-5 questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-300 rounded"></div>
                    <span>10-15 questions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>20+ questions</span>
                  </div>
                </div>
              </div>
            )}
            
            {chartView === 'accuracy' && (
              <div className="flex">
                {/* Stats in top left corner */}
                <div className="w-1/3">
                  <div className="space-y-4">
                    <div>
                      <p className="text-2xl font-bold text-green-600">147</p>
                      <p className="text-sm text-gray-500">Correct Answers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">183</p>
                      <p className="text-sm text-gray-500">Total Attempts</p>
                    </div>
                  </div>
                </div>
                
                {/* Concept Mastery Chart */}
                <div className="flex-1 pl-8">
                  <h4 className="font-semibold text-gray-800 mb-4">Concept Mastery Breakdown</h4>
                  <div className="space-y-4">
                    {[
                      { topic: "Cell Structure", correct: 15, total: 18, percentage: 83 },
                      { topic: "Mitosis & Meiosis", correct: 12, total: 16, percentage: 75 },
                      { topic: "DNA & RNA", correct: 8, total: 12, percentage: 67 },
                      { topic: "Protein Synthesis", correct: 14, total: 15, percentage: 93 }
                    ].map(item => (
                      <div key={item.topic}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{item.topic}</span>
                          <span className="text-sm text-gray-600">{item.correct}/{item.total} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.percentage >= 80 ? 'bg-green-500' : item.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {chartView === 'improvement' && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-4">Questions Per Session Over Time</h4>
                <div className="relative">
                  {/* Mock histogram chart */}
                  <div className="flex items-end justify-between h-48 bg-gray-50 rounded-lg p-4">
                    {mockImprovementData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center relative">
                        {/* Bars for each session on that date */}
                        <div className="flex items-end space-x-1 mb-2">
                          {Array.from({length: data.sessions}).map((_, sessionIndex) => (
                            <div 
                              key={sessionIndex}
                              className="bg-indigo-500 w-3 rounded-t"
                              style={{height: `${(data.totalQuestions / data.sessions) * 3}px`}}
                            ></div>
                          ))}
                        </div>
                        {/* Total questions indicator dot */}
                        <div 
                          className="w-2 h-2 bg-emerald-500 rounded-full absolute"
                          style={{
                            bottom: `${data.totalQuestions * 3 + 28}px`,
                            left: '50%',
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                        <p className="text-xs text-gray-600 mt-1 transform rotate-45 origin-bottom-left">
                          {data.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;