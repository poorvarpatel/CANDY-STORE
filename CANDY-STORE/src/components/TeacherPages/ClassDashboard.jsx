import React, { useState, useEffect } from 'react';
import { Play, Settings, Users, Plus, Upload, FileText, Loader2 } from 'lucide-react';
import GameRoomCreator from './GameRoomCreator';

const ClassDashboard = ({ 
  selectedClass, 
  students, 
  studentNotes, 
  onNoteChange, 
  studentFocusGoals,
  onFocusGoalChange,
  onStudentSelect, 
  onBackToClasses,
  // General lesson props
  generalLessonContent,
  generalLessonFiles,
  onGeneralLessonChange,
  personalizedContent,
  onProcessContent,
  isProcessing
}) => {
  const [expandedNotes, setExpandedNotes] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState(generalLessonFiles || []);
  const [showGameCreator, setShowGameCreator] = useState(false);

  // Auto-sync uploaded files to parent
  useEffect(() => {
    onGeneralLessonChange(generalLessonContent, uploadedFiles);
  }, [uploadedFiles]);

  const toggleNotes = (studentId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContentChange = (e) => {
    // Auto-sync content changes to all students immediately
    onGeneralLessonChange(e.target.value, uploadedFiles);
  };

  const handleProcessContent = async () => {
    // Process content for all students using their individual data
    await onProcessContent();
  };

  const handleCreateRooms = (roomConfig) => {
    console.log('🎮 Creating game rooms with config:', roomConfig);
    // Here we'll add backend call to actually create rooms
    setShowGameCreator(false);
  };

  // If showing game creator, render that instead
  if (showGameCreator) {
    return (
      <GameRoomCreator
        students={students}
        conceptSummary={generalLessonContent}
        onCreateRooms={handleCreateRooms}
        onBack={() => setShowGameCreator(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToClasses}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Classes
              </button>
              <h1 className="text-2xl font-bold text-gray-800">{selectedClass?.name}</h1>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowGameCreator(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Create Game Rooms</span>
              </button>
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Ready to create engaging learning experiences?</h2>
          <p className="text-indigo-100">Add general lesson content and process it to create personalized content for each student.</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h3>
            <p className="text-gray-600 text-sm">3 students completed games today</p>
            <p className="text-gray-600 text-sm">2 new lesson plans uploaded this week</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Class Performance</h3>
            <p className="text-gray-600 text-sm">Average accuracy: 78.4%</p>
            <p className="text-gray-600 text-sm">Most challenging topic: DNA Structure</p>
          </div>
        </div>

        {/* General Lesson Content */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              General Lesson Content
            </h2>
            <p className="text-gray-600 text-sm mt-1">Content here will automatically appear in all student profiles</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files (Auto-syncs to all students)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload lesson files</p>
                <p className="text-xs text-gray-500 mb-4">Supports PDF, DOC, DOCX, JPG, XLS, PPT</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
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

            {/* Text Input - Auto-syncs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Content (Auto-syncs to all students)
              </label>
              <textarea
                value={generalLessonContent}
                onChange={handleContentChange}
                placeholder="Type your general lesson content here. This will automatically appear in all student profiles..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y h-40"
              />
              <p className="text-xs text-gray-500 mt-1">✨ Auto-saves and syncs to all students as you type</p>
            </div>

            {/* Process Content Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Create Personalized Content</h4>
              <p className="text-sm text-blue-700 mb-4">
                Process the general lesson content along with each student's notes and goals to create personalized learning content for every student.
              </p>
              <button
                onClick={handleProcessContent}
                disabled={!generalLessonContent.trim() && uploadedFiles.length === 0}
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
                    <span>Process Content for All Students</span>
                  </>
                )}
              </button>
              
              {personalizedContent && Object.keys(personalizedContent).length > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Personalized content created for {Object.keys(personalizedContent).length} students. 
                    Click on student names below to view their personalized content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Students ({students.length})
            </h2>
            {generalLessonContent && (
              <p className="text-sm text-green-600 mt-1">✓ General lesson content is synced to all students</p>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {students.map(student => (
              <div key={student.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <button
                      onClick={() => onStudentSelect(student)}
                      className="text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors text-left"
                    >
                      {student.name}
                    </button>
                    <p className="text-gray-600 text-sm mt-1">{student.email}</p>
                    {personalizedContent && personalizedContent[student.id] && (
                      <p className="text-xs text-blue-600 mt-1">✨ Has personalized content ready</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => toggleNotes(student.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className={`w-4 h-4 transition-transform ${expandedNotes[student.id] ? 'rotate-45' : ''}`} />
                    <span className="text-sm">Add Notes</span>
                  </button>
                </div>
                
                {expandedNotes[student.id] && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learning Focus Goals
                      </label>
                      <textarea
                        value={studentFocusGoals[student.id] || ''}
                        onChange={(e) => onFocusGoalChange(student.id, e.target.value)}
                        placeholder="Specific learning goals for this student (e.g., 'Focus on nucleus components from provided list')"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-16"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        General Notes
                      </label>
                      <textarea
                        value={studentNotes[student.id] || student.notes || ''}
                        onChange={(e) => onNoteChange(student.id, e.target.value)}
                        placeholder="Add notes about this student's learning needs, struggles, or strengths..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-20"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Notes auto-save as you type and will be used to personalize content</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDashboard;