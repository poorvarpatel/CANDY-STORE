// backend/server.js - Fixed OpenAI Version with 5 Answer Options
// NO CHANGES NEEDED - PDF export is handled client-side
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: '🤖 OpenAI-Powered Backend Running!', 
    timestamp: new Date().toISOString(),
    port: PORT,
    aiProvider: 'OpenAI GPT-3.5',
    aiEnabled: !!process.env.OPENAI_API_KEY
  });
});

// Test OpenAI connection
app.get('/test-openai', async (req, res) => {
  try {
    console.log('🧪 Testing OpenAI connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'OpenAI connection successful!' and briefly explain what you can do for education."
        }
      ],
      max_tokens: 100
    });

    res.json({
      success: true,
      message: 'OpenAI API working perfectly!',
      response: completion.choices[0].message.content,
      model: 'gpt-3.5-turbo'
    });

  } catch (error) {
    console.error('🧪 OpenAI Test Error:', error.message);
    res.json({
      success: false,
      error: error.message,
      suggestion: 'Check your OPENAI_API_KEY in backend/.env'
    });
  }
});

// 🔧 FIXED: AI Processing Function - Now forces 5 answer options
async function processWithAI(content, type, studentName, studentFocus) {
  console.log('🤖 Processing with OpenAI...');
  
  let prompt;
  
  if (type === 'student') {
    prompt = `You are an expert educational content analyzer. Create personalized learning content for student: ${studentName}

Student Focus Areas: ${studentFocus || 'General learning goals'}

Lesson Content:
${content}

Please provide:
1. Brief summary of key concepts
2. Key concepts relevant to this student's focus areas
3. Personalized learning objectives
4. Specific topics this student should focus on
5. 20 targeted quiz questions with EXACTLY 5 answer choices each (A, B, C, D, E). Format each question as:

Question X: [Question text]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]  
E) [Option 5]
Correct Answer: [Letter]
Explanation: [Brief explanation]

6. Make sure ALL questions have exactly 5 options - never use only A, B, C, D.

CRITICAL: Every single question must have options A, B, C, D, and E. Do not create questions with only 4 options.

Format your response as a clear, structured analysis that helps this student learn effectively.`;
  } else {
    prompt = `You are an expert educational content analyzer. Analyze the following lesson content and extract key concepts for classroom instruction.

Lesson Content:
${content}

Please provide:
1. A structured summary of key concepts
2. Main topics and subtopics
3. Important facts and relationships
4. 10-12 discussion questions for class engagement
5. Suggested quiz questions with EXACTLY 5 answer choices each (A, B, C, D, E)

For quiz questions, use this format:
Question X: [Question text]
A) [Option 1]
B) [Option 2] 
C) [Option 3]
D) [Option 4]
E) [Option 5]
Correct Answer: [Letter]

CRITICAL: Every single question must have options A, B, C, D, and E. Do not create questions with only 4 options.

Format your response as a clear educational summary that a teacher can review and use for lesson planning.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert educational content analyzer. When creating quiz questions, you MUST always provide exactly 5 answer choices (A, B, C, D, E) for each question. Never create questions with only 4 options."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2500, // Increased to accommodate 5-option questions
      temperature: 0.7
    });

    console.log('✅ OpenAI Success!');
    return completion.choices[0].message.content;

  } catch (error) {
    console.error('❌ OpenAI Error:', error.message);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

// Lesson processing endpoint
app.post('/api/process-lesson', async (req, res) => {
  console.log('🤖 OpenAI Processing request:', req.body);
  
  const { content, type, studentName, studentFocus, className } = req.body;

  try {
    // Process with OpenAI
    const aiResponse = await processWithAI(content, type, studentName, studentFocus);
    
    // Add personalization prefix for students
    let finalResponse = aiResponse;
    if (type === 'student') {
      finalResponse = `🎯 Personalized AI Content for ${studentName}:\n\n${aiResponse}`;
    } else {
      finalResponse = `📚 AI Analysis for ${className}:\n\n${aiResponse}`;
    }

    res.json({
      success: true,
      content: finalResponse,
      metadata: {
        type,
        studentName: studentName || null,
        processedAt: new Date().toISOString(),
        aiGenerated: true,
        aiProvider: 'OpenAI GPT-3.5',
        backendVersion: 'OpenAI-Powered v3.0'
      }
    });

  } catch (error) {
    console.error('🚨 OpenAI Error:', error.message);
    
    // Fallback to informative mock response
    let mockResponse;

    if (type === 'student') {
      mockResponse = `🎯 Personalized Content for ${studentName} (OpenAI Error - Mock Response)

❌ OpenAI Error: ${error.message}

📚 Mock Analysis of your content:
${content.substring(0, 300)}...

🎯 Student Focus Areas: ${studentFocus || 'General learning goals'}

📝 What OpenAI Will Generate:
1. Personalized quiz questions based on focus areas (with 5 options each)
2. Difficulty adjusted for this student  
3. Progress tracking recommendations
4. Custom learning objectives

🔧 Fix: Check your OPENAI_API_KEY in backend/.env

🎮 Ready for: Individual quiz session creation`;
    } else {
      mockResponse = `📚 Class Content Analysis for ${className} (OpenAI Error - Mock Response)

❌ OpenAI Error: ${error.message}

📖 Mock Analysis of your content:
${content.substring(0, 300)}...

🔍 What OpenAI Will Generate:
1. Structured summary of key concepts
2. Main topics and subtopics  
3. Learning objectives and assessments
4. 25 engaging quiz questions (with 5 options each)

🔧 Fix: Check your OPENAI_API_KEY in backend/.env

🎮 Ready for: Multi-room game creation`;
    }

    res.json({
      success: true,
      content: mockResponse,
      metadata: {
        type,
        studentName: studentName || null,
        processedAt: new Date().toISOString(),
        aiGenerated: false,
        error: error.message,
        backendVersion: 'OpenAI-Powered v3.0 (Fallback)'
      }
    });
  }
});

// 🔧 FIXED: Quiz generation endpoint - Now forces 5 answer options
app.post('/api/generate-quiz', async (req, res) => {
  console.log('🎯 OpenAI Quiz generation:', req.body);
  
  const { conceptSummary, studentGoals, difficulty = 'medium' } = req.body;

  try {
    // 🔧 IMPROVED PROMPT: More specific about 5 options
    const prompt = `You are creating educational quiz questions. Generate 8 multiple-choice questions at ${difficulty} difficulty level.

IMPORTANT: Each question MUST have exactly 5 answer choices labeled A, B, C, D, and E.

Educational Content:
${conceptSummary}

Student Goals: ${studentGoals || 'General understanding'}

FORMAT REQUIREMENTS (follow this exact format):
Question 1: [Your question here]
A) [Option 1]
B) [Option 2] 
C) [Option 3]
D) [Option 4]
E) [Option 5]
Correct Answer: [A, B, C, D, or E]
Explanation: [Brief explanation]

Question 2: [Your question here]
A) [Option 1]
B) [Option 2]
C) [Option 3] 
D) [Option 4]
E) [Option 5]
Correct Answer: [A, B, C, D, or E]
Explanation: [Brief explanation]

[Continue for all 8 questions]

CRITICAL: Do NOT generate questions with only 4 options. Every single question requires exactly 5 options (A through E).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert quiz creator. You MUST create questions with exactly 5 answer choices (A, B, C, D, E) for each question. Never use only 4 options."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000, // Increased for more detailed responses
      temperature: 0.7 // Slightly lower for more consistent formatting
    });
    
    res.json({
      success: true,
      questions: completion.choices[0].message.content,
      metadata: {
        difficulty,
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
        aiProvider: 'OpenAI GPT-3.5',
        optionCount: 5 // Track that we requested 5 options
      }
    });

  } catch (error) {
    console.error('🚨 OpenAI Quiz Error:', error.message);
    
    // 🔧 IMPROVED FALLBACK: Mock with 5 options
    res.json({
      success: true,
      questions: `🎯 Mock Quiz Questions (OpenAI Error - 5 Options)

❌ OpenAI Error: ${error.message}

📝 Sample questions with 5 options each:

Question 1: What is the main concept from the lesson?
A) First concept option
B) Second concept option  
C) Third concept option
D) Fourth concept option
E) Fifth concept option
Correct Answer: A
Explanation: Mock explanation for first option

Question 2: Which statement best describes the process?
A) Process description 1
B) Process description 2
C) Process description 3  
D) Process description 4
E) Process description 5
Correct Answer: C
Explanation: Mock explanation for third option

🔧 Fix: Check your OPENAI_API_KEY in backend/.env`,
      metadata: {
        difficulty,
        generatedAt: new Date().toISOString(),
        aiGenerated: false,
        error: error.message,
        optionCount: 5
      }
    });
  }
});

// Catch all other routes
app.get('*', (req, res) => {
  res.json({ 
    message: '🤖 OpenAI-Powered Educational Backend!',
    availableEndpoints: [
      'GET /health',
      'GET /test-openai',
      'POST /api/process-lesson',
      'POST /api/generate-quiz'
    ],
    aiProvider: 'OpenAI GPT-3.5',
    status: process.env.OPENAI_API_KEY ? 'Ready' : 'Missing API Key'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 OpenAI-Powered Backend running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 AI Provider: OpenAI GPT-3.5`);
  console.log(`🔑 API Key Status: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`🎯 Ready to create amazing educational content with 5-option quizzes!`);
});

module.exports = app;