import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const StudentDetail = ({ 
  selectedClass, 
  selectedStudent, 
  studentNotes, 
  onNoteChange, 
  onBackToDashboard 
}) => {
  const [chartView, setChartView] = useState('accuracy');

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

        {/* File Upload Area for Student */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors p-8 mb-8">
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Lesson Content for {selectedStudent?.name}</h3>
            <p className="text-gray-600 mb-4">Create personalized learning content for this student</p>
            <div className="mb-4">
              <textarea 
                placeholder="Optional: Add specific learning goals or focus areas for this student (e.g., 'Focus on nucleus components from provided list')"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-20 mb-4"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">Supports PDF, DOC, DOCX, JPG, XLS, PPT and more</p>
            <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Choose Files
            </button>
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