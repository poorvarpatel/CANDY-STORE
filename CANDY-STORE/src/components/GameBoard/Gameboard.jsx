import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createTileBoard, cleanupTiles, COLOR_SETS } from '../SceneElements/Tiles';
import { addCastleToPath, createColoredCastle, createSimpleCastle } from '../SceneElements/Castle';
import { createPlayerBall } from '../SceneElements/Player';
import GameQuestionBox from './GameQuestionBox';

// Question parser to extract Q&A from AI-generated content
const parseQuestions = (content) => {
  if (!content) return [];
  
  const questions = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentQuestion = null;
  let questionNumber = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for question patterns
    if (line.match(/^\d+\./) || line.includes('?') || line.toLowerCase().includes('question')) {
      if (currentQuestion && currentQuestion.answers.length >= 2) {
        questions.push(currentQuestion);
      }
      
      currentQuestion = {
        id: questionNumber++,
        text: line.replace(/^\d+\.\s*/, '').replace(/^Question\s*\d*:?\s*/i, ''),
        answers: [],
        correctAnswer: 0 // Default to first answer
      };
    }
    // Look for answer patterns (A), B), a., b., etc.)
    else if (line.match(/^[A-E][\.\)]/i) || line.match(/^[a-e][\.\)]/i)) {
      if (currentQuestion) {
        const answerText = line.replace(/^[A-Ea-e][\.\)]\s*/i, '');
        currentQuestion.answers.push(answerText);
        
        // Simple heuristic for correct answer (longest or contains "correct" keywords)
        if (answerText.toLowerCase().includes('mitochondria') || 
            answerText.toLowerCase().includes('energy') ||
            answerText.toLowerCase().includes('power') ||
            answerText.length > 50) {
          currentQuestion.correctAnswer = currentQuestion.answers.length - 1;
        }
      }
    }
    // Look for standalone answers or numbered lists
    else if (line.match(/^-/) || line.match(/^\d+\)/)) {
      if (currentQuestion && currentQuestion.answers.length < 5) {
        const answerText = line.replace(/^[-\d+\)]\s*/, '');
        currentQuestion.answers.push(answerText);
      }
    }
  }
  
  // Add the last question
  if (currentQuestion && currentQuestion.answers.length >= 2) {
    questions.push(currentQuestion);
  }
  
  // If no questions found, create sample questions
  if (questions.length === 0) {
    return [
      {
        id: 1,
        text: "What is the primary function of mitochondria in a cell?",
        answers: [
          "Produce energy (ATP) for cellular activities",
          "Store genetic information",
          "Synthesize proteins",
          "Transport materials",
          "Break down waste products"
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        text: "Which organelle is responsible for protein synthesis?",
        answers: [
          "Nucleus",
          "Ribosomes",
          "Golgi apparatus", 
          "Endoplasmic reticulum",
          "Lysosomes"
        ],
        correctAnswer: 1
      }
    ];
  }
  
  // Ensure all questions have exactly 5 answers
  questions.forEach(q => {
    while (q.answers.length < 5) {
      q.answers.push("Additional option " + (q.answers.length + 1));
    }
    q.answers = q.answers.slice(0, 5); // Limit to 5 answers
  });
  
  return questions;
};

const GameBoard = ({ 
  pathTiles, 
  includeCastle = true, 
  castleStyle = 'default',
  onClose,
  onExitGame, // New prop for exiting game
  gameData,
  studentName,
  questionsData // New prop containing the educational content
}) => {
  // Handle both direct pathTiles prop and gameData.pathTiles from StudentDashboard
  const actualPathTiles = pathTiles || gameData?.pathTiles || gameData?.customPath;
  const actualOnClose = onClose || onExitGame || (() => {});
  const isSOLOMode = gameData?.mode === 'practice' || gameData?.title?.includes('Solo');
  
  // Parse questions from the educational content
  const questions = parseQuestions(questionsData || gameData?.personalizedContent);
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStats, setGameStats] = useState({
    score: 0,
    totalAttempts: 0,
    answeredQuestions: []
  });
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [gameMode, setGameMode] = useState('questions'); // 'questions' or 'completed'
  
  // Generate path tiles based on number of questions (if not provided)
  const generatedPathTiles = actualPathTiles || Array.from({length: Math.max(questions.length, 10)}, (_, i) => ({
    x: i * 2,
    y: 0,
    id: i
  }));

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle answer selection
  const handleAnswerSelect = (answerIndex, colorKey) => {
    const correct = answerIndex === currentQuestion.correctAnswer;
    
    setGameStats(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      score: correct ? prev.score + 1 : prev.score,
      answeredQuestions: [...prev.answeredQuestions, {
        questionId: currentQuestion.id,
        selectedAnswer: answerIndex,
        correct: correct,
        colorKey: colorKey
      }]
    }));
    
    if (correct) {
      setIsCorrectAnswer(true);
      console.log('🎉 Correct answer! Moving to next question...');
      
      // Move to next question after a delay
      setTimeout(() => {
        setIsCorrectAnswer(false);
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setGameMode('completed');
          console.log('🏆 Game completed!');
        }
      }, 3000);
    } else {
      console.log('❌ Incorrect answer. Try again!');
    }
  };
  
  // Handle question navigation
  const handleNavigateQuestion = (direction) => {
    if (direction === 'previous' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
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
      console.log('GameBoard: Solo mode:', isSOLOMode);
      
      // Create the tile board (all tiles including final one)
      const { tileMeshes, path3D } = createTileBoard(scene, pathTiles, {
        mode: 'game',
        includeEffects: true,
        heightOffset: 5 // Push all tiles 5 units higher
      });
      
      console.log('GameBoard: Created', tileMeshes.length, 'tile meshes');
      
      // Add a single player ball at the starting position (always just 1 for solo)
      if (path3D.length > 0) {
        const startPosition = path3D[currentQuestionIndex] ? path3D[currentQuestionIndex].position : path3D[0].position;
        // Add slight height boost for player ball visibility
        const playerPosition = [startPosition[0], startPosition[1] + 0.5, startPosition[2]];
        const playerBall = createPlayerBall(playerPosition, { color: 0xff4444 }); // Red ball
        scene.add(playerBall);
        playerRef.current = playerBall;
        
        console.log('GameBoard: Added SOLO player ball at elevated position:', playerPosition);
        
        // NOW position camera using the ACTUAL player position
        const playerX = playerPosition[0];
        const playerY = playerPosition[1];
        const playerZ = playerPosition[2];
        
        // Find the next tile to point the camera toward
        const nextTileIndex = Math.min(currentQuestionIndex + 1, path3D.length - 1);
        const nextTile = path3D[nextTileIndex];
        
        // Calculate direction from player to next tile
        const directionX = nextTile.position[0] - playerX;
        const directionZ = nextTile.position[2] - playerZ;
        
        // Normalize the direction
        const directionLength = Math.sqrt(directionX * directionX + directionZ * directionZ);
        const normalizedX = directionLength > 0 ? directionX / directionLength : 0;
        const normalizedZ = directionLength > 0 ? directionZ / directionLength : 1;
        
        // Position camera BEHIND and ABOVE the player for a good view of elevated content
        const cameraDistance = 8;
        camera.position.set(
          playerX - (normalizedX * cameraDistance), // Opposite direction X
          playerY + 2,                              // Above the elevated player
          playerZ - (normalizedZ * cameraDistance)  // Opposite direction Z
        );
        
        // Look toward the NEXT TILE at elevated position
        camera.lookAt(
          nextTile.position[0],     // Next tile X
          nextTile.position[1] + 1, // Next tile Y (slightly above)
          nextTile.position[2]      // Next tile Z
        );
        
        // Update OrbitControls target to the elevated next tile
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
    }, [scene, camera, pathTiles, includeCastle, castleStyle, currentQuestionIndex]);
    
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

  if (!generatedPathTiles || generatedPathTiles.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">No Questions Found</h2>
          <p className="text-gray-500">Please generate educational content first!</p>
          <button 
            onClick={actualOnClose}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Student Profile
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === 'completed') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Quiz Completed!</h2>
          <p className="text-xl text-gray-700 mb-2">Great job, {studentName}!</p>
          <p className="text-lg text-gray-600 mb-6">
            Final Score: {gameStats.score} / {gameStats.totalAttempts} 
            ({Math.round((gameStats.score / gameStats.totalAttempts) * 100)}%)
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => {
                setCurrentQuestionIndex(0);
                setGameStats({score: 0, totalAttempts: 0, answeredQuestions: []});
                setGameMode('questions');
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Play Again
            </button>
            <button 
              onClick={actualOnClose}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Profile
            </button>
          </div>
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
        <div className="text-lg font-bold">🎮 {studentName}'s Quiz Adventure</div>
        <div className="text-sm">🎯 Answer questions to reach the castle!</div>
        <div className="text-sm">🔴 Question {currentQuestionIndex + 1} of {questions.length}</div>
        {includeCastle && <div className="text-xs text-green-300">🏰 Castle: {castleStyle}</div>}
      </div>

      {/* Exit Game Button */}
      <div className="absolute top-6 left-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <button
          onClick={actualOnClose}
          className="text-white hover:text-gray-300 transition-colors"
        >
          ← Exit Game
        </button>
      </div>

      {/* Game Question Box */}
      <GameQuestionBox 
        currentQuestion={currentQuestion}
        onAnswerSelect={handleAnswerSelect}
        onNavigateQuestion={handleNavigateQuestion}
        gameStats={{
          currentQuestion: currentQuestionIndex + 1,
          totalQuestions: questions.length,
          score: gameStats.score,
          totalAttempts: gameStats.totalAttempts
        }}
        canGoBack={true}
        isCorrectAnswer={isCorrectAnswer}
      />

      <Canvas shadows camera={{ position: [0, 15, 25], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 5]} intensity={0.8} castShadow />
        <TileBoard 
          pathTiles={generatedPathTiles} 
          includeCastle={includeCastle}
          castleStyle={castleStyle}
        />
      </Canvas>
    </div>
  );
};

export default GameBoard;