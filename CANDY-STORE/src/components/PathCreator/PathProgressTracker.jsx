import React, { useState, useRef, useEffect } from 'react';
// In your real project, you'd import these:
// import PathProgressTracker from './PathProgressTracker';
// import DrawingCanvas from './DrawingCanvas';
// import PathTo3DBoard from './PathTo3DBoard';

// For the artifact demo, components are included inline below:

// PathProgressTracker Component
const PathProgressTracker = ({ currentLength, onReset }) => {
  const MIN_LENGTH = 40;
  const MAX_LENGTH = 100;
  const OPTIMAL_START = 50;
  const OPTIMAL_END = 80;
  
  const percentage = Math.min((currentLength / MAX_LENGTH) * 100, 100);
  const minPercent = (MIN_LENGTH / MAX_LENGTH) * 100;
  const optimalStartPercent = (OPTIMAL_START / MAX_LENGTH) * 100;
  const optimalEndPercent = (OPTIMAL_END / MAX_LENGTH) * 100;
  
  const getStatus = () => {
    if (currentLength < MIN_LENGTH) {
      return {
        type: 'too-short',
        message: `Keep drawing! Need ${MIN_LENGTH - currentLength} more tiles`,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    } else if (currentLength >= OPTIMAL_START && currentLength <= OPTIMAL_END) {
      return {
        type: 'perfect',
        message: 'Perfect length! You can finish or keep going',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    } else if (currentLength < OPTIMAL_START) {
      return {
        type: 'getting-there',
        message: 'Getting there! Draw a bit more for optimal length',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      };
    } else if (currentLength < MAX_LENGTH) {
      return {
        type: 'getting-long',
        message: `Getting long but okay. ${MAX_LENGTH - currentLength} tiles left`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      };
    } else {
      return {
        type: 'too-long',
        message: 'Path is at maximum length! Finish now',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    }
  };
  
  const status = getStatus();
  
  return (
    <div className="mb-6">
      <div className="mb-4">
        <div className="relative h-6 bg-gray-200 rounded-lg overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-red-200" style={{ width: `${minPercent}%` }} />
          <div className="absolute top-0 h-full bg-yellow-200" style={{ 
            left: `${minPercent}%`, 
            width: `${optimalStartPercent - minPercent}%` 
          }} />
          <div className="absolute top-0 h-full bg-green-200" style={{ 
            left: `${optimalStartPercent}%`, 
            width: `${optimalEndPercent - optimalStartPercent}%` 
          }} />
          <div className="absolute top-0 h-full bg-orange-200" style={{ 
            left: `${optimalEndPercent}%`, 
            width: `${100 - optimalEndPercent}%` 
          }} />
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300" style={{ width: `${percentage}%` }} />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Too Short</span>
          <span>Getting There</span>
          <span>Perfect!</span>
          <span>Getting Long</span>
        </div>
      </div>
      <div className={`p-3 rounded-lg ${status.bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-800">
              Path Length: <span className={status.color}>{currentLength}</span>/{MAX_LENGTH} tiles
            </div>
            <div className={`text-sm ${status.color} font-medium`}>
              {status.message}
            </div>
          </div>
          <div className="text-xl">
            {status.type === 'too-short' && '📏'}
            {status.type === 'getting-there' && '✏️'}
            {status.type === 'perfect' && '✨'}
            {status.type === 'getting-long' && '⚠️'}
            {status.type === 'too-long' && '🛑'}
          </div>
        </div>
      </div>
    </div>
  );
};

// DrawingCanvas Component
const DrawingCanvas = ({ onPathUpdate, onPathComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = 800;
    canvas.height = 400;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3b82f6';
    
    drawBackground(ctx, canvas.width, canvas.height);
  }, []);
  
  const drawBackground = (ctx, width, height) => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎨 Draw your adventure path here!', width / 2, 30);
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
  };
  
  const processPath = (pathPoints) => {
    if (pathPoints.length < 2) return [];
    
    const tiles = [];
    const tileSpacing = 12;
    let totalDistance = 0;
    
    for (let i = 1; i < pathPoints.length; i++) {
      const dx = pathPoints[i].x - pathPoints[i-1].x;
      const dy = pathPoints[i].y - pathPoints[i-1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    
    let currentDistance = 0;
    let pathIndex = 1;
    let segmentDistance = 0;
    
    while (currentDistance < totalDistance && pathIndex < pathPoints.length) {
      while (pathIndex < pathPoints.length) {
        const dx = pathPoints[pathIndex].x - pathPoints[pathIndex-1].x;
        const dy = pathPoints[pathIndex].y - pathPoints[pathIndex-1].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        
        if (segmentDistance + segmentLength >= currentDistance) {
          const t = (currentDistance - segmentDistance) / segmentLength;
          const x = pathPoints[pathIndex-1].x + t * dx;
          const y = pathPoints[pathIndex-1].y + t * dy;
          
          tiles.push({ x, y, index: tiles.length });
          currentDistance += tileSpacing;
          break;
        }
        
        segmentDistance += segmentLength;
        pathIndex++;
      }
      
      if (pathIndex >= pathPoints.length) break;
    }
    
    return tiles;
  };
  
  const startDrawing = (e) => {
    if (isComplete) return;
    
    if (currentPath.length > 0) {
      clearPath();
    }
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPath = [{ x, y }];
    setCurrentPath(newPath);
    
    const ctx = canvas.getContext('2d');
    drawBackground(ctx, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e) => {
    if (!isDrawing || isComplete) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPath = [...currentPath, { x, y }];
    const tiles = processPath(newPath);
    
    if (tiles.length >= 120) {
      setIsDrawing(false);
      setCurrentPath(newPath);
      onPathUpdate?.(120, tiles.slice(0, 120));
      
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ 120 TILE LIMIT REACHED', canvas.width / 2, canvas.height - 20);
      return;
    }
    
    setCurrentPath(newPath);
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    
    onPathUpdate?.(tiles.length, tiles);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearPath = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setCurrentPath([]);
    setIsComplete(false);
    drawBackground(ctx, canvas.width, canvas.height);
    onPathUpdate?.(0, []);
  };
  
  const completePath = () => {
    const tiles = processPath(currentPath);
    if (tiles.length < 40) return;
    
    setIsComplete(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    tiles.forEach((tile, index) => {
      ctx.fillStyle = index === 0 ? '#10b981' : index === tiles.length - 1 ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(tile.x, tile.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    if (tiles.length > 0) {
      const start = tiles[0];
      const end = tiles[tiles.length - 1];
      
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('START', start.x - 15, start.y - 8);
      
      ctx.fillStyle = '#ef4444';
      ctx.fillText('🏰', end.x - 8, end.y - 8);
    }
    
    onPathComplete?.(tiles);
  };
  
  return (
    <div>
      <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair w-full"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {isComplete && (
          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
            <div className="bg-white px-4 py-3 rounded-lg shadow-lg text-center">
              <div className="text-xl font-bold text-green-600 mb-1">🎉 Path Complete!</div>
              <div className="text-sm text-gray-600">Ready to build your 3D board</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-3">
        <button
          onClick={clearPath}
          disabled={currentPath.length === 0}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
        >
          🗑️ Clear
        </button>
        
        <button
          onClick={completePath}
          disabled={processPath(currentPath).length < 40 || isComplete}
          className={`px-6 py-2 font-bold rounded-lg transition-all ${
            processPath(currentPath).length >= 40 && !isComplete
              ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          🏰 Complete Path
        </button>
      </div>
    </div>
  );
};

// Simple 3D Board placeholder for demo
const PathTo3DBoard = ({ pathTiles, onClose }) => {
  return (
    <div className="fixed inset-0 w-full h-screen bg-gradient-to-b from-blue-400 to-blue-600 z-50">
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex justify-between items-center text-white">
          <h1 className="text-3xl font-bold">🏰 Your Custom 3D Game Board</h1>
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Back to Drawing
          </button>
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center text-white text-center">
        <div>
          <h2 className="text-4xl font-bold mb-4">🎉 3D Board Created!</h2>
          <p className="text-xl mb-6">Your {pathTiles.length}-tile path is now a 3D game board!</p>
          <p className="text-lg opacity-80">(In real app: Full Three.js 3D rendering with orbit controls)</p>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-green-800 mb-2">🎉 3D Board Created!</h3>
          <p className="text-green-700 mb-4">
            Your custom path has been transformed into a beautiful 3D game board with {pathTiles.length} tiles!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => alert('Starting game with your custom board! 🎮')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg animate-pulse"
            >
              🚀 Start Game!
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              ✏️ Draw New Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PathCreator = () => {
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

  // Show 3D board if requested
  if (show3DBoard && pathTiles.length > 0) {
    return <PathTo3DBoard pathTiles={pathTiles} onClose={handleClose3D} />;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎨 Create Your Game Board</h1>
        <p className="text-gray-600">Draw a custom path and we'll turn it into a 3D adventure!</p>
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
  );
};

export default PathProgressTracker;