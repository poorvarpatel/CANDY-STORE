import React, { useState, useEffect } from 'react';
import { TILE_COLORS, COLOR_SETS } from '../SceneElements/Tiles';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

const GameQuestionBox = ({ 
  currentQuestion = null,
  onAnswerSelect,
  onNavigateQuestion,
  gameStats = { currentQuestion: 1, totalQuestions: 10, score: 0, totalAttempts: 0 },
  canGoBack = true,
  isCorrectAnswer = false,
  disabled = false // New prop to disable interactions during player movement
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showingResult, setShowingResult] = useState(false);

  // Auto-minimize when correct answer is chosen
  useEffect(() => {
    if (isCorrectAnswer && selectedAnswer !== null) {
      setShowingResult(true);
      setIsMinimized(true);
      
      // Auto-restore after 3 seconds for next question
      const timer = setTimeout(() => {
        setIsMinimized(false);
        setShowingResult(false);
        setSelectedAnswer(null); // Reset for next question
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isCorrectAnswer, selectedAnswer]);

  // Reset selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestion?.id]);

  // Get the 5 game colors
  const gameColors = COLOR_SETS.game; // ['red', 'blue', 'green', 'yellow', 'purple']
  
  // Convert hex colors to CSS-compatible format
  const getColorStyle = (colorKey) => {
    const color = TILE_COLORS[colorKey];
    return `#${color.hex.toString(16).padStart(6, '0')}`;
  };

  // Get Tailwind-compatible color classes for backgrounds and borders
  const getColorClasses = (colorKey) => {
    const colorMap = {
      red: { bg: 'bg-red-50', hoverBg: 'hover:bg-red-100', border: 'border-red-300' },
      blue: { bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-100', border: 'border-blue-300' },
      green: { bg: 'bg-green-50', hoverBg: 'hover:bg-green-100', border: 'border-green-300' },
      yellow: { bg: 'bg-yellow-50', hoverBg: 'hover:bg-yellow-100', border: 'border-yellow-300' },
      purple: { bg: 'bg-purple-50', hoverBg: 'hover:bg-purple-100', border: 'border-purple-300' }
    };
    return colorMap[colorKey] || colorMap.red;
  };

  const handleAnswerClick = (answerIndex, colorKey) => {
    // Don't allow answer selection if disabled (player is moving)
    if (disabled) {
      console.log('🚫 Answer selection disabled - player is moving');
      return;
    }
    
    console.log(`🎯 Answer selected: ${answerIndex} (${colorKey})`);
    setSelectedAnswer(answerIndex);
    if (onAnswerSelect) {
      onAnswerSelect(answerIndex, colorKey);
    }
  };

  const handleNavigateQuestion = (direction) => {
    // Don't allow navigation if disabled (player is moving)
    if (disabled) {
      console.log('🚫 Question navigation disabled - player is moving');
      return;
    }
    
    if (onNavigateQuestion) {
      onNavigateQuestion(direction);
      setSelectedAnswer(null); // Reset selection when navigating
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-20">
        <button
          onClick={() => !disabled && setIsMinimized(false)}
          disabled={disabled}
          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
            disabled 
              ? 'cursor-not-allowed opacity-50' 
              : 'hover:bg-gray-50 cursor-pointer'
          }`}
        >
          <ChevronUp className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">
            {showingResult ? '🎉 Watching animation...' : `Question ${gameStats.currentQuestion}`}
          </span>
          <div className="text-sm text-indigo-600 font-medium">{gameStats.score}/{gameStats.totalAttempts}</div>
          {disabled && (
            <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              Player moving...
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-xl shadow-2xl border border-gray-200 z-20 w-[90vw] max-w-6xl transition-opacity ${
      disabled ? 'bg-gray-100/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      {/* Disabled overlay indicator */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-200/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-orange-700 font-medium">Player is moving to next tile...</span>
          </div>
        </div>
      )}
      
      <div className="p-4">
        {/* Header with Navigation and Minimize */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            {/* Previous Question Button */}
            {canGoBack && gameStats.currentQuestion > 1 && (
              <button
                onClick={() => handleNavigateQuestion('previous')}
                disabled={disabled}
                className={`p-2 rounded-lg transition-colors ${
                  disabled 
                    ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                    : 'hover:bg-gray-100 cursor-pointer'
                }`}
                title={disabled ? "Navigation disabled - player moving" : "Previous question"}
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            
            <div className="text-lg font-bold text-gray-800">
              Question {gameStats.currentQuestion}
              {canGoBack && !disabled && (
                <span className="text-sm text-gray-500 ml-2">
                  (Click ← to review previous questions)
                </span>
              )}
            </div>
            
            {/* Next Question Button - for reviewing */}
            {canGoBack && gameStats.currentQuestion < gameStats.totalQuestions && (
              <button
                onClick={() => handleNavigateQuestion('next')}
                disabled={disabled}
                className={`p-2 rounded-lg transition-colors ${
                  disabled 
                    ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                    : 'hover:bg-gray-100 cursor-pointer'
                }`}
                title={disabled ? "Navigation disabled - player moving" : "Next question"}
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          <button
            onClick={() => !disabled && setIsMinimized(true)}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${
              disabled 
                ? 'cursor-not-allowed opacity-50 bg-gray-100' 
                : 'hover:bg-gray-100 cursor-pointer'
            }`}
            title={disabled ? "Cannot minimize - player moving" : "Minimize to view game"}
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-start space-x-6">
          {/* Question Section - Left Side */}
          <div className="flex-1 min-w-0">
            <div className={`rounded-lg p-4 border min-h-[60px] ${
              disabled ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'
            }`}>
              {currentQuestion ? (
                <p className={`text-sm leading-relaxed ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>
                  {currentQuestion.text}
                </p>
              ) : (
                <p className={`italic text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  What is the primary function of the mitochondria in a cell?
                </p>
              )}
            </div>
          </div>

          {/* Answer Choices - Right Side */}
          <div className="flex-1">
            <div className={`text-sm font-semibold mb-3 ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
              Choose your answer:
              {disabled && <span className="text-orange-600 ml-2">(Waiting for player movement...)</span>}
            </div>
            <div className="space-y-2">
              {gameColors.map((colorKey, index) => {
                const letter = String.fromCharCode(65 + index); // A, B, C, D, E
                const colorStyle = getColorStyle(colorKey);
                const colorClasses = getColorClasses(colorKey);
                const colorName = TILE_COLORS[colorKey].name;
                
                return (
                  <button
                    key={colorKey}
                    onClick={() => handleAnswerClick(index, colorKey)}
                    disabled={disabled}
                    className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                      disabled 
                        ? 'cursor-not-allowed opacity-50 bg-gray-100 border-gray-300' 
                        : `${colorClasses.border} ${colorClasses.bg} ${colorClasses.hoverBg} cursor-pointer`
                    } ${
                      selectedAnswer === index ? 'ring-2 ring-gray-400' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ 
                          backgroundColor: disabled ? '#9CA3AF' : colorStyle,
                          opacity: disabled ? 0.5 : 1
                        }}
                      >
                        <span className="text-white font-bold text-xs">{letter}</span>
                      </div>
                      <span className={`text-sm leading-relaxed ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
                        {currentQuestion?.answers?.[index] || `${colorName} - This is where a full sentence answer would appear for choice ${letter}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Score - Compact Right Side */}
          <div className="text-center flex-shrink-0">
            <div className={`text-xs mb-1 ${disabled ? 'text-gray-500' : 'text-gray-600'}`}>Score</div>
            <div className={`text-xl font-bold ${disabled ? 'text-gray-500' : 'text-indigo-600'}`}>
              {gameStats.score}/{gameStats.totalAttempts}
            </div>
            {disabled && (
              <div className="text-xs text-orange-600 mt-1">
                Paused
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameQuestionBox;