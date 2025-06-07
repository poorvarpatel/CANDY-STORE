import React, { useState } from 'react';
import { GraduationCap, BookOpen, Users, Brain } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role, userData) => {
    onLogin(role, userData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            CANDY STORE
          </h1>
          <p className="text-xl text-gray-600">
            For Graduates of CANDY LAND (R)
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Teacher Card */}
          <div 
            className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 ${
              selectedRole === 'teacher' ? 'border-indigo-500 ring-4 ring-indigo-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedRole('teacher')}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-indigo-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Teacher Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Create personalized learning games, track student progress, and manage your classroom.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Manage students and classes</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Create custom quiz games</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Track learning progress</span>
                </div>
              </div>

              {selectedRole === 'teacher' && (
                <div className="space-y-3">
                  <button
                    onClick={() => handleRoleSelect('teacher', {
                      name: 'Ms. Johnson',
                      email: 'johnson@school.edu',
                      classes: ['Biology 101', 'Advanced Biology', 'AP Biology']
                    })}
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Continue as Ms. Johnson
                  </button>
                  <p className="text-xs text-gray-500">Demo teacher account</p>
                </div>
              )}
              
              {selectedRole !== 'teacher' && (
                <button className="w-full bg-gray-100 text-gray-400 py-3 px-6 rounded-lg cursor-not-allowed font-semibold">
                  Select Teacher Role
                </button>
              )}
            </div>
          </div>

          {/* Student Card */}
          <div 
            className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 ${
              selectedRole === 'student' ? 'border-purple-500 ring-4 ring-purple-200' : 'border-gray-200'
            }`}
            onClick={() => setSelectedRole('student')}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-purple-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Portal</h2>
              <p className="text-gray-600 mb-6">
                Join exciting learning games, practice at your own pace, and track your progress.
              </p>
              
              <div className="space-y-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Play with classmates</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Solo practice mode</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Track your achievements</span>
                </div>
              </div>

              {selectedRole === 'student' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleRoleSelect('student', {
                        name: 'Emma Davis',
                        email: 'emma.d@school.edu',
                        class: 'Biology 101',
                        teacher: 'Ms. Johnson'
                      })}
                      className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                    >
                      Emma D.
                    </button>
                    <button
                      onClick={() => handleRoleSelect('student', {
                        name: 'Alice Anderson',
                        email: 'alice.a@school.edu',
                        class: 'Biology 101',
                        teacher: 'Ms. Johnson'
                      })}
                      className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                    >
                      Alice A.
                    </button>
                    <button
                      onClick={() => handleRoleSelect('student', {
                        name: 'Bob Chen',
                        email: 'bob.c@school.edu',
                        class: 'Biology 101',
                        teacher: 'Ms. Johnson'
                      })}
                      className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                    >
                      Bob C.
                    </button>
                    <button
                      onClick={() => handleRoleSelect('student', {
                        name: 'James Wilson',
                        email: 'james.w@school.edu',
                        class: 'Biology 101',
                        teacher: 'Ms. Johnson'
                      })}
                      className="bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
                    >
                      James W.
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Demo student accounts</p>
                </div>
              )}
              
              {selectedRole !== 'student' && (
                <button className="w-full bg-gray-100 text-gray-400 py-3 px-6 rounded-lg cursor-not-allowed font-semibold">
                  Select Student Role
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Demo Version - Experience both teacher and student perspectives
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;