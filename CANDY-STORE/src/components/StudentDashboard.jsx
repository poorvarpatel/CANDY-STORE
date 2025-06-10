import React, { useState } from 'react';
import { Play, Calendar, Target, Trophy, Users, BookOpen, Clock } from 'lucide-react';
import GameBoard from './GameBoard/Gameboard';
import PathCreator from './PathCreator/PathCreator';

const StudentDashboard = ({ 
  studentName = "Emma Davis",
  assignedQuizzes = [], // Receive assigned quizzes from teacher
  onQuizComplete // Callback when quiz is completed
}) => {
  const [selectedTab, setSelectedTab] = useState('assigned');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'pathCreator', 'gameBoard'
  const [currentGame, setCurrentGame] = useState(null);
  const [customPath, setCustomPath] = useState(null);

  // Enhanced game handling with better content flow - ALL GAMES go through PathCreator
  const handleJoinGame = (game) => {
    console.log('🎯 StudentDashboard: Starting game:', game.title);
  console.log('🎯 StudentDashboard: Game content exists:', !!game.content);
  console.log('🎯 StudentDashboard: Game content preview:', game.content?.substring(0, 100));
  
    console.log('🎮 StudentDashboard: Starting game:', game);
    
    if (game.type === 'personalized') {
      // For personalized quizzes assigned by teacher
      console.log('📚 Personalized quiz content:', game.content ? 'Present' : 'Missing');
      
      setCurrentGame({
        ...game,
        mode: 'assigned',
        questionsData: game.content, // This is the key - pass the content as questionsData
        personalizedContent: game.content, // Also keep as personalizedContent for backward compatibility
        title: game.title,
        studentName: studentName,
        isPersonalized: true
      });
    } else {
      // For group games, proceed normally
      setCurrentGame({
        ...game,
        mode: 'group',
        studentName: studentName
      });
    }
    
    // 🔧 FIXED: ALL games (including personalized) go through PathCreator
    setCurrentView('pathCreator');
  };

  const handleStartPractice = (game) => {
    console.log('🏃 StudentDashboard: Starting practice mode:', game);
    
    setCurrentGame({ 
      ...game, 
      mode: 'practice',
      studentName: studentName
    });
    setCurrentView('pathCreator'); // Show PathCreator for practice
  };

  const handlePathComplete = (pathTiles) => {
    console.log('🛣️ StudentDashboard: Path creation complete, tiles:', pathTiles.length);
    
    // Called when user finishes creating their path
    setCustomPath(pathTiles);
    setCurrentView('gameBoard'); // Now show the GameBoard with the custom path
  };

  const handleClosePathCreator = () => {
    console.log('❌ StudentDashboard: Closing path creator');
    setCurrentView('dashboard');
    setCurrentGame(null);
  };

  const handleCloseGame = () => {
    console.log('🏁 StudentDashboard: Game closing');
    
    // Handle quiz completion for personalized quizzes
    if (currentGame?.type === 'personalized' && onQuizComplete) {
      const results = {
        score: 85, // This would come from actual gameplay
        completed: true,
        completedAt: new Date().toISOString()
      };
      console.log('📊 Completing personalized quiz:', currentGame.id, results);
      onQuizComplete(currentGame.id, results);
    }
    
    setCurrentView('dashboard');
    setCurrentGame(null);
    setCustomPath(null);
  };

  // Show PathCreator when creating custom board
  if (currentView === 'pathCreator') {
    return (
      <PathCreator 
        onClose={handleClosePathCreator}
        onGameStart={handlePathComplete}
        gameData={currentGame} // 🔗 PASS gameData to PathCreator
      />
    );
  }

  // Show GameBoard when playing
  if (currentView === 'gameBoard') {
    console.log('🎯 StudentDashboard: Rendering GameBoard with data:', {
      hasCustomPath: !!customPath,
      gameMode: currentGame?.mode,
      hasQuestionsData: !!(currentGame?.questionsData || currentGame?.content),
      gameTitle: currentGame?.title
    });
    
    return (
      <GameBoard 
        onClose={handleCloseGame}
        gameData={{
          ...currentGame,
          customPath: customPath, // Pass the custom path
          pathTiles: customPath
        }}
        // 🔗 KEY FIX: Explicitly pass questionsData for personalized quizzes
        questionsData={currentGame?.questionsData || currentGame?.content}
        studentName={studentName}
      />
    );
  }

  // Mock student data with consistent calendar
  const getStudentCalendarData = (studentName) => {
    const seed = studentName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const activityDates = [1, 3, 6, 8, 10, 12, 15, 17, 19, 22];
    
    const calendarData = {};
    activityDates.forEach(day => {
      const baseCount = Math.floor(((seed + day) % 100) / 4) + 8;
      calendarData[day] = day === 6 ? 24 : day === 19 ? 22 : baseCount;
    });
    
    return calendarData;
  };

  const studentCalendarData = getStudentCalendarData(studentName);
  
  // Mock assigned games
  const mockAssignedGames = [
    {
      id: 1,
      title: "Cell Structure Quiz",
      teacher: "Ms. Johnson",
      dueDate: "Tomorrow",
      difficulty: "Medium",
      topic: "Biology",
      status: "pending",
      playerCount: "0/6 joined",
      type: "group"
    },
    {
      id: 2,
      title: "DNA & RNA Challenge",
      teacher: "Ms. Johnson", 
      dueDate: "Friday",
      difficulty: "Hard",
      topic: "Biology",
      status: "pending",
      playerCount: "0/6 joined",
      type: "group"
    }
  ];

  // 🔗 ENHANCED: Combine mock games with assigned personalized quizzes
  const allAssignedGames = [
    ...assignedQuizzes.map(quiz => {
      console.log('📋 Processing assigned quiz:', quiz.title, 'Content present:', !!quiz.content);
      return {
        ...quiz,
        type: "personalized",
        dueDate: new Date(quiz.dueDate).toLocaleDateString(),
        // Ensure content is properly preserved
        content: quiz.content || quiz.personalizedContent,
        questionsData: quiz.content || quiz.personalizedContent
      };
    }),
    ...mockAssignedGames
  ];

  console.log('📚 StudentDashboard: All assigned games:', allAssignedGames.length, 'total');

  const mockSuggestedGames = [
    {
      id: 3,
      title: "Protein Synthesis Adventure",
      teacher: "Available",
      difficulty: "Medium",
      topic: "Biology",
      playerCount: "Practice Mode",
      description: "Master protein synthesis concepts at your own pace"
    },
    {
      id: 4,
      title: "Mitosis Mastery",
      teacher: "Available",
      difficulty: "Easy",
      topic: "Biology", 
      playerCount: "Practice Mode",
      description: "Learn the phases of cell division"
    }
  ];

  const mockConceptMastery = [
    { topic: "Cell Structure", correct: 15, total: 18, percentage: 83 },
    { topic: "Mitosis & Meiosis", correct: 12, total: 16, percentage: 75 },
    { topic: "DNA & RNA", correct: 8, total: 12, percentage: 67 },
    { topic: "Protein Synthesis", correct: 14, total: 15, percentage: 93 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {studentName.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome back, {studentName}! 🎓</h1>
                <p className="text-gray-600">
                  {assignedQuizzes.length > 0 && (
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm mr-2">
                      🎯 {assignedQuizzes.length} personalized quiz{assignedQuizzes.length !== 1 ? 'zes' : ''} assigned!
                    </span>
                  )}
                  Ready to learn something amazing today?
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleStartPractice({ title: 'Solo Practice Mode', difficulty: 'Custom' })}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>🎨 Solo Practice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Performance Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">15</p>
                <p className="text-sm text-gray-600">Games Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">78%</p>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">4</p>
                <p className="text-sm text-gray-600">Topics Mastered</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{allAssignedGames.length}</p>
                <p className="text-sm text-gray-600">Due Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Board Status */}
        {customPath && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-800 mb-2">🎨 Your Custom Game Board</h3>
            <p className="text-green-700 mb-4">
              You created a custom {customPath.length}-tile adventure board! Ready to play again?
            </p>
            <button 
              onClick={() => setCurrentView('gameBoard')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              🎮 Play Your Custom Board
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Learning Activities */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setSelectedTab('assigned')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${
                      selectedTab === 'assigned' 
                        ? 'border-purple-600 text-purple-600 bg-purple-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Assigned Learning</span>
                      {allAssignedGames.length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {allAssignedGames.length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('suggested')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 ${
                      selectedTab === 'suggested' 
                        ? 'border-purple-600 text-purple-600 bg-purple-50' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Suggested Learning</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {selectedTab === 'assigned' ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Assignments</h3>
                    {allAssignedGames.map(game => (
                      <div key={game.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        game.type === 'personalized' ? 'border-purple-300 bg-purple-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                            {game.type === 'personalized' && <span className="mr-2">🎯</span>}
                            {game.title}
                          </h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            game.dueDate === 'Tomorrow' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            Due {game.dueDate}
                          </span>
                        </div>
                        
                        {/* Enhanced personalized quiz section */}
                        {game.type === 'personalized' && (
                          <div className="mb-3 p-3 bg-white rounded border border-purple-200">
                            <p className="text-sm text-purple-700 font-medium">
                              📚 Personalized content from {game.teacher}
                            </p>
                            {game.focusAreas && (
                              <p className="text-xs text-purple-600 mt-1">
                                Focus: {game.focusAreas}
                              </p>
                            )}
                            {/* Debug info for testing */}
                            <p className="text-xs text-purple-500 mt-1">
                              ✓ Content ready: {game.content ? 'Yes' : 'No'}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-sm text-gray-600">📚 {game.topic}</span>
                          <span className="text-sm text-gray-600">⚡ {game.difficulty}</span>
                          <span className="text-sm text-gray-600">👥 {game.playerCount}</span>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleJoinGame(game)}
                            className={`text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                              game.type === 'personalized' 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                          >
                            <Play className="w-4 h-4" />
                            <span>
                              {game.type === 'personalized' ? '🎯 Create Board & Start Quiz!' : '🎨 Create & Join Game'}
                            </span>
                          </button>
                          {game.type !== 'personalized' && (
                            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Practice & Explore</h3>
                    {mockSuggestedGames.map(game => (
                      <div key={game.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold text-gray-800">{game.title}</h4>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Practice Mode
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{game.description}</p>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-sm text-gray-600">📚 {game.topic}</span>
                          <span className="text-sm text-gray-600">⚡ {game.difficulty}</span>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => handleStartPractice(game)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          >
                            <span>🎨 Create Custom Board</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Activity Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Activity Calendar</h3>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-gray-500 p-2">
                    {day.charAt(0)}
                  </div>
                ))}
                
                {Array.from({length: 28}, (_, i) => {
                  const day = i + 1;
                  const questionsCount = studentCalendarData[day] || 0;
                  
                  let bgColor = 'hover:bg-gray-100';
                  if (questionsCount > 20) bgColor = 'bg-purple-600 text-white';
                  else if (questionsCount > 15) bgColor = 'bg-purple-400 text-white';
                  else if (questionsCount > 10) bgColor = 'bg-purple-300';
                  else if (questionsCount > 5) bgColor = 'bg-purple-200';
                  else if (questionsCount > 0) bgColor = 'bg-purple-100';
                  
                  return (
                    <div key={day} className={`text-center p-2 rounded cursor-pointer transition-colors ${bgColor}`}>
                      <div className="text-xs font-medium">{day}</div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-100 rounded"></div>
                  <span>Light</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-400 rounded"></div>
                  <span>Active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-600 rounded"></div>
                  <span>Intense</span>
                </div>
              </div>
            </div>

            {/* Concept Mastery */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
              </div>
              
              <div className="space-y-4">
                {mockConceptMastery.map(item => (
                  <div key={item.topic}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 text-sm">{item.topic}</span>
                      <span className="text-xs text-gray-600">{item.correct}/{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.percentage >= 80 ? 'bg-green-500' : 
                          item.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-500 mt-1">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;