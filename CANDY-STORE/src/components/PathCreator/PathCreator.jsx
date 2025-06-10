import React, { useState } from 'react';
import PathProgressTracker from './PathProgressTracker';
import DrawingCanvas from './DrawingCanvas';
import PathTo3DBoard from './PathTo3DBoard';
import GameBoard from '../GameBoard/Gameboard';

// Main PathCreator component - FIXED to properly pass game data through the flow
const PathCreator = ({ 
  onClose, 
  onGameStart, 
  gameData = null // Receive game data from StudentDashboard
}) => {
  console.log('📚 PathCreator: Received gameData.questionsData:', gameData?.questionsData);
console.log('📚 PathCreator: Received gameData.content:', gameData?.content);
  const [currentLength, setCurrentLength] = useState(0);
  const [pathTiles, setPathTiles] = useState([]);
  const [isPathComplete, setIsPathComplete] = useState(false);
  const [currentView, setCurrentView] = useState('drawing'); // 'drawing', '3d-preview', 'game'
  
  console.log('🎨 PathCreator: Initialized with gameData:', {
    hasGameData: !!gameData,
    gameTitle: gameData?.title,
    gameMode: gameData?.mode,
    hasContent: !!(gameData?.questionsData || gameData?.content),
    isPersonalized: gameData?.isPersonalized
  });
  
  const handlePathUpdate = (length, tiles) => {
    setCurrentLength(length);
    setPathTiles(tiles);
  };
  
  const handlePathComplete = (tiles) => {
    setIsPathComplete(true);
    setPathTiles(tiles);
    console.log('🛣️ PathCreator: Path completed with', tiles.length, 'tiles');
  };
  
  const handleReset = () => {
    setCurrentLength(0);
    setPathTiles([]);
    setIsPathComplete(false);
    setCurrentView('drawing');
  };

  const handleShow3D = () => {
    console.log('🎯 PathCreator: Moving to 3D preview with game data');
    setCurrentView('3d-preview');
  };

  const handleStartGame = () => {
    console.log('🚀 PathCreator: Starting game with', pathTiles.length, 'tiles and game data:', gameData?.title);
    setCurrentView('game');
    
    // Call the parent's onGameStart if provided (for compatibility)
    if (onGameStart) {
      onGameStart(pathTiles);
    }
  };

  const handleBackToDrawing = () => {
    setCurrentView('drawing');
  };

  const handleBackToPreview = () => {
    setCurrentView('3d-preview');
  };

  // Render current view
  if (currentView === 'game') {

    console.log('🎮 PathCreator: About to render GameBoard');
  console.log('🎮 PathCreator: gameData.questionsData:', gameData?.questionsData);
  console.log('🎮 PathCreator: gameData.content:', gameData?.content);
  console.log('🎮 PathCreator: Passing questionsData:', gameData?.questionsData || gameData?.content);
  
    console.log('🎮 PathCreator: Rendering GameBoard with:', {
      pathTilesLength: pathTiles.length,
      gameDataPresent: !!gameData,
      questionsData: !!(gameData?.questionsData || gameData?.content),
      studentName: gameData?.studentName
    });

    
    return (
      <GameBoard 
        pathTiles={pathTiles} 
        onClose={handleBackToPreview}
        gameData={{
          ...gameData,
          customPath: pathTiles,
          pathTiles: pathTiles
        }}
        // 🔗 IMPORTANT: Pass questionsData explicitly for personalized quizzes
        questionsData={gameData?.questionsData || gameData?.content}
        studentName={gameData?.studentName || "Player"}
      />
    );
  }

  if (currentView === '3d-preview' && pathTiles.length > 0) {
    return (
      <PathTo3DBoard 
        pathTiles={pathTiles} 
        onClose={handleBackToDrawing}
        onStartGame={handleStartGame}
        gameData={gameData} // 🔗 PASS game data to 3D preview
      />
    );
  }
  
  // Default: drawing view
  return (
    <div className="fixed inset-0 bg-white z-40 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with back button and game info */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🎨 Create Your Game Board</h1>
            <p className="text-gray-600">
              {gameData?.isPersonalized ? (
                <>🎯 Draw a custom path for your <span className="font-semibold text-purple-600">personalized quiz: {gameData.title}</span></>
              ) : gameData?.title ? (
                <>Draw a custom path for: <span className="font-semibold">{gameData.title}</span></>
              ) : (
                "Draw a custom path for your educational adventure!"
              )}
            </p>
            
            {/* Show game type indicator */}
            {gameData && (
              <div className="mt-2 flex items-center space-x-2">
                {gameData.isPersonalized && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    🎯 Personalized Content Ready
                  </span>
                )}
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  Mode: {gameData.mode || 'Practice'}
                </span>
                {gameData.difficulty && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    {gameData.difficulty}
                  </span>
                )}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        <PathProgressTracker currentLength={currentLength} onReset={handleReset} />
        
        <DrawingCanvas 
          onPathUpdate={handlePathUpdate}
          onPathComplete={handlePathComplete}
        />
        
        {isPathComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold text-green-800 mb-2">🚀 Ready to Build!</h3>
            <p className="text-green-700 mb-4">
              Your path has {pathTiles.length} tiles and is ready to become a 3D game board!
              {gameData?.isPersonalized && (
                <span className="block text-purple-700 font-medium mt-1">
                  🎯 Your personalized questions are ready to be added to the board!
                </span>
              )}
            </p>
            <button
              onClick={handleShow3D}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg animate-bounce"
            >
              🎮 Create 3D Game Board
            </button>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <strong>How it works:</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Draw any path you want with your mouse or finger</li>
            <li>The system converts your drawing into evenly-spaced game tiles</li>
            <li>Progress bar shows if your path is the right length (40-100 tiles)</li>
            <li>Preview your 3D board, then start the 5-color educational game!</li>
            {gameData?.isPersonalized && (
              <li className="text-purple-700 font-medium">🎯 Your personalized questions will be used in the game!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PathCreator;