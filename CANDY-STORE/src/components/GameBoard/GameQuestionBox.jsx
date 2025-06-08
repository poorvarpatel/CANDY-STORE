import React, { useState } from 'react';
import { TILE_COLORS, COLOR_SETS } from '../SceneElements/Tiles';
import { ChevronDown, ChevronUp } from 'lucide-react';

const GameQuestionBox = ({ 
  currentQuestion = null,
  onAnswerSelect,
  gameStats = { currentQuestion: 1, totalQuestions: 10, score: 0, totalAttempts: 0 }
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

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
    setSelectedAnswer(answerIndex);
    if (onAnswerSelect) {
      onAnswerSelect(answerIndex, colorKey);
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 z-20">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-800">Question {gameStats.currentQuestion}</span>
          <div className="text-sm text-indigo-600 font-medium">{gameStats.score}/{gameStats.totalAttempts}</div>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 z-20 w-[90vw] max-w-6xl">
      <div className="p-4">
        {/* Minimize Button */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold text-gray-800">Question {gameStats.currentQuestion}</div>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Minimize to view game"
          >
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-start space-x-6">
          {/* Question Section - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[60px]">
              {currentQuestion ? (
                <p className="text-gray-800 text-sm leading-relaxed">{currentQuestion.text}</p>
              ) : (
                <p className="text-gray-600 italic text-sm">What is the primary function of the mitochondria in a cell?</p>
              )}
            </div>
          </div>

          {/* Answer Choices - Right Side */}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-700 mb-3">Choose your answer:</div>
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
                    className={`w-full p-3 rounded-lg border-2 ${colorClasses.border} ${colorClasses.bg} ${colorClasses.hoverBg} transition-colors text-left ${
                      selectedAnswer === index ? 'ring-2 ring-gray-400' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: colorStyle }}
                      >
                        <span className="text-white font-bold text-xs">{letter}</span>
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">
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
            <div className="text-xs text-gray-600 mb-1">Score</div>
            <div className="text-xl font-bold text-indigo-600">{gameStats.score}/{gameStats.totalAttempts}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameQuestionBox;