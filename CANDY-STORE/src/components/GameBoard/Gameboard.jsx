// Updated GameBoard component with player animation
import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createTileBoard, cleanupTiles, COLOR_SETS } from '../SceneElements/Tiles';
import { addCastleToPath, createColoredCastle, createSimpleCastle } from '../SceneElements/Castle';
import { createPlayerBall } from '../SceneElements/Player';
import GameQuestionBox from './GameQuestionBox';

// Question parser (keeping the same as before)
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
        correctAnswer: 0
      };
    }
    else if (line.match(/^[A-E][\.\)]/i) || line.match(/^[a-e][\.\)]/i)) {
      if (currentQuestion) {
        const answerText = line.replace(/^[A-Ea-e][\.\)]\s*/i, '');
        currentQuestion.answers.push(answerText);
        
        if (answerText.toLowerCase().includes('mitochondria') || 
            answerText.toLowerCase().includes('energy') ||
            answerText.toLowerCase().includes('power') ||
            answerText.length > 50) {
          currentQuestion.correctAnswer = currentQuestion.answers.length - 1;
        }
      }
    }
    else if (line.match(/^-/) || line.match(/^\d+\)/)) {
      if (currentQuestion && currentQuestion.answers.length < 5) {
        const answerText = line.replace(/^[-\d+\)]\s*/, '');
        currentQuestion.answers.push(answerText);
      }
    }
  }
  
  if (currentQuestion && currentQuestion.answers.length >= 2) {
    questions.push(currentQuestion);
  }
  
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
  
  questions.forEach(q => {
    while (q.answers.length < 5) {
      q.answers.push("Additional option " + (q.answers.length + 1));
    }
    q.answers = q.answers.slice(0, 5);
  });
  
  return questions;
};

const GameBoard = ({ 
  pathTiles, 
  includeCastle = true, 
  castleStyle = 'default',
  onClose,
  onExitGame,
  gameData,
  studentName,
  questionsData
}) => {
  const actualPathTiles = pathTiles || gameData?.pathTiles || gameData?.customPath;
  const actualOnClose = onClose || onExitGame || (() => {});
  const isSOLOMode = gameData?.mode === 'practice' || gameData?.title?.includes('Solo');
  
  const questions = parseQuestions(questionsData || gameData?.personalizedContent);
  
  // Game state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameStats, setGameStats] = useState({
    score: 0,
    totalAttempts: 0,
    answeredQuestions: []
  });
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [gameMode, setGameMode] = useState('questions');
  const [playerIsMoving, setPlayerIsMoving] = useState(false); // New state for tracking movement
  
  const generatedPathTiles = actualPathTiles || Array.from({length: Math.max(questions.length, 10)}, (_, i) => ({
    x: i * 2,
    y: 0,
    id: i
  }));

  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle answer selection with animation
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
      console.log('🎉 Correct answer! Player will move to next tile...');
      
      setTimeout(() => {
        setIsCorrectAnswer(false);
        if (currentQuestionIndex < questions.length - 1) {
          setPlayerIsMoving(true); // Start movement state
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setGameMode('completed');
          console.log('🏆 Game completed!');
        }
      }, 1500); // Slightly shorter delay to feel more responsive
    } else {
      console.log('❌ Incorrect answer. Try again!');
    }
  };
  
  const handleNavigateQuestion = (direction) => {
    if (playerIsMoving) {
      console.log('Player is moving, navigation disabled');
      return;
    }
    
    if (direction === 'previous' && currentQuestionIndex > 0) {
      setPlayerIsMoving(true);
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setPlayerIsMoving(true);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const TileBoard = ({ pathTiles, includeCastle, castleStyle }) => {
    const { scene, camera } = useThree();
    const castleRef = useRef(null);
    const playerRef = useRef(null);
    const orbitControlsRef = useRef();
    const path3DRef = useRef(null); // Store path for animations
    
    // Effect for initial setup
    useEffect(() => {
      if (!pathTiles || pathTiles.length === 0) {
        console.warn('GameBoard: No pathTiles provided');
        return;
      }

      console.log('GameBoard: Creating board with', pathTiles.length, 'tiles');
      
      // Create the tile board
      const { tileMeshes, path3D } = createTileBoard(scene, pathTiles, {
        mode: 'game',
        includeEffects: true,
        heightOffset: 5
      });
      
      path3DRef.current = path3D; // Store for animations
      console.log('GameBoard: Created', tileMeshes.length, 'tile meshes');
      
      // Create player ball at starting position
      if (path3D.length > 0) {
        const startPosition = path3D[0].position;
        const playerBallObj = createPlayerBall(startPosition, { 
          color: 0xff4444,
          animationDuration: 2000,
          arcHeight: 4
        });
        
        scene.add(playerBallObj.mesh);
        playerRef.current = playerBallObj;
        
        console.log('GameBoard: Added SOLO player ball at position:', startPosition);
      }
      
      // Add castle if requested
      let castle = null;
      if (includeCastle && path3D.length > 0) {
        const endPosition = path3D[path3D.length - 1].position;
        console.log('GameBoard: Adding castle at position', endPosition);
        
        try {
          switch (castleStyle) {
            case 'simple':
              castle = createSimpleCastle(endPosition);
              scene.add(castle);
              break;
            case 'colorful':
              castle = createColoredCastle(endPosition, {
                walls: 0x4a5568,
                roofs: 0xe53e3e,
                details: 0xf6e05e
              });
              scene.add(castle);
              break;
            case 'royal':
              castle = createColoredCastle(endPosition, {
                walls: 0x553c9a,
                roofs: 0xffd700,
                details: 0xffffff
              });
              scene.add(castle);
              break;
            default:
              castle = addCastleToPath(scene, path3D);
              break;
          }
          
          castleRef.current = castle;
          console.log('GameBoard: Castle created successfully:', castleStyle);
          
        } catch (error) {
          console.error('GameBoard: Error creating castle:', error);
        }
      }
      
      scene.updateMatrixWorld();
      
      // Cleanup function
      return () => {
        console.log('GameBoard: Cleaning up');
        
        if (playerRef.current) {
          playerRef.current.stopAnimation();
          scene.remove(playerRef.current.mesh);
          playerRef.current.geometry.dispose();
          playerRef.current.material.dispose();
          playerRef.current = null;
        }
        
        cleanupTiles(scene, tileMeshes);
        
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
    }, [scene, camera, pathTiles, includeCastle, castleStyle]);
    
    // Effect for handling player movement animations
    useEffect(() => {
      if (!playerRef.current || !path3DRef.current || path3DRef.current.length === 0) {
        return;
      }
      
      const targetPosition = path3DRef.current[currentQuestionIndex]?.position;
      if (!targetPosition) {
        console.warn('No target position found for question index:', currentQuestionIndex);
        return;
      }
      
      console.log('🚀 Animating player to question', currentQuestionIndex + 1);
      
      // Animate player to new position
      playerRef.current.animateToPosition(
        targetPosition,
        () => {
          // Animation complete callback
          setPlayerIsMoving(false);
          console.log('✅ Player reached destination for question', currentQuestionIndex + 1);
          
          // Update camera position to follow player
          updateCameraForPosition(currentQuestionIndex);
        },
        {
          duration: 2000,
          arcHeight: 3 + (Math.abs(currentQuestionIndex - (currentQuestionIndex - 1)) * 1) // Higher arcs for longer jumps
        }
      );
      
    }, [currentQuestionIndex]);
    
    // Camera update function
    const updateCameraForPosition = (questionIndex) => {
      if (!path3DRef.current || !playerRef.current) return;
      
      const currentTile = path3DRef.current[questionIndex];
      const nextTileIndex = Math.min(questionIndex + 1, path3DRef.current.length - 1);
      const nextTile = path3DRef.current[nextTileIndex];
      
      if (!currentTile || !nextTile) return;
      
      const playerPos = currentTile.position;
      const directionX = nextTile.position[0] - playerPos[0];
      const directionZ = nextTile.position[2] - playerPos[2];
      
      const directionLength = Math.sqrt(directionX * directionX + directionZ * directionZ);
      const normalizedX = directionLength > 0 ? directionX / directionLength : 0;
      const normalizedZ = directionLength > 0 ? directionZ / directionLength : 1;
      
      const cameraDistance = 8;
      camera.position.set(
        playerPos[0] - (normalizedX * cameraDistance),
        playerPos[1] + 3,
        playerPos[2] - (normalizedZ * cameraDistance)
      );
      
      camera.lookAt(
        nextTile.position[0],
        nextTile.position[1] + 1,
        nextTile.position[2]
      );
      
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(
          nextTile.position[0], 
          nextTile.position[1] + 1, 
          nextTile.position[2]
        );
        orbitControlsRef.current.update();
      }
    };
    
    return (
      <>
        <OrbitControls 
          ref={orbitControlsRef}
          enableDamping 
          dampingFactor={0.05}
          enabled={!playerIsMoving} // Disable during movement for smoother experience
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
                setPlayerIsMoving(false);
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
      {/* Animation Status Indicator */}
      {playerIsMoving && (
        <div className="absolute top-1/2 left-6 bg-blue-600/90 rounded-lg p-4 text-white z-20 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <span className="text-sm font-bold">Player Moving...</span>
          </div>
        </div>
      )}

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

      {/* Game Header */}
      <div className="absolute top-6 right-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <div className="text-lg font-bold">🎮 {studentName}'s Quiz Adventure</div>
        <div className="text-sm">🎯 Answer questions to reach the castle!</div>
        <div className="text-sm">🔴 Question {currentQuestionIndex + 1} of {questions.length}</div>
        {playerIsMoving && <div className="text-xs text-blue-300 animate-pulse">🏃 Player moving...</div>}
        {includeCastle && <div className="text-xs text-green-300">🏰 Castle: {castleStyle}</div>}
      </div>

      {/* Exit Game Button */}
      <div className="absolute top-6 left-6 bg-black/50 rounded-lg p-3 text-white z-10">
        <button
          onClick={actualOnClose}
          className="text-white hover:text-gray-300 transition-colors"
          disabled={playerIsMoving}
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
        canGoBack={!playerIsMoving} // Disable navigation during movement
        isCorrectAnswer={isCorrectAnswer}
        disabled={playerIsMoving} // Pass disabled state to question box
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