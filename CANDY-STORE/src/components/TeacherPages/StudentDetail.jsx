import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';

const StudentDetail = ({ 
  selectedClass, 
  selectedStudent, 
  studentNotes, 
  onNoteChange, 
  onBackToDashboard 
}) => {
  const [chartView, setChartView] = useState('accuracy');
  const [studentFocus, setStudentFocus] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [lessonContent, setLessonContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conceptSummary, setConceptSummary] = useState('');

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

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const autoPopulateFocus = (shouldPopulate) => {
    if (shouldPopulate) {
      const notes = studentNotes[selectedStudent?.id] || selectedStudent?.notes || '';
      setStudentFocus(notes);
    } else {
      setStudentFocus('');
    }
  };

  const processLessonContent = async () => {
    setIsProcessing(true);
    try {
      // Combine uploaded files and text content
      let contentToProcess = lessonContent;
      
      if (!contentToProcess.trim() && uploadedFiles.length > 0) {
        contentToProcess = `Uploaded files: ${uploadedFiles.map(f => f.name).join(', ')}. Please process these files for personalized educational content.`;
      }
      
      if (!contentToProcess.trim()) {
        throw new Error('No content to process');
      }

      // Call backend API for personalized content (will build this next)
      const response = await fetch('http://localhost:3001/api/process-lesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: contentToProcess,
          type: 'student', // Indicates this is for individual student
          studentName: selectedStudent?.name,
          studentFocus: studentFocus,
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
        setConceptSummary(`⚠️ Backend not running yet!

We'll build the backend next. For now, here's what the AI will generate for ${selectedStudent?.name}:

👤 Personalized Content:
1. Key concepts relevant to student's focus areas
2. Customized learning objectives  
3. Targeted topics for this student
4. 8-12 personalized quiz questions

🎯 Student Focus: ${studentFocus || 'General learning goals'}

✅ Next step: Create the backend API to process this content with real AI.

Your content was: "${contentToProcess.substring(0, 100)}..."`);
      } else {
        setConceptSummary(`❌ Error: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
            <h2 className="text-xl font-bold text-gray-800">Teacher Notes</h2>
          </div>
          <div className="p-6">
            <textarea
              value={studentNotes[selectedStudent?.id] || selectedStudent?.notes || ''}
              onChange={(e) => onNoteChange(selectedStudent?.id, e.target.value)}
              placeholder="Add notes about this student's learning patterns, strengths, and areas for improvement..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-32"
            />
            <p className="text-xs text-gray-500 mt-2">Notes auto-save as you type</p>
          </div>
        </div>

        {/* Lesson Plan Processor for Individual Student */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Create Personalized Content for {selectedStudent?.name}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Upload lesson content or paste text to create personalized learning experiences</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Student Focus Goals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Learning Focus Goals for {selectedStudent?.name}
                </label>
                <label className="flex items-center space-x-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    onChange={(e) => autoPopulateFocus(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Auto-populate from teacher notes</span>
                </label>
              </div>
              <textarea
                value={studentFocus}
                onChange={(e) => setStudentFocus(e.target.value)}
                placeholder="Specific learning goals or focus areas for this student (e.g., 'Focus on nucleus components from provided list')"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-20"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Lesson Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload lesson files for personalized content</p>
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
                Or Paste Lesson Content
              </label>
              <textarea
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                placeholder="Paste your lesson content here for personalized processing..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y h-32"
              />
            </div>

            {/* Process Button */}
            <button
              onClick={processLessonContent}
              disabled={!lessonContent.trim() && uploadedFiles.length === 0}
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

            {/* Concept Summary */}
            {conceptSummary && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">AI-Generated Personalized Content</h4>
                <pre className="text-sm text-green-700 whitespace-pre-wrap">{conceptSummary}</pre>
                <div className="mt-4 flex space-x-3">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Approve & Create Individual Session
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
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

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