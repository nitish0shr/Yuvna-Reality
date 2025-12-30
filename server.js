import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Get API keys from environment
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.VITE_ANTHROPIC_API_KEY || '';
const GEMINI_API_KEY = process.env.VITE_GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    providers: {
      openai: !!OPENAI_API_KEY,
      anthropic: !!ANTHROPIC_API_KEY,
      gemini: !!GEMINI_API_KEY
    }
  });
});

// OpenAI Proxy
app.post('/api/openai', async (req, res) => {
  try {
    const { messages, jsonMode, temperature } = req.body;

    if (!OPENAI_API_KEY) {
      return res.status(400).json({ error: 'OpenAI API key not configured' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: temperature || 0.25,
        max_tokens: 4000,
        ...(jsonMode && { response_format: { type: 'json_object' } }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    res.json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Anthropic (Claude) Proxy
app.post('/api/anthropic', async (req, res) => {
  console.log('[Anthropic] Received request');
  try {
    const { messages, jsonMode, temperature } = req.body;

    if (!ANTHROPIC_API_KEY) {
      console.log('[Anthropic] API key not configured');
      return res.status(400).json({ error: 'Anthropic API key not configured' });
    }

    // Extract system message and convert to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role,
      content: m.content,
    }));

    console.log(`[Anthropic] Calling API with ${userMessages.length} messages, jsonMode=${jsonMode}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: temperature || 0.25,
        system: systemMessage + (jsonMode ? '\n\nIMPORTANT: You must respond with valid JSON only. No additional text or explanation.' : ''),
        messages: userMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Anthropic] API error:', JSON.stringify(error));
      return res.status(response.status).json({ error: error.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    let content = data.content[0].text;

    // Strip markdown code blocks if present (Claude sometimes wraps JSON in ```json ... ```)
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    console.log('[Anthropic] Success, response length:', content.length);
    res.json({ content });
  } catch (error) {
    console.error('[Anthropic] Exception:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gemini Proxy
app.post('/api/gemini', async (req, res) => {
  try {
    const { messages, jsonMode, temperature } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }

    // Convert messages to Gemini format
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const contents = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Prepend system as user message if present
    if (systemMessage) {
      contents.unshift({
        role: 'user',
        parts: [{ text: `System Instructions:\n${systemMessage}${jsonMode ? '\n\nIMPORTANT: Respond with valid JSON only.' : ''}` }],
      });
      contents.splice(1, 0, {
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: temperature || 0.25,
            maxOutputTokens: 4096,
            ...(jsonMode && { responseMimeType: 'application/json' }),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Gemini API error' });
    }

    const data = await response.json();
    res.json({ content: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Proxy Server running on http://localhost:${PORT}`);
  console.log('\nConfigured providers:');
  console.log(`  ✅ OpenAI: ${OPENAI_API_KEY ? 'Configured' : '❌ Not configured'}`);
  console.log(`  ✅ Anthropic: ${ANTHROPIC_API_KEY ? 'Configured' : '❌ Not configured'}`);
  console.log(`  ✅ Gemini: ${GEMINI_API_KEY ? 'Configured' : '❌ Not configured'}`);
  console.log('\n');
});
