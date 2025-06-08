import React, { useRef, useEffect, useState } from 'react';

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
  
  console.log('processPath: Input pathPoints:', pathPoints.length);
  console.log('processPath: First point:', pathPoints[0]);
  console.log('processPath: Last point:', pathPoints[pathPoints.length - 1]);
  
  // Filter out invalid points
  const validPoints = pathPoints.filter((point, index) => {
    const isValid = point && 
      typeof point.x === 'number' && 
      typeof point.y === 'number' && 
      !isNaN(point.x) && 
      !isNaN(point.y) &&
      isFinite(point.x) &&
      isFinite(point.y);
    
    if (!isValid) {
      console.warn('processPath: Filtering out invalid point at index', index, ':', point);
    }
    
    return isValid;
  });
  
  if (validPoints.length < 2) {
    console.error('processPath: Not enough valid points after filtering');
    return [];
  }
  
  console.log('processPath: Using', validPoints.length, 'valid points');
  
  const tiles = [];
  const tileSpacing = 12;
  let totalDistance = 0;
  
  // Calculate total path distance
  for (let i = 1; i < validPoints.length; i++) {
    const dx = validPoints[i].x - validPoints[i-1].x;
    const dy = validPoints[i].y - validPoints[i-1].y;
    const segmentDistance = Math.sqrt(dx * dx + dy * dy);
    
    if (isNaN(segmentDistance) || !isFinite(segmentDistance)) {
      console.warn('processPath: Invalid segment distance between points', i-1, 'and', i);
      continue;
    }
    
    totalDistance += segmentDistance;
  }
  
  if (totalDistance === 0) {
    console.error('processPath: Total distance is 0');
    return [];
  }
  
  console.log('processPath: Total path distance:', totalDistance);
  
  let currentDistance = 0;
  let pathIndex = 1;
  let segmentDistance = 0;
  
  // Always add the first point as the first tile
  tiles.push({ 
    x: validPoints[0].x, 
    y: validPoints[0].y, 
    index: 0 
  });
  
  currentDistance = tileSpacing; // Start from tileSpacing for the second tile
  
  while (currentDistance < totalDistance && pathIndex < validPoints.length) {
    while (pathIndex < validPoints.length) {
      const dx = validPoints[pathIndex].x - validPoints[pathIndex-1].x;
      const dy = validPoints[pathIndex].y - validPoints[pathIndex-1].y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      
      if (segmentDistance + segmentLength >= currentDistance) {
        const t = (currentDistance - segmentDistance) / segmentLength;
        const x = validPoints[pathIndex-1].x + t * dx;
        const y = validPoints[pathIndex-1].y + t * dy;
        
        // Verify the calculated coordinates are valid
        if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
          tiles.push({ x, y, index: tiles.length });
        } else {
          console.warn('processPath: Calculated invalid tile coordinates:', x, y);
        }
        
        currentDistance += tileSpacing;
        break;
      }
      
      segmentDistance += segmentLength;
      pathIndex++;
    }
    
    if (pathIndex >= validPoints.length) break;
  }
  
  // Always ensure the last point is included as the final tile
  const lastPoint = validPoints[validPoints.length - 1];
  if (tiles.length === 0 || 
      tiles[tiles.length - 1].x !== lastPoint.x || 
      tiles[tiles.length - 1].y !== lastPoint.y) {
    tiles.push({ 
      x: lastPoint.x, 
      y: lastPoint.y, 
      index: tiles.length 
    });
  }
  
  console.log('processPath: Generated', tiles.length, 'tiles');
  console.log('processPath: First tile:', tiles[0]);
  console.log('processPath: Last tile:', tiles[tiles.length - 1]);
  
  return tiles;
};

  // const processPath = (pathPoints) => {
  //   if (pathPoints.length < 2) return [];
    
  //   const tiles = [];
  //   const tileSpacing = 12;
  //   let totalDistance = 0;
    
  //   for (let i = 1; i < pathPoints.length; i++) {
  //     const dx = pathPoints[i].x - pathPoints[i-1].x;
  //     const dy = pathPoints[i].y - pathPoints[i-1].y;
  //     totalDistance += Math.sqrt(dx * dx + dy * dy);
  //   }
    
  //   let currentDistance = 0;
  //   let pathIndex = 1;
  //   let segmentDistance = 0;
    
  //   while (currentDistance < totalDistance && pathIndex < pathPoints.length) {
  //     while (pathIndex < pathPoints.length) {
  //       const dx = pathPoints[pathIndex].x - pathPoints[pathIndex-1].x;
  //       const dy = pathPoints[pathIndex].y - pathPoints[pathIndex-1].y;
  //       const segmentLength = Math.sqrt(dx * dx + dy * dy);
        
  //       if (segmentDistance + segmentLength >= currentDistance) {
  //         const t = (currentDistance - segmentDistance) / segmentLength;
  //         const x = pathPoints[pathIndex-1].x + t * dx;
  //         const y = pathPoints[pathIndex-1].y + t * dy;
          
  //         tiles.push({ x, y, index: tiles.length });
  //         currentDistance += tileSpacing;
  //         break;
  //       }
        
  //       segmentDistance += segmentLength;
  //       pathIndex++;
  //     }
      
  //     if (pathIndex >= pathPoints.length) break;
  //   }
    
  //   return tiles;
  // };
  
  const startDrawing = (e) => {
    if (isComplete) return;
    
    // If there's already a path and we're starting somewhere new, clear it
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
    // Clear and redraw background since we might have cleared
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
    
    // Hard stop at 120 tiles
    if (tiles.length >= 120) {
      setIsDrawing(false);
      setCurrentPath(newPath);
      onPathUpdate?.(120, tiles.slice(0, 120)); // Cap at exactly 120
      
      // Visual feedback that limit was reached
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

export default DrawingCanvas;