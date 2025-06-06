import React from 'react';
import { ChevronRight, Users, BookOpen } from 'lucide-react';

const ClassSelection = ({ teacher, onClassSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome back, {teacher.name}! 🎓
          </h1>
          <p className="text-xl text-gray-600">Select a class to get started</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacher.classes.map(cls => (
            <div
              key={cls.id}
              onClick={() => onClassSelect(cls)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-8 h-8 text-indigo-600" />
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{cls.name}</h3>
              <p className="text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {cls.studentCount} students
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassSelection;