// AI Service - Calls backend API proxy for AI responses

export type AIProvider = 'anthropic' | 'openai' | 'gemini';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIOptions {
  provider?: AIProvider;
  temperature?: number;
  jsonMode?: boolean;
}

// Detect which API is configured
export async function getAvailableProvider(): Promise<AIProvider | null> {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    
    if (data.providers?.anthropic) return 'anthropic';
    if (data.providers?.openai) return 'openai';
    if (data.providers?.gemini) return 'gemini';
    
    return null;
  } catch {
    return null;
  }
}

// Main AI call function
export async function callAI(
  messages: AIMessage[],
  options: AIOptions = {}
): Promise<string> {
  const { provider = 'anthropic', temperature = 0.7, jsonMode = false } = options;
  
  const endpoint = `/api/${provider}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        temperature,
        jsonMode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('AI call failed:', error);
    throw error;
  }
}

// Real Estate Advisor Chat
export async function getAdvisorResponse(
  userMessage: string,
  context: {
    persona?: string | null;
    budget?: string;
    goal?: string;
    conversationHistory?: { role: string; content: string }[];
  }
): Promise<{ content: string; intentSignals: string[] }> {
  const systemPrompt = `You are a friendly, professional Dubai real estate investment advisor for Yuvna Realty.

BUYER CONTEXT:
- Persona: ${context.persona || 'Not yet determined'}
- Budget: ${context.budget || 'Not specified'}
- Goal: ${context.goal || 'General interest'}

YOUR ROLE:
1. Help buyers understand Dubai real estate investment
2. Answer questions about areas, yields, visa options, and process
3. Recommend using the ROI Calculator for specific projections
4. Suggest property recommendations based on their profile
5. Identify high-intent signals and offer to connect with an agent

KEY KNOWLEDGE:
- Golden Visa: AED 2M+ investment = 10-year visa
- Property Visa: AED 750K+ = 2-year visa
- Prime areas (Downtown, Marina): 5-6% yield, stable appreciation
- Growth areas (JVC, Dubai South): 7-8.5% yield, higher appreciation
- Off-plan: Lower entry, payment plans, but delivery risk

COMMUNICATION STYLE:
- Warm and professional
- Use emojis sparingly (1-2 per message)
- Keep responses concise (2-4 paragraphs max)
- Always offer a next step or question
- If they mention visiting/calling/booking, acknowledge their intent

DETECT THESE INTENT SIGNALS (return in response):
- "planning_visit" - mentions coming to Dubai
- "purchase_intent" - ready to buy
- "call_request" - wants to speak to someone
- "booking_intent" - wants to reserve/book
- "property_interest" - asking about specific properties`;

  const messages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history (last 10 messages)
  if (context.conversationHistory) {
    const recent = context.conversationHistory.slice(-10);
    for (const msg of recent) {
      messages.push({
        role: msg.role === 'buyer' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
  }

  // Add current message
  messages.push({ role: 'user', content: userMessage });

  try {
    const response = await callAI(messages, { temperature: 0.7 });
    
    // Detect intent signals from the user message
    const intentSignals = detectIntentSignals(userMessage);
    
    return {
      content: response,
      intentSignals,
    };
  } catch (error) {
    // Fallback response if AI fails
    console.error('AI advisor error:', error);
    return {
      content: `I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to explore our ROI Calculator or Property Recommendations while I get back online.`,
      intentSignals: [],
    };
  }
}

// Generate AI-powered property recommendations
export async function getAIRecommendations(
  buyerProfile: {
    persona?: string | null;
    budgetBand?: string;
    goal?: string;
    country?: string;
  }
): Promise<any[]> {
  const systemPrompt = `You are a Dubai real estate recommendation engine. Generate 5 property investment recommendations.

Return ONLY a JSON array with this exact structure (no additional text):
[
  {
    "id": "unique-id",
    "propertyType": "1br" | "2br" | "3br" | "studio" | "townhouse" | "villa" | "penthouse",
    "status": "ready" | "off-plan",
    "areaCluster": "prime" | "growth-corridor" | "family-hub" | "waterfront" | "emerging",
    "strategy": "rent" | "flip" | "hold",
    "riskScore": 1-10 (integer),
    "expectedYield": 5.0-9.0 (realistic percentage),
    "expectedAppreciation": 3.0-15.0 (realistic percentage),
    "priceRange": { "min": number, "max": number },
    "whyItFits": "2-3 sentence explanation",
    "pros": ["advantage 1", "advantage 2", "advantage 3"],
    "cons": ["consideration 1", "consideration 2"]
  }
]

RULES:
- Make recommendations personalized to the buyer profile
- Use realistic Dubai market data
- Vary the risk levels and strategies
- Include both ready and off-plan options
- For visa-driven buyers, include Golden Visa eligible options (2M+ AED)`;

  const userPrompt = `Generate recommendations for:
- Persona: ${buyerProfile.persona || 'explorer'}
- Budget: ${buyerProfile.budgetBand || '500k-1m'}
- Goal: ${buyerProfile.goal || 'investment'}
- Country: ${buyerProfile.country || 'International'}`;

  try {
    const response = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5, jsonMode: true }
    );

    return JSON.parse(response);
  } catch (error) {
    console.error('AI recommendations error:', error);
    // Return fallback recommendations
    return getFallbackRecommendations(buyerProfile);
  }
}

// Helper: Detect intent signals from message
function detectIntentSignals(message: string): string[] {
  const signals: string[] = [];
  const lower = message.toLowerCase();

  if (lower.includes('visit') || lower.includes('coming to dubai') || lower.includes('trip')) {
    signals.push('planning_visit');
  }
  if (lower.includes('buy') || lower.includes('purchase') || lower.includes('ready to')) {
    signals.push('purchase_intent');
  }
  if (lower.includes('call') || lower.includes('speak') || lower.includes('talk to') || lower.includes('contact')) {
    signals.push('call_request');
  }
  if (lower.includes('book') || lower.includes('reserve') || lower.includes('hold')) {
    signals.push('booking_intent');
  }
  if (lower.includes('which') || lower.includes('recommend') || lower.includes('best') || lower.includes('options')) {
    signals.push('property_interest');
  }

  return signals;
}

// Fallback recommendations if AI fails
function getFallbackRecommendations(_profile: any): any[] {
  return [
    {
      id: '1',
      propertyType: '1br',
      status: 'ready',
      areaCluster: 'growth-corridor',
      strategy: 'rent',
      riskScore: 3,
      expectedYield: 7.5,
      expectedAppreciation: 8,
      priceRange: { min: 400000, max: 600000 },
      whyItFits: 'High rental demand in growth corridor. Great for first-time investors seeking stable yields.',
      pros: ['High rental yield', 'Low entry point', 'Strong tenant demand'],
      cons: ['Smaller unit', 'Lower appreciation vs prime'],
    },
    {
      id: '2',
      propertyType: '2br',
      status: 'off-plan',
      areaCluster: 'emerging',
      strategy: 'hold',
      riskScore: 6,
      expectedYield: 5.5,
      expectedAppreciation: 12,
      priceRange: { min: 700000, max: 950000 },
      whyItFits: 'Emerging area with infrastructure investment. Payment plan available during construction.',
      pros: ['High growth potential', 'Payment plans', 'Modern amenities'],
      cons: ['Delivery risk', 'Area still developing'],
    },
    {
      id: '3',
      propertyType: '2br',
      status: 'ready',
      areaCluster: 'prime',
      strategy: 'rent',
      riskScore: 4,
      expectedYield: 5.8,
      expectedAppreciation: 6,
      priceRange: { min: 1500000, max: 2200000 },
      whyItFits: 'Prime location with strong resale value. Popular with expats and tourists.',
      pros: ['Prime location', 'Strong resale', 'Premium tenants'],
      cons: ['Higher entry price', 'Lower yield'],
    },
  ];
}

export default { callAI, getAdvisorResponse, getAIRecommendations, getAvailableProvider };

