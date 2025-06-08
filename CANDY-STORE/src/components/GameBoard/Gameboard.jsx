import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createTileBoard, cleanupTiles } from '../SceneElements/Tiles';
import { addCastleToPath, createColoredCastle, createSimpleCastle } from '../SceneElements/Castle';

const GameBoard = ({ pathTiles, includeCastle = true, castleStyle = 'default' }) => {
  const TileBoard = ({ pathTiles, includeCastle, castleStyle }) => {
    const { scene, camera } = useThree();
    const castleRef = useRef(null);
    
    useEffect(() => {
      if (!pathTiles || pathTiles.length === 0) {
        console.warn('GameBoard: No pathTiles provided');
        return;
      }

      console.log('GameBoard: Creating board with', pathTiles.length, 'tiles');
      
      // Create the tile board (all tiles including final one)
      const { tileMeshes, path3D } = createTileBoard(scene, pathTiles, {
        mode: 'game',
        includeEffects: true
      });
      
      console.log('GameBoard: Created', tileMeshes.length, 'tile meshes');
      console.log('GameBoard: First tile position:', path3D[0]?.position);
      console.log('GameBoard: Last tile position:', path3D[path3D.length - 1]?.position);
      
      // Position camera to view the entire path
      if (path3D.length > 0) {
        const startPos = path3D[0].position;
        const endPos = path3D[path3D.length - 1].position;
        
        // Check for valid coordinates
        const isValidPos = (pos) => pos && pos.length === 3 && 
          pos.every(coord => !isNaN(coord) && isFinite(coord));
        
        if (isValidPos(startPos) && isValidPos(endPos)) {
          const centerX = (startPos[0] + endPos[0]) / 2;
          const centerY = (startPos[1] + endPos[1]) / 2 + 5;
          const centerZ = (startPos[2] + endPos[2]) / 2;
          
          // Verify camera target coordinates are valid
          if (!isNaN(centerX) && !isNaN(centerY) && !isNaN(centerZ)) {
            // Position camera to see the entire path
            const distance = Math.max(30, path3D.length * 0.3);
            camera.position.set(centerX, centerY + distance * 0.7, centerZ + distance);
            camera.lookAt(centerX, centerY, centerZ);
            
            console.log('GameBoard: Camera positioned at:', camera.position);
            console.log('GameBoard: Camera looking at:', centerX, centerY, centerZ);
          } else {
            console.error('GameBoard: Invalid camera target coordinates');
            // Fallback to default camera position
            camera.position.set(0, 20, 30);
            camera.lookAt(0, 0, 0);
          }
        } else {
          console.error('GameBoard: Invalid tile positions detected');
          console.log('GameBoard: Start position:', startPos);
          console.log('GameBoard: End position:', endPos);
          // Fallback to default camera position
          camera.position.set(0, 20, 30);
          camera.lookAt(0, 0, 0);
        }
      } else {
        console.warn('GameBoard: No path3D tiles found');
        camera.position.set(0, 20, 30);
        camera.lookAt(0, 0, 0);
      }
      
      // Add castle if requested
      let castle = null;
      if (includeCastle && path3D.length > 0) {
        const endPosition = path3D[path3D.length - 1].position;
        console.log('GameBoard: Adding castle at position', endPosition);
        
        // Choose castle style
        try {
          switch (castleStyle) {
            case 'simple':
              castle = createSimpleCastle(endPosition);
              scene.add(castle);
              break;
            case 'colorful':
              castle = createColoredCastle(endPosition, {
                walls: 0x4a5568,    // Gray walls
                roofs: 0xe53e3e,    // Red roofs  
                details: 0xf6e05e   // Yellow details
              });
              scene.add(castle);
              break;
            case 'royal':
              castle = createColoredCastle(endPosition, {
                walls: 0x553c9a,    // Purple walls
                roofs: 0xffd700,    // Gold roofs
                details: 0xffffff   // White details
              });
              scene.add(castle);
              break;
            default:
              // Use the utility function that automatically adds to scene
              castle = addCastleToPath(scene, path3D);
              break;
          }
          
          castleRef.current = castle;
          console.log('GameBoard: Castle created successfully:', castleStyle);
          
        } catch (error) {
          console.error('GameBoard: Error creating castle:', error);
        }
      }
      
      // Force a render update
      scene.updateMatrixWorld();
      
      // Cleanup function
      return () => {
        console.log('GameBoard: Cleaning up');
        
        // Clean up tiles
        cleanupTiles(scene, tileMeshes);
        
        // Clean up castle
        if (castleRef.current) {
          scene.remove(castleRef.current);
          
          castleRef.current.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          
          castleRef.current = null;
        }
      };
    }, [scene, camera, pathTiles, includeCastle, castleStyle]);
    
    return null;
  };

  if (!pathTiles || pathTiles.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Path Data</h2>
          <p className="text-gray-500">Please create a path first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-screen bg-gray-900 z-50">
      {/* Castle Style Controls */}
      {includeCastle && (
        <div className="absolute top-6 left-6 bg-black/50 rounded-lg p-3 text-white z-10">
          <div className="text-sm mb-2">🏰 Castle Style: {castleStyle}</div>
          <div className="text-xs space-y-1">
            <div>🏛️ Default Castle</div>
            <div>🏘️ Simple Castle</div>
            <div>🌈 Colorful Castle</div>
            <div>👑 Royal Castle</div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="absolute top-6 right-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <div className="text-lg font-bold">🎮 Educational Adventure</div>
        <div className="text-sm">Path: {pathTiles.length} tiles</div>
        {includeCastle && <div className="text-xs text-green-300">🏰 Castle: {castleStyle}</div>}
      </div>

      <Canvas shadows camera={{ position: [0, 20, 30], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={0.8} castShadow />
        <OrbitControls />
        <TileBoard 
          pathTiles={pathTiles} 
          includeCastle={includeCastle}
          castleStyle={castleStyle}
        />
      </Canvas>
    </div>
  );
};

export default GameBoard;