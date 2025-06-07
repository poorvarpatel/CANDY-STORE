import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const PathTo3DBoard = ({ pathTiles, onClose, onStartGame }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const isInitializedRef = useRef(false);
  const tilesRef = useRef([]);
  
  // Orbit controls state
  const orbitStateRef = useRef({
    isRotating: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: new THREE.Spherical(30, Math.PI / 4, 0),
    target: new THREE.Vector3(0, 0, 0),
    autoFollow: true
  });

  // Game colors for tiles
  const TILE_COLORS = {
    red: 0xff4444,
    teal: 0x14b8a6,
    lightGreen: 0x84cc16,
    orange: 0xf97316,
    purple: 0xa855f7,
    wild: 0xfbbf24,
    gate: 0x8b5cf6,
    rainbow: 0xffffff,
    treeCastle: 0x228b22
  };

  // Convert 2D path to 3D coordinates
  const convertPathTo3D = (path2D) => {
    if (!path2D || path2D.length === 0) return [];
    
    const path3D = [];
    const colorOptions = ['red', 'teal', 'lightGreen', 'orange', 'purple'];
    
    // Scale factor to convert canvas coordinates to 3D world
    const scaleX = 0.1;
    const scaleZ = 0.1;
    const centerX = 400;
    const centerY = 200;
    
    path2D.forEach((point2D, index) => {
      const x = (point2D.x - centerX) * scaleX;
      const z = (point2D.y - centerY) * scaleZ;
      
      // Add height variation
      let y = 0;
      const progress = index / path2D.length;
      y += progress * 8; // Rise toward the end
      y += (Math.random() - 0.5) * 2; // Random variation
      y += Math.sin(progress * 6 * Math.PI) * 1.5; // Wave pattern
      
      // Determine tile type and color
      let tileType = 'colored';
      let color;
      
      if (index === path2D.length - 1) {
        tileType = 'rainbow';
        color = 'rainbow';
      } else if (index > 10 && Math.random() < 0.05) {
        tileType = 'gate';
        color = 'gate';
      } else if (index > 5 && Math.random() < 0.08) {
        tileType = 'wild';
        color = 'wild';
      } else {
        // Smart color selection with 7-tile rule
        let selectedColor = colorOptions[index % 5];
        if (Math.random() < 0.4) {
          selectedColor = colorOptions[Math.floor(Math.random() * 5)];
        }
        color = selectedColor;
      }
      
      path3D.push({
        id: index,
        position: { x, y, z },
        type: tileType,
        color: color,
        colorValue: TILE_COLORS[color] || TILE_COLORS.treeCastle,
        original2D: point2D
      });
    });
    
    return path3D;
  };

  // Create 3D tiles from path data
  const create3DTiles = (scene, path3D) => {
    const tiles = [];
    
    path3D.forEach((tileData, index) => {
      if (index === path3D.length - 1) {
        // Create castle at the end
        createCastle(scene, tileData.position);
        
        // Rainbow destination tile
        const geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 12);
        const material = new THREE.MeshLambertMaterial({ 
          color: tileData.colorValue,
          transparent: true,
          opacity: 0.9
        });
        
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(tileData.position.x, tileData.position.y, tileData.position.z);
        tile.castShadow = true;
        tile.receiveShadow = true;
        
        scene.add(tile);
        tiles.push({ mesh: tile, data: tileData });
        
      } else {
        // Regular game tiles
        const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 8);
        const material = new THREE.MeshLambertMaterial({ color: tileData.colorValue });
        
        const tile = new THREE.Mesh(geometry, material);
        tile.position.set(tileData.position.x, tileData.position.y, tileData.position.z);
        tile.castShadow = true;
        tile.receiveShadow = true;
        
        // Special effects for gate tiles
        if (tileData.type === 'gate') {
          const glowGeometry = new THREE.RingGeometry(1.1, 1.3, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.5
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.rotation.x = -Math.PI / 2;
          glow.position.y = 0.11;
          tile.add(glow);
        }
        
        scene.add(tile);
        tiles.push({ mesh: tile, data: tileData });
      }
    });
    
    return tiles;
  };

  // Create castle at the end position
  const createCastle = (scene, position) => {
    const group = new THREE.Group();
    
    // Main castle structure
    const castleGeometry = new THREE.CylinderGeometry(4, 5, 5, 12);
    const castleMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const castle = new THREE.Mesh(castleGeometry, castleMaterial);
    castle.position.y = 2.5;
    group.add(castle);
    
    // Towers around the castle
    for (let t = 0; t < 6; t++) {
      const angle = (t / 6) * Math.PI * 2;
      const towerGeo = new THREE.CylinderGeometry(0.8, 0.8, 4, 12);
      const tower = new THREE.Mesh(towerGeo, castleMaterial);
      tower.position.x = Math.cos(angle) * 4.5;
      tower.position.z = Math.sin(angle) * 4.5;
      tower.position.y = 4;
      group.add(tower);
      
      const roofGeo = new THREE.ConeGeometry(1.2, 2, 12);
      const roofMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.copy(tower.position);
      roof.position.y += 2.5;
      group.add(roof);
    }
    
    // Central spire
    const spireGeo = new THREE.CylinderGeometry(0.3, 0.5, 10, 12);
    const spireMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = 7.5;
    group.add(spire);
    
    const crownGeo = new THREE.ConeGeometry(1.5, 3, 12);
    const crownMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = 11;
    group.add(crown);
    
    group.position.set(position.x, position.y, position.z);
    scene.add(group);
  };

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

    console.log('Creating 3D board from path with', pathTiles.length, 'tiles');
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Convert 2D path to 3D and create tiles
    const path3D = convertPathTo3D(pathTiles);
    console.log('Converted to 3D path with', path3D.length, 'tiles');
    
    const tiles = create3DTiles(scene, path3D);
    tilesRef.current = tiles;

    // Position camera to view the entire path
    if (path3D.length > 0) {
      const startPos = path3D[0].position;
      const endPos = path3D[path3D.length - 1].position;
      
      const centerX = (startPos.x + endPos.x) / 2;
      const centerY = (startPos.y + endPos.y) / 2 + 5;
      const centerZ = (startPos.z + endPos.z) / 2;
      
      orbitState.target.set(centerX, centerY, centerZ);
      orbitState.spherical.radius = Math.max(30, path3D.length * 0.5);
      updateCamera(camera, orbitState);
    }

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
      console.log('Cleaning up 3D board...');
      isInitializedRef.current = false;
      
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
      
      // Clean up all geometries and materials
      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
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
      
      const centerX = (startPos.x + endPos.x) / 2;
      const centerY = (startPos.y + endPos.y) / 2 + 5;
      const centerZ = (startPos.z + endPos.z) / 2;
      
      orbitState.target.set(centerX, centerY, centerZ);
      orbitState.spherical.set(Math.max(30, path3D.length * 0.5), Math.PI / 4, 0);
      orbitState.autoFollow = true;
      
      if (cameraRef.current) {
        updateCamera(cameraRef.current, orbitState);
      }
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
          <h1 className="text-3xl font-bold">
            🏰 Your Custom 3D Game Board
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-lg">Path Length: <span className="font-bold">{pathTiles.length} tiles</span></p>
              <p className="text-sm opacity-80">Ready to play!</p>
            </div>
            <button 
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ✕ Back to Dashboard
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-green-800 mb-2">🎉 3D Board Created!</h3>
          <p className="text-green-700 mb-4">
            Your custom path has been transformed into a beautiful 3D game board with {pathTiles.length} tiles!
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onStartGame?.(pathTiles)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold text-lg animate-pulse"
            >
              🚀 Start Educational Game!
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