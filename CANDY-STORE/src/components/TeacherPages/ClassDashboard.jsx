import React, { useState } from 'react';
import { Play, Settings, Users, Plus } from 'lucide-react';

const ClassDashboard = ({ 
  selectedClass, 
  students, 
  studentNotes, 
  onNoteChange, 
  onStudentSelect, 
  onBackToClasses 
}) => {
  const [expandedNotes, setExpandedNotes] = useState({});

  const toggleNotes = (studentId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

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
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
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
          <p className="text-indigo-100">Upload lesson content and create personalized quiz games for your students.</p>
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

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Students ({students.length})
            </h2>
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
                  <div className="mt-4">
                    <textarea
                      value={studentNotes[student.id] || student.notes || ''}
                      onChange={(e) => onNoteChange(student.id, e.target.value)}
                      placeholder="Add notes about this student's learning needs, struggles, or strengths..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-20"
                    />
                    <p className="text-xs text-gray-500 mt-2">Notes auto-save as you type</p>
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