import React, { useState } from 'react';
import PathProgressTracker from './PathProgressTracker';
import DrawingCanvas from './DrawingCanvas';
import PathTo3DBoard from './PathTo3DBoard';

const PathCreator = ({ onClose, onGameStart }) => {
  const [currentLength, setCurrentLength] = useState(0);
  const [pathTiles, setPathTiles] = useState([]);
  const [isPathComplete, setIsPathComplete] = useState(false);
  const [show3DBoard, setShow3DBoard] = useState(false);
  
  const handlePathUpdate = (length, tiles) => {
    setCurrentLength(length);
    setPathTiles(tiles);
  };
  
  const handlePathComplete = (tiles) => {
    setIsPathComplete(true);
    setPathTiles(tiles);
    console.log('Path completed with tiles:', tiles);
  };
  
  const handleReset = () => {
    setCurrentLength(0);
    setPathTiles([]);
    setIsPathComplete(false);
    setShow3DBoard(false);
  };

  const handleShow3D = () => {
    setShow3DBoard(true);
  };

  const handleClose3D = () => {
    setShow3DBoard(false);
  };

  const handleStartGame = () => {
    // Pass the path data back to the parent dashboard
    onGameStart(pathTiles);
  };

  // Show 3D board if requested
  if (show3DBoard && pathTiles.length > 0) {
    return (
      <PathTo3DBoard 
        pathTiles={pathTiles} 
        onClose={onClose}
        onStartGame={handleStartGame}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 bg-white z-40 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">🎨 Create Your Game Board</h1>
            <p className="text-gray-600">Draw a custom path for your educational adventure!</p>
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
            <li>Once complete, we'll build a 3D board following your exact path!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PathCreator;