// backend/server.js - Fresh OpenAI Version
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

// AI Processing Function
async function processWithAI(content, type, studentName, studentFocus) {
  console.log('🤖 Processing with OpenAI...');
  
  let prompt;
  
  if (type === 'student') {
    prompt = `You are an expert educational content analyzer. Create personalized learning content for student: ${studentName}

Student Focus Areas: ${studentFocus || 'General learning goals'}

Lesson Content:
${content}

Please provide:
1. Key concepts relevant to this student's focus areas
2. Personalized learning objectives
3. Specific topics this student should focus on  
4. 8-10 targeted quiz questions appropriate for individual study

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
5. Suggested quiz questions

Format your response as a clear educational summary that a teacher can review and use for lesson planning.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert educational content analyzer specializing in creating engaging learning materials."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
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
1. Personalized quiz questions based on focus areas
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
4. 12 engaging quiz questions

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

// Quiz generation endpoint
app.post('/api/generate-quiz', async (req, res) => {
  console.log('🎯 OpenAI Quiz generation:', req.body);
  
  const { conceptSummary, studentGoals, difficulty = 'medium' } = req.body;

  try {
    const prompt = `Based on the following educational content, generate 8 multiple-choice quiz questions at ${difficulty} difficulty level.

Educational Content:
${conceptSummary}

Student Goals: ${studentGoals || 'General understanding'}

For each question, provide:
1. Clear question text
2. 4 answer choices (A, B, C, D)  
3. Correct answer
4. Brief explanation

Format as a numbered list of questions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", 
          content: "You are an expert quiz creator for educational content. Create engaging, accurate multiple-choice questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.8
    });
    
    res.json({
      success: true,
      questions: completion.choices[0].message.content,
      metadata: {
        difficulty,
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
        aiProvider: 'OpenAI GPT-3.5'
      }
    });

  } catch (error) {
    console.error('🚨 OpenAI Quiz Error:', error.message);
    
    res.json({
      success: true,
      questions: `🎯 Mock Quiz Questions (OpenAI Error)

❌ OpenAI Error: ${error.message}

📝 Sample questions based on your content:

1. Question: What is the main concept from the lesson?
   A) Option 1  B) Option 2  C) Option 3  D) Option 4
   Correct: A
   Explanation: Mock explanation

🔧 Fix: Check your OPENAI_API_KEY in backend/.env`,
      metadata: {
        difficulty,
        generatedAt: new Date().toISOString(),
        aiGenerated: false,
        error: error.message
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
  console.log(`🎯 Ready to create amazing educational content!`);
});

module.exports = app;