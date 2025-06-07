import React, { useState, useRef, useEffect } from 'react';
import { Users, Plus, Shuffle, Settings, Play } from 'lucide-react';

const GameRoomCreator = ({ 
  students = [
    // Default students for testing if none provided
    { id: 1, name: 'Alice Johnson', email: 'alice@school.edu' },
    { id: 2, name: 'Bob Smith', email: 'bob@school.edu' },
    { id: 3, name: 'Carol Brown', email: 'carol@school.edu' },
    { id: 4, name: 'David Wilson', email: 'david@school.edu' },
    { id: 5, name: 'Emma Davis', email: 'emma@school.edu' },
    { id: 6, name: 'Frank Miller', email: 'frank@school.edu' },
    { id: 7, name: 'Grace Lee', email: 'grace@school.edu' },
    { id: 8, name: 'Henry Taylor', email: 'henry@school.edu' }
  ], 
  conceptSummary = '', 
  onCreateRooms, 
  onBack 
}) => {
  const [assignmentMode, setAssignmentMode] = useState('auto'); // 'auto' or 'manual'
  const [audioVideoMode, setAudioVideoMode] = useState('off');
  const [rooms, setRooms] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [numRooms, setNumRooms] = useState(3);
  const [studentsPerRoom, setStudentsPerRoom] = useState(Math.ceil(students.length / 3));
  const [lastInputType, setLastInputType] = useState('rooms'); // 'rooms' or 'students'
  const [autoAssignmentNote, setAutoAssignmentNote] = useState('');
  const [usedColors, setUsedColors] = useState(new Set());
  const canvasRef = useRef(null);

  // Room colors for visual distinction
  const roomColors = [
    'bg-blue-100 border-blue-300 text-blue-800',
    'bg-green-100 border-green-300 text-green-800', 
    'bg-purple-100 border-purple-300 text-purple-800',
    'bg-orange-100 border-orange-300 text-orange-800',
    'bg-pink-100 border-pink-300 text-pink-800',
    'bg-yellow-100 border-yellow-300 text-yellow-800',
    'bg-indigo-100 border-indigo-300 text-indigo-800',
    'bg-red-100 border-red-300 text-red-800'
  ];

  // Auto-populate rooms with students
  const autoPopulateRooms = (inputNumRooms = null, inputStudentsPerRoom = null, inputType = 'rooms') => {
    setLastInputType(inputType);
    let finalNumRooms, finalStudentsPerRoom;
    let note = '';

    if (inputType === 'rooms') {
      // Teacher adjusted number of rooms
      finalNumRooms = inputNumRooms || numRooms;
      finalStudentsPerRoom = Math.ceil(students.length / finalNumRooms);
      
      if (inputStudentsPerRoom && finalStudentsPerRoom !== inputStudentsPerRoom) {
        note = `Adjusted to ${finalStudentsPerRoom} students per room to accommodate ${finalNumRooms} rooms with ${students.length} total students.`;
      }
      setStudentsPerRoom(finalStudentsPerRoom);
    } else {
      // Teacher adjusted students per room
      finalStudentsPerRoom = inputStudentsPerRoom || studentsPerRoom;
      finalNumRooms = Math.ceil(students.length / finalStudentsPerRoom);
      
      if (inputNumRooms && finalNumRooms !== inputNumRooms) {
        note = `Adjusted to ${finalNumRooms} rooms to accommodate ${finalStudentsPerRoom} students per room with ${students.length} total students.`;
      }
      setNumRooms(finalNumRooms);
    }

    setAutoAssignmentNote(note);
    
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
    const newRooms = Array.from({ length: finalNumRooms }, (_, i) => ({
      id: `room-${i + 1}`,
      name: `Room ${i + 1}`,
      color: roomColors[i % roomColors.length],
      students: []
    }));

    const newAssignments = {};
    shuffledStudents.forEach((student, index) => {
      const roomIndex = Math.floor(index / finalStudentsPerRoom);
      if (roomIndex < finalNumRooms) {
        newRooms[roomIndex].students.push(student);
        newAssignments[student.id] = roomIndex;
      }
    });

    // Update used colors
    setUsedColors(new Set(newRooms.map((_, i) => i % roomColors.length)));
    setRooms(newRooms);
    setStudentAssignments(newAssignments);
  };

  // Add a new room for manual assignment
  const addRoom = () => {
    // Find the next available color
    let colorIndex = 0;
    while (usedColors.has(colorIndex) && colorIndex < roomColors.length) {
      colorIndex++;
    }
    
    // If all colors are used, cycle back (shouldn't happen with 8 colors)
    if (colorIndex >= roomColors.length) {
      colorIndex = rooms.length % roomColors.length;
    }

    const newRoom = {
      id: `room-${rooms.length + 1}`,
      name: `Room ${rooms.length + 1}`,
      color: roomColors[colorIndex],
      students: []
    };
    
    setRooms([...rooms, newRoom]);
    setUsedColors(prev => new Set([...prev, colorIndex]));
  };

  // Remove a room and unassign its students
  const removeRoom = (roomIndex) => {
    const roomToRemove = rooms[roomIndex];
    const newAssignments = { ...studentAssignments };
    
    // Unassign students from this room
    roomToRemove.students.forEach(student => {
      delete newAssignments[student.id];
    });
    
    // Find the color index of the removed room
    const removedColorIndex = roomColors.findIndex(color => color === roomToRemove.color);
    
    setRooms(rooms.filter((_, i) => i !== roomIndex));
    setStudentAssignments(newAssignments);
    setUsedColors(prev => {
      const newUsedColors = new Set(prev);
      newUsedColors.delete(removedColorIndex);
      return newUsedColors;
    });
  };

  // Handle assignment mode change
  const handleAssignmentModeChange = (newMode) => {
    setAssignmentMode(newMode);
    
    if (newMode === 'manual') {
      // Clear all rooms and start with one empty room
      setRooms([{
        id: 'room-1',
        name: 'Room 1',
        color: roomColors[0],
        students: []
      }]);
      setStudentAssignments({});
      setUsedColors(new Set([0]));
      setAutoAssignmentNote('');
    } else if (newMode === 'auto') {
      // Auto-populate with current settings
      autoPopulateRooms();
    }
  };

  // Assign selected students to a room
  const assignStudentsToRoom = (roomIndex) => {
    if (selectedStudents.length === 0) return;

    const newRooms = [...rooms];
    const newAssignments = { ...studentAssignments };

    // Remove students from their current rooms
    selectedStudents.forEach(student => {
      const currentRoomIndex = newAssignments[student.id];
      if (currentRoomIndex !== undefined) {
        newRooms[currentRoomIndex].students = newRooms[currentRoomIndex].students.filter(s => s.id !== student.id);
      }
    });

    // Add students to new room
    selectedStudents.forEach(student => {
      newRooms[roomIndex].students.push(student);
      newAssignments[student.id] = roomIndex;
    });

    setRooms(newRooms);
    setStudentAssignments(newAssignments);
    setSelectedStudents([]);
  };

  // Unassign students from all rooms
  const unassignStudents = () => {
    if (selectedStudents.length === 0) return;

    const newRooms = [...rooms];
    const newAssignments = { ...studentAssignments };

    selectedStudents.forEach(student => {
      const currentRoomIndex = newAssignments[student.id];
      if (currentRoomIndex !== undefined) {
        newRooms[currentRoomIndex].students = newRooms[currentRoomIndex].students.filter(s => s.id !== student.id);
        delete newAssignments[student.id];
      }
    });

    setRooms(newRooms);
    setStudentAssignments(newAssignments);
    setSelectedStudents([]);
  };

  // Get student tile style based on assignment
  const getStudentTileStyle = (student) => {
    const roomIndex = studentAssignments[student.id];
    const isSelected = selectedStudents.some(s => s.id === student.id);
    
    let baseStyle = "p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ";
    
    if (isSelected) {
      baseStyle += "ring-2 ring-blue-500 ";
    }
    
    if (roomIndex !== undefined) {
      baseStyle += rooms[roomIndex]?.color || 'bg-gray-100 border-gray-300';
    } else {
      baseStyle += "bg-white border-gray-300 hover:border-gray-400";
    }
    
    return baseStyle;
  };

  // Toggle student selection
  const toggleStudentSelection = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.some(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  // Initialize with auto-populated rooms
  useEffect(() => {
    if (assignmentMode === 'auto' && students.length > 0 && rooms.length === 0) {
      const initialStudentsPerRoom = Math.ceil(students.length / numRooms);
      setStudentsPerRoom(initialStudentsPerRoom);
      autoPopulateRooms(numRooms, initialStudentsPerRoom, 'rooms');
    }
  }, [students.length, assignmentMode, rooms.length]); // Run when students change OR when mode changes to auto

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Create Game Rooms</h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onCreateRooms({ rooms, audioVideoMode, conceptSummary })}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Games</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Settings Panel */}
        <div className="bg-white rounded-xl shadow-sm mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Game Configuration</h2>
          
          {/* Assignment Mode Toggle */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Assignment Method</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleAssignmentModeChange('auto')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  assignmentMode === 'auto' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Shuffle className="w-4 h-4" />
                <span>Auto Populate</span>
              </button>
              <button
                onClick={() => handleAssignmentModeChange('manual')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  assignmentMode === 'manual' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Manual Assignment</span>
              </button>
            </div>
          </div>

          {/* Audio/Video Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Audio/Video Settings (Default)</h3>
            <div className="flex space-x-4">
              {[
                { value: 'off', label: 'Off', desc: 'Auto-transcription starts when someone unmutes' },
                { value: 'audio-only', label: 'Audio Only', desc: 'Mics on, cameras optional' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    checked={audioVideoMode === option.value}
                    onChange={(e) => setAudioVideoMode(e.target.value)}
                    className="text-indigo-600"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    <p className="text-xs text-gray-600">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Auto Mode Controls */}
          {assignmentMode === 'auto' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Auto Assignment Controls</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Number of Rooms:</label>
                  <select 
                    value={numRooms}
                    onChange={(e) => {
                      const newNumRooms = parseInt(e.target.value);
                      setNumRooms(newNumRooms);
                      autoPopulateRooms(newNumRooms, null, 'rooms');
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Students per Room:</label>
                  <select 
                    value={studentsPerRoom}
                    onChange={(e) => {
                      const newStudentsPerRoom = parseInt(e.target.value);
                      setStudentsPerRoom(newStudentsPerRoom);
                      autoPopulateRooms(null, newStudentsPerRoom, 'students');
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {Array.from({length: Math.min(10, students.length)}, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => autoPopulateRooms(numRooms, studentsPerRoom, lastInputType)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Shuffle Again
                </button>
              </div>
              {autoAssignmentNote && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  <strong>Note:</strong> {autoAssignmentNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Room Management Interface */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side: Room Management */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Game Rooms ({rooms.length})</h3>
              {assignmentMode === 'manual' && (
                <button
                  onClick={addRoom}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Room</span>
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className={`border-2 rounded-lg p-4 ${room.color} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => assignmentMode === 'manual' && assignStudentsToRoom(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => {
                        const newRooms = [...rooms];
                        newRooms[index].name = e.target.value;
                        setRooms(newRooms);
                      }}
                      className="font-medium bg-transparent border-none outline-none text-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">({room.students.length} students)</span>
                      {assignmentMode === 'manual' && rooms.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRoom(index);
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {room.students.map(student => (
                      <span
                        key={student.id}
                        className="inline-block bg-white bg-opacity-50 px-2 py-1 rounded text-xs"
                      >
                        {student.name}
                      </span>
                    ))}
                  </div>
                  {assignmentMode === 'manual' && selectedStudents.length > 0 && (
                    <div className="mt-2 text-xs opacity-75">
                      Click to assign {selectedStudents.length} selected student{selectedStudents.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Student Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Students ({students.length})</h3>
              {assignmentMode === 'manual' && selectedStudents.length > 0 && (
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-600">{selectedStudents.length} selected</span>
                  <button
                    onClick={unassignStudents}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Unassign
                  </button>
                  <button
                    onClick={() => setSelectedStudents([])}
                    className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No students found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {students.map(student => (
                  <div
                    key={student.id}
                    className={getStudentTileStyle(student)}
                    onClick={() => assignmentMode === 'manual' && toggleStudentSelection(student)}
                  >
                    <div className="font-medium text-sm">{student.name}</div>
                    <div className="text-xs text-gray-600">{student.email}</div>
                    {studentAssignments[student.id] !== undefined && (
                      <div className="text-xs mt-1 font-medium">
                        {rooms[studentAssignments[student.id]]?.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {assignmentMode === 'manual' && students.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>Manual Assignment Instructions:</strong>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Click students to select/deselect them</li>
                  <li>• Click a room to assign selected students</li>
                  <li>• Use "Unassign" to remove students from rooms</li>
                  <li>• Students change color based on room assignment</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Session Summary</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Students:</span> {students.length}
            </div>
            <div>
              <span className="font-medium">Assigned Students:</span> {Object.keys(studentAssignments).length}
            </div>
            <div>
              <span className="font-medium">Unassigned Students:</span> {students.length - Object.keys(studentAssignments).length}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Audio/Video: {audioVideoMode === 'off' ? 'Off' : 'Audio Only'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoomCreator;