import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createTileBoard, cleanupTiles } from '../SceneElements/Tiles';
import { addCastleToPath } from '../SceneElements/Castle';

const PathTo3DBoard = ({ 
  pathTiles, 
  onClose, 
  onStartGame, 
  gameData = null // NEW: Receive game data from PathCreator
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const isInitializedRef = useRef(false);
  const tilesRef = useRef([]);
  
  console.log('🎯 PathTo3DBoard: Initialized with gameData:', {
    hasGameData: !!gameData,
    gameTitle: gameData?.title,
    isPersonalized: gameData?.isPersonalized,
    hasContent: !!(gameData?.questionsData || gameData?.content)
  });
  
  // Orbit controls state
  const orbitStateRef = useRef({
    isRotating: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: new THREE.Spherical(30, Math.PI / 4, 0),
    target: new THREE.Vector3(0, 0, 0),
    autoFollow: true
  });

  // Update camera position
  const updateCamera = (camera, orbitState) => {
    camera.position.setFromSpherical(orbitState.spherical);
    camera.position.add(orbitState.target);
    camera.lookAt(orbitState.target);
  };

  // Three.js setup
  useEffect(() => {
    if (!mountRef.current || isInitializedRef.current || !pathTiles || pathTiles.length === 0) {
      return;
    }

    console.log('🏗️ PathTo3DBoard: Creating 3D board from path with', pathTiles.length, 'tiles');
    isInitializedRef.current = true;

    // Hide body scroll bars
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Create tiles using centralized function
    const { tileMeshes, path3D } = createTileBoard(scene, pathTiles, {
      mode: 'preview',
      includeSpecialTiles: true,
      includeEffects: true
    });
    
    // Add castle manually using dedicated Castle component
    const castle = addCastleToPath(scene, path3D);
    
    tilesRef.current = tileMeshes;
    console.log('🏰 PathTo3DBoard: Created 3D path with', path3D.length, 'tiles and castle');

    // Position camera to view the entire path
    if (path3D.length > 0) {
      const startPos = path3D[0].position;
      const endPos = path3D[path3D.length - 1].position;
      
      const centerX = (startPos[0] + endPos[0]) / 2;
      const centerY = (startPos[1] + endPos[1]) / 2 + 5;
      const centerZ = (startPos[2] + endPos[2]) / 2;
      
      const orbitState = orbitStateRef.current;
      orbitState.target.set(centerX, centerY, centerZ);
      orbitState.spherical.radius = Math.max(30, path3D.length * 0.5);
      updateCamera(camera, orbitState);
    }

    // Orbit controls
    const orbitState = orbitStateRef.current;
    
    const handleMouseDown = (event) => {
      orbitState.isRotating = true;
      orbitState.autoFollow = false;
      orbitState.previousMousePosition = { x: event.clientX, y: event.clientY };
    };
    
    const handleMouseUp = () => {
      orbitState.isRotating = false;
    };
    
    const handleMouseMove = (event) => {
      if (!orbitState.isRotating) return;
      
      const deltaMove = {
        x: event.clientX - orbitState.previousMousePosition.x,
        y: event.clientY - orbitState.previousMousePosition.y
      };
      
      orbitState.spherical.theta -= deltaMove.x * 0.01;
      orbitState.spherical.phi += deltaMove.y * 0.01;
      orbitState.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitState.spherical.phi));
      
      updateCamera(camera, orbitState);
      orbitState.previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleWheel = (event) => {
      event.preventDefault();
      orbitState.autoFollow = false;
      
      const zoomSpeed = 0.1;
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      
      orbitState.spherical.radius += zoomDirection * zoomSpeed * orbitState.spherical.radius;
      orbitState.spherical.radius = Math.max(5, Math.min(100, orbitState.spherical.radius));
      
      updateCamera(camera, orbitState);
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      console.log('🧹 PathTo3DBoard: Cleaning up 3D board...');
      isInitializedRef.current = false;
      
      // Use centralized cleanup for tiles
      cleanupTiles(scene, tileMeshes);
      
      // Clean up castle
      if (castle) {
        scene.remove(castle);
        castle.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
      
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('resize', handleResize);
      
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
        renderer.domElement.removeEventListener('wheel', handleWheel);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      tilesRef.current = [];
    };
  }, [pathTiles]);

  const resetCamera = () => {
    const orbitState = orbitStateRef.current;
    if (tilesRef.current.length > 0) {
      const path3D = tilesRef.current.map(t => t.data);
      const startPos = path3D[0].position;
      const endPos = path3D[path3D.length - 1].position;
      
      const centerX = (startPos[0] + endPos[0]) / 2;
      const centerY = (startPos[1] + endPos[1]) / 2 + 5;
      const centerZ = (startPos[2] + endPos[2]) / 2;
      
      orbitState.target.set(centerX, centerY, centerZ);
      orbitState.spherical.set(Math.max(30, path3D.length * 0.5), Math.PI / 4, 0);
      orbitState.autoFollow = true;
      
      if (cameraRef.current) {
        updateCamera(cameraRef.current, orbitState);
      }
    }
  };

  // ENHANCED: Handle game start with proper data flow
  const handleGameStart = () => {
    console.log('🚀 PathTo3DBoard: Starting game with gameData:', {
      pathTilesLength: pathTiles.length,
      gameTitle: gameData?.title,
      hasContent: !!(gameData?.questionsData || gameData?.content)
    });
    
    if (onStartGame) {
      onStartGame(); // This calls back to PathCreator
    }
  };

  if (!pathTiles || pathTiles.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Path Data</h2>
          <p className="text-gray-500">Please draw a path first to create a 3D board!</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Drawing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-screen bg-gray-900 z-50">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex justify-between items-center text-white">
          <div>
            <h1 className="text-3xl font-bold">
              🏰 Your Custom 3D Game Board
            </h1>
            {/* Enhanced game info display */}
            {gameData?.isPersonalized && (
              <div className="mt-2 bg-purple-600/80 rounded-lg px-3 py-1 inline-block">
                <span className="text-sm font-medium">🎯 {gameData.title}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg">Path Length: <span className="font-bold">{pathTiles.length} tiles</span></p>
              <p className="text-sm opacity-80">
                {gameData?.isPersonalized ? '🎯 Personalized questions ready!' : 'Ready to play!'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Back to Drawing
            </button>
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute top-20 right-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <div className="text-sm mb-2">Camera Controls:</div>
        <div className="text-xs space-y-1">
          <div>🖱️ Drag to rotate</div>
          <div>⚙️ Scroll to zoom</div>
          <div>📱 Pinch to zoom (mobile)</div>
        </div>
        <button
          onClick={resetCamera}
          className="mt-2 px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700"
        >
          🎯 Reset View
        </button>
      </div>

      {/* Game Ready Status */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className={`border rounded-lg p-6 text-center max-w-2xl mx-auto ${
          gameData?.isPersonalized 
            ? 'bg-purple-50 border-purple-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <h3 className={`text-xl font-bold mb-2 ${
            gameData?.isPersonalized ? 'text-purple-800' : 'text-green-800'
          }`}>
            🎉 3D Board Created!
          </h3>
          <p className={`mb-4 ${
            gameData?.isPersonalized ? 'text-purple-700' : 'text-green-700'
          }`}>
            Your custom path has been transformed into a beautiful 3D game board with {pathTiles.length} tiles!
            {gameData?.isPersonalized && (
              <span className="block font-medium mt-1">
                🎯 Your personalized questions from {gameData.teacher || 'your teacher'} are ready!
              </span>
            )}
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleGameStart}
              className={`text-white px-8 py-3 rounded-lg font-bold text-lg animate-pulse ${
                gameData?.isPersonalized 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              🚀 {gameData?.isPersonalized ? 'Start Personalized Quiz!' : 'Start Educational Game!'}
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

export default PathTo3DBoard;