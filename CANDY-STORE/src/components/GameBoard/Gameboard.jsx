import React, { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createTileBoard, cleanupTiles } from '../SceneElements/Tiles';
import { addCastleToPath, createColoredCastle, createSimpleCastle } from '../SceneElements/Castle';
import { createPlayerBall } from '../SceneElements/Player';

const GameBoard = ({ pathTiles, includeCastle = true, castleStyle = 'default' }) => {
  const TileBoard = ({ pathTiles, includeCastle, castleStyle }) => {
    const { scene, camera } = useThree();
    const castleRef = useRef(null);
    const playerRef = useRef(null);
    const orbitControlsRef = useRef();
    
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
      
      // Add a single player ball at the starting position
      if (path3D.length > 0) {
        const startPosition = path3D[0].position;
        const playerBall = createPlayerBall(startPosition, { color: 0xff4444 }); // Red ball
        scene.add(playerBall);
        playerRef.current = playerBall;
        
        console.log('GameBoard: Added player ball at start position:', startPosition);
        
        // NOW position camera using the ACTUAL player position
        const playerX = startPosition[0];
        const playerY = startPosition[1];
        const playerZ = startPosition[2];
        
        // Find the next tile to point the camera toward
        const currentTileIndex = 0; // Player starts at tile 0
        const nextTileIndex = Math.min(currentTileIndex + 1, path3D.length - 1);
        const nextTile = path3D[nextTileIndex];
        
        // Calculate direction from player to next tile
        const directionX = nextTile.position[0] - playerX;
        const directionZ = nextTile.position[2] - playerZ;
        
        // Normalize the direction
        const directionLength = Math.sqrt(directionX * directionX + directionZ * directionZ);
        const normalizedX = directionLength > 0 ? directionX / directionLength : 0;
        const normalizedZ = directionLength > 0 ? directionZ / directionLength : 1;
        
        // Position camera BEHIND the player, opposite to the direction of the next tile
        const cameraDistance = 8;
        camera.position.set(
          playerX - (normalizedX * cameraDistance), // Opposite direction X
          playerY + 2,                              // Just above ground level
          playerZ - (normalizedZ * cameraDistance)  // Opposite direction Z
        );
        
        // Look toward the NEXT TILE (player should be visible in between)
        camera.lookAt(
          nextTile.position[0],     // Next tile X
          nextTile.position[1] + 1, // Next tile Y (slightly above)
          nextTile.position[2]      // Next tile Z
        );
        
        // Update OrbitControls target to the next tile
        if (orbitControlsRef.current) {
          orbitControlsRef.current.target.set(
            nextTile.position[0], 
            nextTile.position[1] + 1, 
            nextTile.position[2]
          );
          orbitControlsRef.current.update();
        }
        
        console.log('GameBoard: Direction to next tile:', normalizedX, normalizedZ);
        console.log('GameBoard: Camera positioned behind player at:', camera.position);
        console.log('GameBoard: Camera looking toward next tile at:', nextTile.position);
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
        
        // Clean up player ball
        if (playerRef.current) {
          scene.remove(playerRef.current);
          playerRef.current.geometry.dispose();
          playerRef.current.material.dispose();
          playerRef.current = null;
          console.log('GameBoard: Cleaned up player ball');
        }
        
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
    
    return (
      <>
        <OrbitControls 
          ref={orbitControlsRef}
          enableDamping 
          dampingFactor={0.05}
        />
      </>
    );
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

      {/* Camera Info */}
      <div className="absolute bottom-6 left-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <div className="text-sm font-bold mb-2">📷 Camera Control</div>
        <div className="text-xs space-y-1">
          <div>🎯 Behind player, pointing toward NEXT tile</div>
          <div>👀 Follows the path direction dynamically</div>
          <div>🖱️ Use mouse to orbit around player</div>
          <div>⚙️ Scroll to zoom in/out</div>
        </div>
      </div>

      {/* Game Header */}
      <div className="absolute top-6 right-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <div className="text-lg font-bold">🎮 Educational Adventure</div>
        <div className="text-sm">Path: {pathTiles.length} tiles</div>
        <div className="text-sm">🔴 Third-Person Camera View</div>
        {includeCastle && <div className="text-xs text-green-300">🏰 Castle: {castleStyle}</div>}
      </div>

      <Canvas shadows camera={{ position: [0, 20, 30], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={0.8} castShadow />
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