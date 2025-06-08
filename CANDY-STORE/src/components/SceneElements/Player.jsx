// SceneElements/Player.jsx - Player ball with arc animation
import * as THREE from 'three';

/**
 * Create a player ball with animation capabilities
 * @param {Array} position - Initial position [x, y, z] where to place the ball
 * @param {Object} options - Customization options
 * @returns {Object} Object containing the mesh and animation methods
 */
export function createPlayerBall(position = [0, 0, 0], options = {}) {
  const {
    radius = 0.4,
    color = 0xff4444, // Red
    segments = 16,
    animationDuration = 2000, // 2 seconds default
    arcHeight = 3 // How high the arc goes above the path
  } = options;

  // Create ball geometry and material
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshLambertMaterial({ color: color });
  const ball = new THREE.Mesh(geometry, material);
  
  // Position the ball slightly above the tile surface
  ball.position.set(position[0], position[1] + radius, position[2]);
  ball.castShadow = true;
  ball.receiveShadow = true;
  
  // Animation state
  let isAnimating = false;
  let animationId = null;
  
  /**
   * Animate the ball in an arc from current position to target position
   * @param {Array} targetPosition - Target position [x, y, z]
   * @param {Function} onComplete - Callback when animation completes
   * @param {Object} animationOptions - Override animation settings
   */
  const animateToPosition = (targetPosition, onComplete = () => {}, animationOptions = {}) => {
    if (isAnimating) {
      console.log('Player animation already in progress, skipping...');
      return;
    }
    
    const duration = animationOptions.duration || animationDuration;
    const arcHeight = animationOptions.arcHeight || options.arcHeight || 3;
    
    // Store starting position
    const startPosition = {
      x: ball.position.x,
      y: ball.position.y,
      z: ball.position.z
    };
    
    // Target position (adjust Y for ball radius)
    const endPosition = {
      x: targetPosition[0],
      y: targetPosition[1] + radius,
      z: targetPosition[2]
    };
    
    // Calculate distance for arc height scaling
    const distance = Math.sqrt(
      Math.pow(endPosition.x - startPosition.x, 2) + 
      Math.pow(endPosition.z - startPosition.z, 2)
    );
    
    // Scale arc height based on distance (longer jumps = higher arcs)
    const dynamicArcHeight = Math.max(arcHeight, distance * 0.5);
    
    const startTime = Date.now();
    isAnimating = true;
    
    console.log(`🏀 Starting player animation from (${startPosition.x.toFixed(1)}, ${startPosition.z.toFixed(1)}) to (${endPosition.x.toFixed(1)}, ${endPosition.z.toFixed(1)})`);
    console.log(`📏 Distance: ${distance.toFixed(1)}, Arc height: ${dynamicArcHeight.toFixed(1)}`);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const easeInOut = (t) => {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      };
      
      const easedProgress = easeInOut(progress);
      
      // Linear interpolation for X and Z
      const currentX = startPosition.x + (endPosition.x - startPosition.x) * easedProgress;
      const currentZ = startPosition.z + (endPosition.z - startPosition.z) * easedProgress;
      
      // Parabolic arc for Y (creates the jumping effect)
      const arcProgress = Math.sin(progress * Math.PI); // Goes 0 -> 1 -> 0
      const baseY = startPosition.y + (endPosition.y - startPosition.y) * easedProgress;
      const currentY = baseY + (dynamicArcHeight * arcProgress);
      
      // Update ball position
      ball.position.set(currentX, currentY, currentZ);
      
      // Add a subtle rotation effect during movement
      ball.rotation.x += 0.1;
      ball.rotation.z += 0.05;
      
      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Animation complete
        ball.position.set(endPosition.x, endPosition.y, endPosition.z);
        isAnimating = false;
        animationId = null;
        console.log('🎯 Player animation completed!');
        onComplete();
      }
    };
    
    animate();
  };
  
  /**
   * Stop any current animation
   */
  const stopAnimation = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
      isAnimating = false;
      console.log('🛑 Player animation stopped');
    }
  };
  
  /**
   * Instantly move to position (no animation)
   * @param {Array} targetPosition - Target position [x, y, z]
   */
  const setPosition = (targetPosition) => {
    stopAnimation();
    ball.position.set(targetPosition[0], targetPosition[1] + radius, targetPosition[2]);
    console.log('📍 Player instantly moved to:', ball.position);
  };
  
  /**
   * Get current animation state
   */
  const getAnimationState = () => ({
    isAnimating,
    currentPosition: [ball.position.x, ball.position.y - radius, ball.position.z]
  });
  
  console.log('Created animated player ball at position:', ball.position);
  
  return {
    mesh: ball,
    animateToPosition,
    stopAnimation,
    setPosition,
    getAnimationState,
    // Expose geometry and material for cleanup
    geometry,
    material
  };
}

/**
 * Create multiple player balls for multiplayer games
 * @param {Array} positions - Array of positions for each player
 * @param {Array} colors - Array of colors for each player
 * @returns {Array} Array of player objects
 */
export function createMultiplePlayerBalls(positions, colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44]) {
  return positions.map((position, index) => 
    createPlayerBall(position, { 
      color: colors[index % colors.length],
      animationDuration: 1500 + (index * 200) // Slightly stagger animations
    })
  );
}

export default createPlayerBall;