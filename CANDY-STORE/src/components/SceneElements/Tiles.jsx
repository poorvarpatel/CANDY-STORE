import * as THREE from 'three';

// Tile colors
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

// Generate board path data
export const generateBoardPath = () => {
  const totalTiles = 60 + Math.floor(Math.random() * 21);
  const tiles = [];
  const colorOptions = ['red', 'teal', 'lightGreen', 'orange', 'purple'];
  
  for (let i = 0; i < totalTiles; i++) {
    const progress = i / totalTiles;
    
    // Spacing between tiles
    const tileSpacing = 4.5;
    const forwardDistance = i * tileSpacing;
    
    // Side movement for interesting path
    let sideMovement = 0;
    sideMovement += Math.sin(progress * 4 * Math.PI) * 3;
    sideMovement += Math.sin(progress * 8 * Math.PI) * 1.5;
    sideMovement += (Math.random() - 0.5) * 2;
    
    // Occasional sharp turns
    if (Math.random() < 0.08) {
      sideMovement += (Math.random() - 0.5) * 4;
    }
    
    // Height variation
    const baseHeight = progress * 12;
    const randomHeightVariation = (Math.random() - 0.5) * 1.5;
    const terrainHeight = baseHeight + randomHeightVariation;
    
    const x = sideMovement;
    const z = forwardDistance - (totalTiles * tileSpacing / 2);
    const y = terrainHeight;
    
    // Determine tile type and color
    let tileType = 'colored';
    let color;
    
    if (i === totalTiles - 1) {
      tileType = 'rainbow';
      color = 'rainbow';
    } else if (i > 10 && Math.random() < 0.05) {
      tileType = 'gate';
      color = 'gate';
    } else if (i > 5 && Math.random() < 0.08) {
      tileType = 'wild';
      color = 'wild';
    } else {
      // Smart color selection with 7-tile rule
      let selectedColor;
      
      if (i >= 6) {
        const recentColors = [];
        for (let j = 1; j <= 6; j++) {
          const recentTile = tiles[i - j];
          if (recentTile && colorOptions.includes(recentTile.color)) {
            recentColors.push(recentTile.color);
          }
        }
        
        const missingColors = colorOptions.filter(c => !recentColors.includes(c));
        if (missingColors.length > 0) {
          selectedColor = missingColors[Math.floor(Math.random() * missingColors.length)];
        }
      }
      
      if (!selectedColor) {
        let baseColor = colorOptions[i % 5];
        if (Math.random() < 0.4) {
          baseColor = colorOptions[Math.floor(Math.random() * 5)];
        }
        selectedColor = baseColor;
      }
      
      // Prevent three in a row
      if (i >= 2) {
        const prev1 = tiles[i-1]?.color;
        const prev2 = tiles[i-2]?.color;
        
        if (prev1 === prev2 && prev1 === selectedColor) {
          const otherColors = colorOptions.filter(c => c !== selectedColor);
          selectedColor = otherColors[Math.floor(Math.random() * otherColors.length)];
        }
      }
      
      color = selectedColor;
    }
    
    tiles.push({
      id: i,
      position: { x, y, z },
      type: tileType,
      color: color,
      colorValue: TILE_COLORS[color] || TILE_COLORS.treeCastle
    });
  }
  
  return tiles;
};

// Create tile meshes and add to scene
export const createTiles = (scene, tilesData) => {
  const tileMeshes = [];
  
  tilesData.forEach((tileData, index) => {
    if (index === tilesData.length - 1) {
      // Final rainbow tile (destination)
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
      tileMeshes.push({ mesh: tile, data: tileData });
      
    } else {
      // Regular tiles
      const geometry = new THREE.CylinderGeometry(1, 1, 0.2, 8);
      const material = new THREE.MeshLambertMaterial({ color: tileData.colorValue });
      
      const tile = new THREE.Mesh(geometry, material);
      tile.position.set(tileData.position.x, tileData.position.y, tileData.position.z);
      tile.castShadow = true;
      tile.receiveShadow = true;
      
      // Special effects for special tiles
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
      tileMeshes.push({ mesh: tile, data: tileData });
    }
  });
  
  return tileMeshes;
};

// Remove all tiles from scene
export const removeTiles = (scene, tileMeshes) => {
  tileMeshes.forEach(({ mesh }) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
};