# CANDY-STORE
For teachers and recent graduates of CANDY LAND (R)

# Educational Game Platform 🎮📚

An AI-powered educational platform that transforms teacher lesson plans into personalized, multiplayer Candyland-style board games, enabling teachers to provide individualized learning experiences for every student.

## 🎯 **Mission Statement**

**Empowering teachers to deliver personalized education at scale through gamified learning experiences.**

## 📋 **Problem & Solution**

### **The Challenge**
Teachers of young children increasingly struggle as they aim to provide personalized
lessons to each student depending on the student’s individual needs. While a classroom full of
students naturally feel individually challenged by various concepts, the pandemic exacerbated
the problem. During the pandemic, many students were in different places of mastery in their
lessons and teachers struggled to ensure that students continued their educations. However,
afterwards, as students began coming back to school, it became clear that students were
coming back at highly varying levels of education and social situational awareness.

### **My Solution**
A comprehensive platform that allows teachers to:
- Transform lesson plans into engaging, personalized games for each student
- Provide self-paced, individualized learning experiences
- Track student progress and identify learning gaps
- Create multiplayer environments that foster community and motivation
- Deliver targeted homework assignments with clear explanations

## ***SetUp**
Split the terminal.
- In one terminal move into the backend folder. To launch, "npm start"
- In the other terminal, move into the main CANDY-STORE folder (the inner-most one). To launch, "npm run dev"

## ✨ **Key Features**

### **For Teachers**
- **Multi-Class Management**: Seamless navigation between different classes
- **AI-Powered Content Generation**: Transform lesson plans into concept summaries and personalized questions
- **Flexible File Support**: Upload lesson plans via drag-and-drop (PDF, DOC, DOCX, JPG, XLS, PPT)
- **Advanced Room Management**: 
  - Auto-populate rooms with intelligent student balancing
  - Manual drag-and-drop student assignment with visual feedback
  - Color-coded room system with real-time adjustments
  - Multi-select student interface with unassign/reassign capabilities
- **Audio/Video Controls**: Configurable settings with automatic transcription capabilities
- **Student Progress Tracking**: Individual notes, progress indicators, and achievement badges
- **Learning Goals**: Specify focus areas to keep questions within scope
- **Auto-Save Functionality**: Never lose your student notes or progress

### **For Students**
- **Candyland-Style Gameplay**: Move tokens across a colorful board with correct answers
- **Multiplayer Experience**: Play with up to 5 classmates in engaging game rooms
- **Personalized Questions**: AI-generated content tailored to individual learning needs
- **Unlimited Attempts**: Learn at your own pace with clear explanations for wrong answers
- **Anti-Cheating Measures**: Transcript monitoring and controlled audio/video settings

### **Game Mechanics**
- **5-Color System**: Red, teal, light green, orange, and purple tiles and answer choices
- **Special Tiles**: Rainbow tiles (any color) and rare Gate tiles (5% chance) that teleport players forward
- **3D Environment**: Immersive Three.js-powered game board
- **Smart Movement**: Advance to the next matching color tile with correct answers
- **Question Management**: Students can retry missed questions; no shared questions between players

## 🛠 **Technology Stack**

### **Frontend**
- **React** - Main framework with hooks (useState, useEffect, useRef)
- **Three.js** - 3D graphics engine for game board rendering
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Additional Three.js utilities (OrbitControls)
- **JavaScript ES6+** - Modern JavaScript features
- **HTML5 Canvas API** - Path drawing interface
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Lucide React** - Icon library for UI components

### **AI & Backend**
- **OpenAI API** - Core AI functionality for content generation and question parsing

### **Development Tools**
- **Claude (Anthropic)** - Development assistance and code generation
- **ChatGPT (OpenAI)** - Development assistance and planning

### **File Processing**
- Support for multiple formats: PDF, DOC, DOCX, JPG, XLS, PPT
- Drag-and-drop file upload interface

## 🚀 **Getting Started**

### **For Teachers**
1. Create your account and set up your class roster
2. Upload lesson plans or input learning objectives
3. Review AI-generated concept summaries and customize learning goals
4. Configure game rooms using advanced assignment tools:
   - **Auto-populate**: Intelligent room balancing with customizable parameters
   - **Manual assignment**: Drag-and-drop interface with visual feedback
   - **Audio/video settings**: Control communication and transcription features
5. Monitor student progress through comprehensive analytics dashboard

### **For Students**
1. Join your assigned game room or enter a practice session
2. **Create custom adventure paths** using the interactive drawing canvas
3. **Experience 3D gameplay** as your 2D drawing transforms into an immersive board
4. Answer personalized questions and move your token with correct answers
5. Learn from detailed explanations when answers are incorrect
6. Compete and collaborate with classmates in a fun, educational environment

## 📊 **Progress Tracking**

- **Individual Student Analytics**: Track correct answers, attempted questions, and learning patterns
- **Class-Wide Insights**: Identify concepts that need additional focus
- **Teacher Notes**: Maintain detailed notes for each student with auto-save functionality
- **Achievement System**: Motivate students with progress indicators and badges

## 🎮 **Multiplayer Features**

- **Room Capacity**: 1-6 players per game room
- **Fair Play**: Each student receives unique questions tailored to their needs
- **Optional Audio/Video**: Teachers can enable cameras and microphones for enhanced engagement
- **Transcript Recording**: Monitor sessions for learning insights and prevent cheating
- **Community Building**: Foster collaboration while maintaining individual learning paths

## 🏗 **Development Roadmap**

- **Phase 1**: Core gameplay and teacher dashboard
- **Phase 2**: Advanced analytics and reporting
- **Phase 3**: Solo-play mode and extended multiplayer features
- **Phase 4**: Mobile app development
- **Phase 5**: Advanced AI personalization and adaptive learning

## 🙏 **Acknowledgments**

This project was developed with assistance from:
- **Claude (Anthropic)** - Development assistance, code generation, and architectural guidance
- **ChatGPT (OpenAI)** - Project planning, feature development, and problem-solving
- **OpenAI API** - Powering the core AI functionality that generates personalized educational content

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for teachers and students everywhere**
