import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createTileBoard, cleanupTiles } from '../SceneElements/Tiles';

const GameBoard = ({ pathTiles }) => {
  const TileBoard = ({ pathTiles }) => {
    const { scene } = useThree();
    
    useEffect(() => {
      const { tileMeshes } = createTileBoard(scene, pathTiles, {
        mode: 'game',
        includeEffects: true
      });
      
      return () => cleanupTiles(scene, tileMeshes);
    }, [scene, pathTiles]);
    
    return null;
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-gray-900 z-50">
      <Canvas shadows camera={{ position: [0, 20, 30], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={0.8} castShadow />
        <OrbitControls />
        <TileBoard pathTiles={pathTiles} />
      </Canvas>
    </div>
  );
};

export default GameBoard;