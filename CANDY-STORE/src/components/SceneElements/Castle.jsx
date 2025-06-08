// SceneElements/Castle.jsx - Reusable 3D castle component
import * as THREE from 'three';

// Castle configuration options
const CASTLE_CONFIG = {
  main: {
    topRadius: 4,
    bottomRadius: 5,
    height: 5,
    segments: 12,
    color: 0x8b4513 // Brown
  },
  towers: {
    count: 6,
    radius: 0.8,
    height: 4,
    distance: 4.5,
    color: 0x8b4513 // Brown
  },
  roofs: {
    radius: 1.2,
    height: 2,
    color: 0xff0000 // Red
  },
  spire: {
    topRadius: 0.3,
    bottomRadius: 0.5,
    height: 10,
    color: 0xffd700 // Gold
  },
  crown: {
    radius: 1.5,
    height: 3,
    color: 0xffd700 // Gold
  }
};

/**
 * Create a detailed 3D castle
 * @param {THREE.Vector3|Array} position - Position [x, y, z] or Vector3
 * @param {Object} options - Customization options
 * @returns {THREE.Group} Castle group ready to add to scene
 */
export function createCastle(position = [0, 0, 0], options = {}) {
  const config = { ...CASTLE_CONFIG, ...options };
  const castleGroup = new THREE.Group();
  
  // Convert position to array if it's a Vector3 or object
  const pos = Array.isArray(position) ? position : 
              position.toArray ? position.toArray() : 
              [position.x || 0, position.y || 0, position.z || 0];

  // Main castle structure (central keep)
  const mainCastleGeometry = new THREE.CylinderGeometry(
    config.main.topRadius, 
    config.main.bottomRadius, 
    config.main.height, 
    config.main.segments
  );
  const mainCastleMaterial = new THREE.MeshLambertMaterial({ color: config.main.color });
  const mainCastle = new THREE.Mesh(mainCastleGeometry, mainCastleMaterial);
  mainCastle.position.y = config.main.height / 2;
  mainCastle.castShadow = true;
  mainCastle.receiveShadow = true;
  castleGroup.add(mainCastle);

  // Surrounding towers
  for (let i = 0; i < config.towers.count; i++) {
    const angle = (i / config.towers.count) * Math.PI * 2;
    
    // Tower
    const towerGeometry = new THREE.CylinderGeometry(
      config.towers.radius, 
      config.towers.radius, 
      config.towers.height, 
      12
    );
    const towerMaterial = new THREE.MeshLambertMaterial({ color: config.towers.color });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    
    tower.position.x = Math.cos(angle) * config.towers.distance;
    tower.position.z = Math.sin(angle) * config.towers.distance;
    tower.position.y = config.towers.height / 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    castleGroup.add(tower);
    
    // Tower roof
    const roofGeometry = new THREE.ConeGeometry(
      config.roofs.radius, 
      config.roofs.height, 
      12
    );
    const roofMaterial = new THREE.MeshLambertMaterial({ color: config.roofs.color });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    
    roof.position.copy(tower.position);
    roof.position.y += config.towers.height / 2 + config.roofs.height / 2;
    roof.castShadow = true;
    castleGroup.add(roof);
  }

  // Central spire
  const spireGeometry = new THREE.CylinderGeometry(
    config.spire.topRadius, 
    config.spire.bottomRadius, 
    config.spire.height, 
    12
  );
  const spireMaterial = new THREE.MeshLambertMaterial({ color: config.spire.color });
  const spire = new THREE.Mesh(spireGeometry, spireMaterial);
  spire.position.y = config.main.height + config.spire.height / 2;
  spire.castShadow = true;
  castleGroup.add(spire);

  // Crown/finial
  const crownGeometry = new THREE.ConeGeometry(
    config.crown.radius, 
    config.crown.height, 
    12
  );
  const crownMaterial = new THREE.MeshLambertMaterial({ color: config.crown.color });
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = config.main.height + config.spire.height + config.crown.height / 2;
  crown.castShadow = true;
  castleGroup.add(crown);

  // Position the entire castle
  castleGroup.position.set(...pos);
  
  return castleGroup;
}

/**
 * Create a simpler castle variant
 * @param {THREE.Vector3|Array} position - Position [x, y, z]
 * @param {Object} options - Customization options
 * @returns {THREE.Group} Simple castle group
 */
export function createSimpleCastle(position = [0, 0, 0], options = {}) {
  const simpleConfig = {
    main: { topRadius: 2, bottomRadius: 2.5, height: 3, segments: 8, color: 0x8b4513 },
    towers: { count: 4, radius: 0.6, height: 2.5, distance: 3, color: 0x8b4513 },
    roofs: { radius: 0.8, height: 1.5, color: 0xff0000 },
    spire: { topRadius: 0.2, bottomRadius: 0.3, height: 4, color: 0xffd700 },
    crown: { radius: 0.8, height: 1.5, color: 0xffd700 }
  };
  
  return createCastle(position, { ...simpleConfig, ...options });
}

/**
 * Create castle with custom colors
 * @param {THREE.Vector3|Array} position - Position [x, y, z]
 * @param {Object} colors - Color scheme { walls, roofs, details }
 * @returns {THREE.Group} Colored castle group
 */
export function createColoredCastle(position = [0, 0, 0], colors = {}) {
  const colorConfig = {
    main: { color: colors.walls || 0x8b4513 },
    towers: { color: colors.walls || 0x8b4513 },
    roofs: { color: colors.roofs || 0xff0000 },
    spire: { color: colors.details || 0xffd700 },
    crown: { color: colors.details || 0xffd700 }
  };
  
  return createCastle(position, colorConfig);
}

/**
 * Add castle to scene at end tile position
 * @param {THREE.Scene} scene - Three.js scene
 * @param {Array} path3D - Array of tile data with positions
 * @param {Object} options - Castle customization options
 * @returns {THREE.Group} The created castle group
 */
export function addCastleToPath(scene, path3D, options = {}) {
  if (!path3D || path3D.length === 0) {
    console.warn('No path data provided for castle placement');
    return null;
  }
  
  const endTile = path3D[path3D.length - 1];
  const castlePosition = endTile.position || [0, 0, 0];
  
  const castle = createCastle(castlePosition, options);
  scene.add(castle);
  
  return castle;
}

// Export default castle creation function
export default createCastle;