import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Keys from environment
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || '';
const GOOGLE_API_KEY = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    providers: {
      openai: !!OPENAI_API_KEY,
      claude: !!ANTHROPIC_API_KEY,
      gemini: !!GOOGLE_API_KEY
    }
  });
});

// Main LLM proxy endpoint
app.post('/api/llm', async (req, res) => {
  try {
    const { provider, messages, jsonMode = false, temperature = 0.25, maxTokens = 4000 } = req.body;

    if (!provider || !messages) {
      return res.status(400).json({ error: 'Missing required fields: provider and messages' });
    }

    let result;

    switch (provider) {
      case 'openai':
        result = await callOpenAI(messages, jsonMode, temperature, maxTokens);
        break;
      case 'claude':
        result = await callClaude(messages, jsonMode, temperature, maxTokens);
        break;
      case 'gemini':
        result = await callGemini(messages, jsonMode, temperature, maxTokens);
        break;
      default:
        return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    res.json({ content: result });
  } catch (error) {
    console.error('LLM API Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// OpenAI API Handler
async function callOpenAI(messages, jsonMode, temperature, maxTokens) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to call OpenAI API');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Claude (Anthropic) API Handler
async function callClaude(messages, jsonMode, temperature, maxTokens) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // Extract system message and convert to Claude format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const claudeMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role, content: m.content }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      temperature,
      system: systemMessage + (jsonMode ? '\n\nIMPORTANT: You must respond with valid JSON only. No additional text or markdown code blocks.' : ''),
      messages: claudeMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to call Claude API');
  }

  const data = await response.json();
  return data.content[0].text;
}

// Gemini (Google) API Handler
async function callGemini(messages, jsonMode, temperature, maxTokens) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured');
  }

  // Convert messages to Gemini format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const geminiContents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Prepend system instruction to first user message if exists
  if (systemMessage && geminiContents.length > 0) {
    const firstUserIdx = geminiContents.findIndex(c => c.role === 'user');
    if (firstUserIdx >= 0) {
      const jsonInstruction = jsonMode ? '\n\nIMPORTANT: You must respond with valid JSON only. No additional text or markdown code blocks.' : '';
      geminiContents[firstUserIdx].parts[0].text = `${systemMessage}${jsonInstruction}\n\n${geminiContents[firstUserIdx].parts[0].text}`;
    }
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to call Gemini API');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 LLM Proxy Server running on http://localhost:${PORT}`);
  console.log('Available providers:');
  console.log(`  - OpenAI: ${OPENAI_API_KEY ? '✓ configured' : '✗ not configured'}`);
  console.log(`  - Claude: ${ANTHROPIC_API_KEY ? '✓ configured' : '✗ not configured'}`);
  console.log(`  - Gemini: ${GOOGLE_API_KEY ? '✓ configured' : '✗ not configured'}`);
});
