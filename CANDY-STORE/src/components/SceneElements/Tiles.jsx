// Tiles.jsx - Centralized tile logic for both preview and game modes
import * as THREE from 'three';

// Unified color system
export const TILE_COLORS = {
  red: { hex: 0xff4444, name: 'Red' },
  blue: { hex: 0x4444ff, name: 'Blue' },
  green: { hex: 0x44ff44, name: 'Green' },
  yellow: { hex: 0xffff44, name: 'Yellow' },
  purple: { hex: 0xff44ff, name: 'Purple' },
  teal: { hex: 0x14b8a6, name: 'Teal' },
  lightGreen: { hex: 0x84cc16, name: 'Light Green' },
  orange: { hex: 0xf97316, name: 'Orange' },
  wild: { hex: 0xfbbf24, name: 'Wild' },
  gate: { hex: 0x8b5cf6, name: 'Gate' },
  rainbow: { hex: 0xffffff, name: 'Rainbow' }
};

// Color sets for different modes
export const COLOR_SETS = {
  game: ['red', 'blue', 'green', 'yellow', 'purple'],
  preview: ['red', 'teal', 'lightGreen', 'orange', 'purple']
};

// Generate color sequence with validation
export function generateColorSequence(pathLength, colorSet = COLOR_SETS.game) {
  if (pathLength < 7) {
    return Array.from({ length: pathLength }, (_, i) => colorSet[i % colorSet.length]);
  }

  const sequence = [...colorSet, colorSet[0], colorSet[1]];

  for (let i = 7; i < pathLength; i++) {
    const lastSix = sequence.slice(i - 6, i);
    const colorCount = {};
    colorSet.forEach(color => colorCount[color] = 0);
    lastSix.forEach(color => colorCount[color]++);
    
    const minCount = Math.min(...Object.values(colorCount));
    const candidateColors = colorSet.filter(color => colorCount[color] === minCount);
    const nextColor = candidateColors[Math.floor(Math.random() * candidateColors.length)];
    sequence.push(nextColor);
  }
  
  return sequence;
}

// Validate color sequence (7-tile rule)
export function validateColorSequence(sequence, colorSet = COLOR_SETS.game) {
  if (sequence.length < 7) return true;
  
  for (let i = 0; i <= sequence.length - 7; i++) {
    const window = sequence.slice(i, i + 7);
    const uniqueColors = new Set(window);
    if (uniqueColors.size < colorSet.length) return false;
  }
  
  return true;
}

// Convert 2D path to 3D coordinates
export function convertPathTo3D(path2D, options = {}) {
  const {
    mode = 'game', // 'game' or 'preview'
    includeSpecialTiles = false,
    heightVariation = true,
    scale = 0.9
  } = options;

  if (!path2D || path2D.length === 0) return { path3D: [], colorSequence: [], isValid: true };

  console.log('convertPathTo3D: Processing', path2D.length, 'input tiles');
  
  // Filter out invalid coordinates and log them
  const validPath2D = path2D.filter((point, index) => {
    const x = point.x ?? point[0];
    const y = point.y ?? point[1];
    const isValid = !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y);
    
    if (!isValid) {
      console.warn('convertPathTo3D: Skipping invalid tile', index, ':', point);
    }
    
    return isValid;
  });
  
  console.log('convertPathTo3D: Using', validPath2D.length, 'valid tiles after filtering');
  
  if (validPath2D.length === 0) {
    console.error('convertPathTo3D: No valid tiles found!');
    return { path3D: [], colorSequence: [], isValid: false };
  }

  const colorSet = COLOR_SETS[mode];
  const colorSequence = generateColorSequence(validPath2D.length, colorSet);
  const isValid = validateColorSequence(colorSequence, colorSet);

  // Normalize path coordinates
  const xs = validPath2D.map(p => p.x ?? p[0]);
  const ys = validPath2D.map(p => p.y ?? p[1]);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;

  console.log('convertPathTo3D: Coordinate bounds:', { xMin, xMax, yMin, yMax });

  const path3D = [];

  validPath2D.forEach((point2D, index) => {
    const x = ((point2D.x ?? point2D[0]) - xMin - xRange / 2) * scale;
    const z = ((point2D.y ?? point2D[1]) - yMin - yRange / 2) * scale;
    
    // Calculate height
    let y = 0;
    if (heightVariation) {
      const progress = index / validPath2D.length;
      y += progress * 8; // Rise toward the end
      y += Math.sin(progress * 4 * Math.PI) * 1.5; // Wave pattern
      y += (Math.random() - 0.5) * 0.5; // Random variation
    }

    // Determine tile type and color
    let tileType = 'colored';
    let colorKey = colorSequence[index];

    if (includeSpecialTiles && mode === 'preview') {
      if (index === validPath2D.length - 1) {
        tileType = 'rainbow';
        colorKey = 'rainbow';
      } else if (index > 10 && Math.random() < 0.05) {
        tileType = 'gate';
        colorKey = 'gate';
      } else if (index > 5 && Math.random() < 0.08) {
        tileType = 'wild';
        colorKey = 'wild';
      }
    }

    const colorData = TILE_COLORS[colorKey];

    path3D.push({
      id: index,
      position: [x, y, z],
      type: tileType,
      colorKey: colorKey,
      colorValue: colorData.hex,
      colorName: colorData.name,
      isStart: index === 0,
      isEnd: index === validPath2D.length - 1
    });
  });

  console.log('convertPathTo3D: Created', path3D.length, '3D tiles');
  if (path3D.length > 0) {
    console.log('convertPathTo3D: First tile:', path3D[0].position);
    console.log('convertPathTo3D: Last tile:', path3D[path3D.length - 1].position);
  }

  return { path3D, colorSequence, isValid };
}

// Create tile mesh for Three.js
export function createTileMesh(tileData, options = {}) {
  const {
    radius = 1,
    height = 0.3,
    segments = 8,
    includeEffects = false
  } = options;

  // Main tile geometry
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
  const material = new THREE.MeshLambertMaterial({ 
    color: tileData.colorValue,
    transparent: tileData.type === 'rainbow',
    opacity: tileData.type === 'rainbow' ? 0.9 : 1.0
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...tileData.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  // Add special effects
  if (includeEffects) {
    // Start/End markers
    if (tileData.isStart || tileData.isEnd) {
      const ringGeometry = new THREE.RingGeometry(radius + 0.1, radius + 0.4, 16);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: tileData.isStart ? 0x00ff00 : 0xffd700,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = height / 2 + 0.01;
      mesh.add(ring);
    }

    // Gate glow effect
    if (tileData.type === 'gate') {
      const glowGeometry = new THREE.RingGeometry(radius + 0.1, radius + 0.3, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.5
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.rotation.x = -Math.PI / 2;
      glow.position.y = height / 2 + 0.01;
      mesh.add(glow);
    }
  }

  return mesh;
}

// Note: Castle creation moved to SceneElements/Castle.jsx for better organization

// Create all tiles for a scene
export function createTileBoard(scene, pathTiles, options = {}) {
  const {
    mode = 'game',
    includeSpecialTiles = mode === 'preview',
    includeEffects = true,
    includeCastle = mode === 'preview'
  } = options;

  console.log('Tiles: Creating board for', pathTiles.length, 'path tiles in', mode, 'mode');

  const { path3D } = convertPathTo3D(pathTiles, { 
    mode, 
    includeSpecialTiles,
    ...options 
  });
  
  console.log('Tiles: Converted to', path3D.length, '3D tiles');
  if (path3D.length > 0) {
    console.log('Tiles: First tile at position:', path3D[0].position);
    console.log('Tiles: Last tile at position:', path3D[path3D.length - 1].position);
  }
  
  const tileMeshes = [];

  path3D.forEach((tileData, index) => {
    const tileMesh = createTileMesh(tileData, {
      radius: tileData.isEnd ? 1.5 : 1,
      includeEffects,
      ...options
    });

    console.log('Tiles: Adding tile', index, 'at position:', tileData.position);
    scene.add(tileMesh);
    tileMeshes.push({ mesh: tileMesh, data: tileData });
  });

  console.log('Tiles: Added', tileMeshes.length, 'tile meshes to scene');
  return { tileMeshes, path3D };
}

// Clean up tiles from scene
export function cleanupTiles(scene, tileMeshes) {
  tileMeshes.forEach(({ mesh }) => {
    scene.remove(mesh);
    
    // Dispose of geometries and materials
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    }
    
    // Clean up any child meshes (effects)
    mesh.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  });
}