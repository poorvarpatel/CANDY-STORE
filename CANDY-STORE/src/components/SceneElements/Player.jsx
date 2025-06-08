// SceneElements/Player.jsx - Simple single player ball
import * as THREE from 'three';

/**
 * Create a simple player ball
 * @param {Array} position - Position [x, y, z] where to place the ball
 * @param {Object} options - Customization options
 * @returns {THREE.Mesh} Player ball mesh
 */
export function createPlayerBall(position = [0, 0, 0], options = {}) {
  const {
    radius = 0.4,
    color = 0xff4444, // Red
    segments = 16
  } = options;

  // Create ball geometry and material
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshLambertMaterial({ color: color });
  const ball = new THREE.Mesh(geometry, material);
  
  // Position the ball slightly above the tile surface
  ball.position.set(position[0], position[1] + radius, position[2]);
  ball.castShadow = true;
  ball.receiveShadow = true;
  
  console.log('Created player ball at position:', ball.position);
  return ball;
}

export default createPlayerBall;