import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

const GameBoard = ({ onClose, gameData, studentName }) => {
  // Three.js refs
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const isInitializedRef = useRef(false);
  
  // Orbit controls state
  const orbitStateRef = useRef({
    isRotating: false,
    previousMousePosition: { x: 0, y: 0 },
    spherical: new THREE.Spherical(20, Math.PI / 3, 0), // radius, phi, theta
    target: new THREE.Vector3(0, 0, 0),
    autoFollow: true
  });

  // Update camera position based on orbit state
  const updateCamera = (camera, orbitState) => {
    camera.position.setFromSpherical(orbitState.spherical);
    camera.position.add(orbitState.target);
    camera.lookAt(orbitState.target);
  };

  // Initialize Three.js
  useEffect(() => {
    if (!mountRef.current || isInitializedRef.current) {
      return;
    }

    console.log('Initializing GameBoard...');
    isInitializedRef.current = true;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;

    // Initialize orbit controls
    const orbitState = orbitStateRef.current;
    orbitState.spherical.set(20, Math.PI / 3, 0);
    orbitState.target.set(0, 0, 0);
    updateCamera(camera, orbitState);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit controls
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

    // Zoom controls
    const handleWheel = (event) => {
      event.preventDefault();
      orbitState.autoFollow = false;
      
      const zoomSpeed = 0.1;
      const zoomDirection = event.deltaY > 0 ? 1 : -1;
      
      orbitState.spherical.radius += zoomDirection * zoomSpeed * orbitState.spherical.radius;
      orbitState.spherical.radius = Math.max(3, Math.min(80, orbitState.spherical.radius));
      
      updateCamera(camera, orbitState);
    };

    // Touch controls
    let touches = [];
    let lastDistance = 0;

    const handleTouchStart = (event) => {
      touches = Array.from(event.touches);
      orbitState.autoFollow = false;
      
      if (touches.length === 1) {
        orbitState.isRotating = true;
        orbitState.previousMousePosition = { x: touches[0].clientX, y: touches[0].clientY };
      } else if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        lastDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (event) => {
      event.preventDefault();
      touches = Array.from(event.touches);
      
      if (touches.length === 1 && orbitState.isRotating) {
        const deltaMove = {
          x: touches[0].clientX - orbitState.previousMousePosition.x,
          y: touches[0].clientY - orbitState.previousMousePosition.y
        };
        
        orbitState.spherical.theta -= deltaMove.x * 0.01;
        orbitState.spherical.phi += deltaMove.y * 0.01;
        orbitState.spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitState.spherical.phi));
        
        updateCamera(camera, orbitState);
        orbitState.previousMousePosition = { x: touches[0].clientX, y: touches[0].clientY };
        
      } else if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (lastDistance > 0) {
          const zoomFactor = distance / lastDistance;
          orbitState.spherical.radius /= zoomFactor;
          orbitState.spherical.radius = Math.max(3, Math.min(80, orbitState.spherical.radius));
          updateCamera(camera, orbitState);
        }
        
        lastDistance = distance;
      }
    };

    const handleTouchEnd = () => {
      orbitState.isRotating = false;
      touches = [];
      lastDistance = 0;
    };
    
    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseleave', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel, { passive: false });
    renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', handleTouchEnd);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

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
      console.log('Cleaning up GameBoard...');
      isInitializedRef.current = false;
      
      window.removeEventListener('resize', handleResize);
      
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseleave', handleMouseUp);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        renderer.domElement.removeEventListener('touchstart', handleTouchStart);
        renderer.domElement.removeEventListener('touchmove', handleTouchMove);
        renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  // Reset camera to default position
  const resetCamera = () => {
    const orbitState = orbitStateRef.current;
    orbitState.target.set(0, 0, 0);
    orbitState.spherical.set(20, Math.PI / 3, 0);
    orbitState.autoFollow = true;
    
    if (cameraRef.current) {
      updateCamera(cameraRef.current, orbitState);
    }
  };

  // Toggle auto-follow
  const toggleAutoFollow = () => {
    orbitStateRef.current.autoFollow = !orbitStateRef.current.autoFollow;
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-gray-900 z-50">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex justify-between items-center text-white">
          <h1 className="text-3xl font-bold">
            🎮 {gameData?.title || 'Educational Game Board'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              {studentName && (
                <p className="text-lg">Playing as: <span className="font-bold">{studentName}</span></p>
              )}
              <p className="text-lg">Scene: Empty with Controls</p>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="absolute top-20 right-6 bg-black/50 rounded-lg p-3 text-white">
        <div className="text-sm mb-2">Camera Controls:</div>
        <div className="text-xs space-y-1">
          <div>🖱️ Drag to rotate</div>
          <div>⚙️ Scroll to zoom</div>
          <div>📱 Pinch to zoom (mobile)</div>
        </div>
        <button
          onClick={toggleAutoFollow}
          className={`mt-2 px-3 py-1 rounded text-xs ${
            orbitStateRef.current?.autoFollow 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          Auto-Follow: {orbitStateRef.current?.autoFollow ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={resetCamera}
          className="ml-2 mt-2 px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700"
        >
          🎯 Reset View
        </button>
      </div>

      {/* Simple Status */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-white/90 rounded-lg p-4 text-center">
          <p className="text-lg text-gray-800">Empty scene with orbit controls ready!</p>
          <p className="text-sm text-gray-600 mt-2">
            Try dragging to rotate, scrolling to zoom, or use the camera controls above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;