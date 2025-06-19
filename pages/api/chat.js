// pages/api/chat.js - Optimized SINDA Chat API
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// SINDA Programs Database (Comprehensive but optimized)
const SINDA_PROGRAMS = {
  education: {
    name: "Education Programs",
    programs: [
      {
        name: "SINDA Tutorials for Enhanced Performance (STEP)",
        description: "Flagship tuition program for Primary and Secondary students",
        subjects: "English, Mathematics, Science, Mother Tongue languages",
        levels: "Primary 1-6, Secondary 1-5",
        eligibility: "Per capita income ≤ $1,600, Singapore citizens/PRs of Indian descent",
        fees: "$10/hour if household income below $2,500, $15/hour if $2,501-$4,000",
        centres: "Multiple locations across Singapore",
        contact: "1800 295 3333"
      },
      {
        name: "STEP Plus",
        description: "Holistic development program focusing on non-academic skills",
        features: "Time management, cyber-wellness, goal-setting workshops",
        contact: "1800 295 3333"
      },
      {
        name: "A-Level Tuition @ STEP",
        description: "Specialized tuition for Junior College students",
        levels: "JC1-JC2",
        contact: "1800 295 3333"
      }
    ]
  },
  family: {
    name: "Family & Social Services",
    programs: [
      {
        name: "SINDA Family Service Centre",
        description: "Comprehensive family support services",
        services: ["Individual and family counselling", "Case management", "Crisis intervention"],
        address: "1 Beatty Road, Singapore 209943",
        contact: "1800 295 3333"
      },
      {
        name: "Financial Assistance Schemes",
        description: "Emergency financial aid and ongoing support",
        types: ["Emergency cash assistance", "Monthly support", "Bill payment assistance"],
        eligibility: "Per capita income ≤ $1,600, families in crisis",
        contact: "1800 295 3333"
      }
    ]
  },
  youth: {
    name: "Youth Development",
    programs: [
      {
        name: "SINDA Youth Club (SYC)",
        description: "Leadership development for young adults",
        ageGroup: "18-35 years old",
        focus: "Community building, social leadership, networking",
        contact: "1800 295 3333"
      }
    ]
  }
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  // Validate required environment variable
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY environment variable');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'AI service is not properly configured. Please contact support.',
      contact: '1800 295 3333'
    });
  }

  try {
    const { message, messages = [], userInfo = {} } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide a valid message'
      });
    }

    // Rate limiting check (basic)
    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'Please keep your message under 1000 characters'
      });
    }

    // Enhanced system prompt for SINDA
    const systemPrompt = `You are a helpful, knowledgeable SINDA (Singapore Indian Development Association) assistant. Your role is to provide accurate information about SINDA programs and services in a friendly, professional manner.

**Your personality:**
- Warm, empathetic, and culturally sensitive
- Professional but approachable
- Patient and understanding
- Focused on helping users find the right support

**Key SINDA Information:**
- **Main Contact**: 1800 295 3333 (24/7 hotline)
- **Address**: 1 Beatty Road, Singapore 209943
- **Email**: queries@sinda.org.sg
- **General Eligibility**: Most programs require per capita income ≤ $1,600 for Singapore citizens/PRs of Indian descent

**Main Programs:**
1. **STEP Tuition** (Most Popular)
   - Primary/Secondary students
   - $10-15/hour based on income
   - English, Math, Science, Mother Tongue
   - Multiple centres across Singapore

2. **Family Services**
   - Family counselling and support
   - Emergency financial assistance
   - Crisis intervention
   - Case management

3. **Youth Programs**
   - SINDA Youth Club (18-35 years)
   - Leadership development
   - Career mentoring

**Response Guidelines:**
- Keep responses conversational and helpful (2-3 sentences)
- Ask clarifying questions when needed
- Provide specific program details when relevant
- For crisis situations, immediately direct to 1800 295 3333
- Always end with a helpful next step
- Use simple, clear language

**Crisis Keywords to Watch For:** emergency, urgent, crisis, desperate, suicide, homeless, no money, eviction
- If detected, immediately provide crisis contact information

**Example Responses:**
- "That sounds like exactly what our STEP program is designed for! It's our most popular tuition program..."
- "I understand this must be challenging for you. Let me help you find the right support..."
- "For immediate assistance with that, please call SINDA at 1800 295 3333 right away..."

Remember: You're helping people access life-changing support. Every interaction matters.`;

    // Build conversation context
    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-4).map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message.trim() }
    ];

    // Call OpenAI API with error handling
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the cost-effective model
      messages: conversationMessages,
      temperature: 0.7,
      max_tokens: 350, // Shorter responses for better UX
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.4,
    });

    const aiMessage = response.choices[0].message.content;

    // Enhanced crisis detection
    const crisisKeywords = [
      'emergency', 'urgent', 'crisis', 'immediate help', 'desperate', 
      'eviction', 'no money', 'can\'t afford', 'homeless', 'suicide', 
      'hurt myself', 'end it all', 'nowhere to turn', 'give up',
      'unemployed', 'lost job', 'debt', 'overwhelmed'
    ];
    
    const isCrisis = crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    // Program categorization for analytics
    const programKeywords = {
      education: ['tuition', 'school', 'study', 'education', 'student', 'step', 'academic'],
      family: ['family', 'counselling', 'financial help', 'emergency', 'crisis', 'support'],
      youth: ['youth', 'young', 'leadership', 'career', 'job', 'club']
    };

    let suggestedPrograms = [];
    const lowerMessage = message.toLowerCase();
    
    Object.entries(programKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        suggestedPrograms.push(category);
      }
    });

    // Enhanced response for crisis situations
    let enhancedResponse = aiMessage;
    
    if (isCrisis) {
      enhancedResponse += "\n\n🚨 **IMMEDIATE HELP AVAILABLE**: Please call SINDA at **1800 295 3333** right now. They have 24/7 emergency assistance and trained counselors ready to help you.";
    }

    // Add helpful next steps for applications
    if (message.toLowerCase().includes('apply') || message.toLowerCase().includes('how to start')) {
      enhancedResponse += "\n\n📞 **Ready to apply?** Call SINDA at **1800 295 3333** or visit 1 Beatty Road, Singapore 209943. They'll guide you through the process!";
    }

    // Successful response
    res.status(200).json({ 
      message: enhancedResponse,
      isCrisis,
      suggestedPrograms,
      timestamp: new Date().toISOString(),
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Determine error type and provide appropriate response
    let errorMessage = 'I\'m experiencing technical difficulties right now.';
    let statusCode = 500;

    if (error.code === 'insufficient_quota') {
      errorMessage = 'The AI service is temporarily unavailable due to quota limits.';
      statusCode = 503;
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'There\'s a configuration issue with the AI service.';
      statusCode = 500;
    }

    // Always provide fallback contact information
    const fallbackMessage = `${errorMessage}

**For immediate assistance:**
📞 **Call SINDA directly: 1800 295 3333** (24/7)
🏢 **Visit**: 1 Beatty Road, Singapore 209943
📧 **Email**: queries@sinda.org.sg

**Popular programs:**
🎓 **STEP tuition** - Primary/Secondary students
👨‍👩‍👧‍👦 **Family services** - Counselling and financial aid
🎯 **Youth programs** - Leadership and career development
🚨 **Emergency support** - Crisis assistance

I apologize for the technical issue. The SINDA team is always ready to help you directly!`;
    
    res.status(statusCode).json({ 
      message: fallbackMessage,
      error: true,
      isCrisis: false,
      suggestedPrograms: ['emergency'],
      timestamp: new Date().toISOString(),
      errorType: error.code || 'unknown_error'
    });
  }
}

// Helper function for rate limiting (can be enhanced with Redis)
function isRateLimited(identifier) {
  // Basic in-memory rate limiting (replace with Redis in production)
  // This is a placeholder - implement proper rate limiting
  return false;
}
