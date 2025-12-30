# Yuvna Realty - Technical Specification for Production Readiness

## Executive Summary

The Yuvna Realty application is a **frontend prototype** with a backend API proxy. The UI is complete and functional, but **core business logic uses mock/hardcoded data**. This document outlines exactly what needs to be built to make the application production-ready.

---

## Current State Overview

| Component | Status | Notes |
|-----------|--------|-------|
| UI/Frontend | ✅ Complete | Buyer & Agent flows are fully styled |
| API Proxy Server | ✅ Ready | OpenAI, Claude, Gemini endpoints exist |
| AI Chat | ❌ Mock | Hardcoded responses, not calling AI APIs |
| Property Recommendations | ❌ Mock | Hardcoded data based on persona |
| ROI Calculator | ✅ Works | Local calculations (no AI needed) |
| Data Persistence | ❌ None | In-memory only (Zustand), resets on refresh |
| Authentication | ❌ None | No login/auth system |
| Lead Scoring | ⚠️ Partial | Logic exists but no persistence |
| Agent Inbox | ❌ Mock | No real data source |
| Deal Pipeline | ❌ Mock | No real data source |

---

## Phase 1: AI Integration (Priority: HIGH)

### 1.1 Connect Chat to Real AI

**File:** `src/components/dubai/JuvnaChat.tsx`

**Current Problem:**
The `generateAIResponse` function (lines 37-87) returns hardcoded responses:
```typescript
// CURRENT (MOCK)
const generateAIResponse = (message: string, context: any) => {
  if (lowerMessage.match(/^(hi|hello|hey)/)) {
    return { content: "Hello! 👋 Welcome to Yuvna Realty..." }; // HARDCODED
  }
  // ... more hardcoded responses
}
```

**Required Change:**
Replace with actual API call to the backend proxy:

```typescript
// REQUIRED IMPLEMENTATION
const generateAIResponse = async (message: string, context: any): Promise<string> => {
  const systemPrompt = `You are a Dubai real estate investment advisor for Yuvna Realty.
    
Current buyer context:
- Persona: ${context.persona || 'Unknown'}
- Budget: ${context.budget || 'Not specified'}
- Goal: ${context.goal || 'Not specified'}

Guidelines:
- Be helpful, professional, and concise
- Focus on Dubai real estate investment
- Mention Golden Visa when relevant (2M+ AED)
- Suggest ROI calculator or property recommendations when appropriate
- If user shows high intent (wants to visit, call, book), acknowledge and offer to connect with an agent`;

  const response = await fetch('/api/anthropic', {  // or /api/openai or /api/gemini
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return data.content;
};
```

**Files to Modify:**
1. `src/components/dubai/JuvnaChat.tsx` - Replace mock function with API call
2. Add loading states and error handling
3. Add conversation history to maintain context

**Estimated Effort:** 4-6 hours

---

### 1.2 AI-Powered Property Recommendations

**File:** `src/components/dubai/JuvnaRecommendations.tsx`

**Current Problem:**
The `generateRecommendations` function (lines 21-102) returns hardcoded property categories.

**Required Change:**
Replace with AI-generated recommendations based on buyer profile:

```typescript
// REQUIRED IMPLEMENTATION
const generateAIRecommendations = async (buyer: BuyerProfile): Promise<PropertyRecommendation[]> => {
  const response = await fetch('/api/anthropic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { 
          role: 'system', 
          content: `Generate 5 property investment recommendations for a Dubai buyer.
          
Return JSON array with this structure:
[{
  "propertyType": "1br" | "2br" | "3br" | "studio" | "townhouse" | "villa" | "penthouse",
  "status": "ready" | "off-plan",
  "areaCluster": "prime" | "growth-corridor" | "family-hub" | "waterfront" | "emerging",
  "strategy": "rent" | "flip" | "hold",
  "riskScore": 1-10,
  "expectedYield": number (percentage),
  "expectedAppreciation": number (percentage),
  "priceRange": { "min": number, "max": number },
  "whyItFits": "explanation string",
  "pros": ["string", "string"],
  "cons": ["string", "string"]
}]` 
        },
        { 
          role: 'user', 
          content: `Buyer profile:
- Persona: ${buyer.persona}
- Budget: ${buyer.budgetBand}
- Goal: ${buyer.goal}
- Country: ${buyer.country}
- Preferred Language: ${buyer.language}` 
        }
      ],
      jsonMode: true,
      temperature: 0.5
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.content);
};
```

**Estimated Effort:** 4-6 hours

---

## Phase 2: Data Persistence (Priority: HIGH)

### 2.1 Database Setup

**Current Problem:**
All data is stored in Zustand (in-memory). On page refresh, everything is lost.

**Recommended Solution:** PostgreSQL with Prisma ORM (or Supabase for faster setup)

**Required Schema:**

```prisma
// prisma/schema.prisma

model Buyer {
  id                    String    @id @default(uuid())
  firstName             String
  lastName              String?
  email                 String    @unique
  phone                 String?
  country               String
  language              String    @default("en")
  currency              String    @default("USD")
  persona               String?   // yield-investor, capital-investor, lifestyle, visa-driven, explorer
  goal                  String?   // investment, lifestyle, visa, second-home
  budgetBand            String?   // under-500k, 500k-1m, 1m-2m, 2m-5m, 5m-plus
  urgencyScore          Int       @default(0)
  leadScore             Int       @default(0)
  leadCategory          String    @default("cold") // cold, warm, hot, ready-to-call
  onboardingCompletedAt DateTime?
  lastActiveAt          DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  conversations         Conversation[]
  roiSimulations        ROISimulation[]
  deals                 Deal[]
}

model Conversation {
  id        String    @id @default(uuid())
  buyerId   String
  buyer     Buyer     @relation(fields: [buyerId], references: [id])
  channel   String    @default("chat") // chat, whatsapp, email
  status    String    @default("active") // active, closed, escalated
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           String       // buyer, advisor, agent
  content        String
  intentSignals  String[]     @default([])
  createdAt      DateTime     @default(now())
}

model ROISimulation {
  id              String   @id @default(uuid())
  buyerId         String
  buyer           Buyer    @relation(fields: [buyerId], references: [id])
  budget          Float
  currency        String
  propertyType    String
  areaCluster     String
  timeHorizon     Int
  results         Json     // Store calculation results
  createdAt       DateTime @default(now())
}

model Deal {
  id          String   @id @default(uuid())
  buyerId     String
  buyer       Buyer    @relation(fields: [buyerId], references: [id])
  agentId     String?
  stage       String   @default("new") // new, contacted, qualified, viewing, negotiation, closed-won, closed-lost
  value       Float?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Agent {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  phone     String?
  role      String   @default("agent") // agent, admin
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

**New Files Required:**
1. `prisma/schema.prisma` - Database schema
2. `server/db.js` - Database connection
3. `server/routes/buyers.js` - CRUD API for buyers
4. `server/routes/conversations.js` - Chat history API
5. `server/routes/deals.js` - Deal pipeline API

**Estimated Effort:** 16-24 hours

---

### 2.2 API Endpoints Required

Add these REST endpoints to `server.js`:

```javascript
// Buyers
GET    /api/buyers          // List all buyers (for agent)
GET    /api/buyers/:id      // Get single buyer
POST   /api/buyers          // Create buyer (after onboarding)
PUT    /api/buyers/:id      // Update buyer
DELETE /api/buyers/:id      // Delete buyer

// Conversations
GET    /api/conversations/:buyerId     // Get buyer's conversations
POST   /api/conversations              // Create new conversation
POST   /api/conversations/:id/messages // Add message

// ROI Simulations
GET    /api/simulations/:buyerId       // Get buyer's simulations
POST   /api/simulations                // Save simulation

// Deals
GET    /api/deals                      // List all deals (for agent)
GET    /api/deals/:id                  // Get single deal
POST   /api/deals                      // Create deal
PUT    /api/deals/:id                  // Update deal (stage, notes)

// Lead Scoring
GET    /api/leads                      // Get all leads with scores
PUT    /api/leads/:id/score            // Update lead score
```

**Estimated Effort:** 8-12 hours

---

## Phase 3: Authentication (Priority: MEDIUM-HIGH)

### 3.1 Buyer Authentication

**Options:**
1. **Magic Link (Recommended for buyers)** - Email-based, no password
2. **OTP via SMS/WhatsApp** - Phone-based verification
3. **OAuth** - Google/LinkedIn sign-in

**Required Implementation:**

```javascript
// server/routes/auth.js

// Magic Link Flow
POST /api/auth/magic-link
// Request: { email: "buyer@example.com" }
// Sends email with login link

GET /api/auth/verify?token=xxx
// Verifies token, returns JWT

// Session Management
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/logout
```

**Frontend Changes:**
1. Create `src/components/dubai/JuvnaLogin.tsx`
2. Add auth context/provider
3. Protect routes based on auth state

**Estimated Effort:** 12-16 hours

---

### 3.2 Agent Authentication

**Requirements:**
- Email/password authentication
- Role-based access (agent vs admin)
- JWT tokens for API authorization

**Estimated Effort:** 8-12 hours

---

## Phase 4: Real-Time Features (Priority: MEDIUM)

### 4.1 WebSocket for Chat

**Current:** Chat is request-response only
**Required:** Real-time updates when agent responds

```javascript
// server/websocket.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Handle real-time chat messages
  // Push agent replies to buyer
  // Push new leads to agent dashboard
});
```

**Estimated Effort:** 8-12 hours

---

### 4.2 Notifications

**Requirements:**
- Email notifications for agent when high-intent lead detected
- Push notifications for new messages
- WhatsApp integration (optional)

**Estimated Effort:** 8-16 hours (depending on channels)

---

## Phase 5: Integrations (Priority: LOW-MEDIUM)

### 5.1 CRM Integration (Optional)

Connect to existing CRM systems:
- HubSpot
- Salesforce
- Zoho

### 5.2 Property Listings API (Optional)

If you want real property data instead of categories:
- Property Finder API
- Bayut API
- Custom property database

---

## Environment Variables Required

Create `.env` file:

```env
# AI API Keys (at least one required)
VITE_OPENAI_API_KEY=sk-xxx
VITE_ANTHROPIC_API_KEY=sk-ant-xxx
VITE_GEMINI_API_KEY=xxx

# Database
DATABASE_URL=postgresql://user:password@host:5432/yuvna_realty

# Authentication
JWT_SECRET=your-secret-key-here
MAGIC_LINK_SECRET=another-secret-key

# Email (for magic links)
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=SG.xxx

# Optional
REDIS_URL=redis://localhost:6379
```

---

## Quick Start: Minimum Viable Production

If you need to go live FAST, here's the minimum:

### Step 1: AI Integration Only (1-2 days)
1. Set up `.env` with API key
2. Update `JuvnaChat.tsx` to call real AI
3. Run both servers (`npm run dev` + `node server.js`)

**Result:** Working AI chat, but no data persistence

### Step 2: Add Basic Persistence (2-3 days)
1. Set up Supabase (fastest) or PostgreSQL
2. Add API endpoints for buyers and conversations
3. Connect frontend to save/load data

**Result:** Data survives page refresh, but no auth

### Step 3: Add Authentication (2-3 days)
1. Implement magic link auth for buyers
2. Implement password auth for agents
3. Protect API routes

**Result:** Multi-user ready

---

## Development Commands

```bash
# Install dependencies
npm install

# Run frontend only
npm run dev

# Run API server only  
node server.js

# Run both (development)
npm run dev:all

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Team Requirements

| Role | Tasks | Estimated Time |
|------|-------|----------------|
| Frontend Dev | AI integration, auth UI, loading states | 2-3 weeks |
| Backend Dev | Database, APIs, auth, WebSocket | 2-3 weeks |
| DevOps | Deployment, CI/CD, monitoring | 1 week |

**Total Estimated Time:** 4-6 weeks for full production readiness

---

## Questions for Product Team

1. **AI Provider Preference?** OpenAI (GPT-4), Anthropic (Claude), or Google (Gemini)?
2. **Authentication Method?** Magic link, OTP, or social login?
3. **Hosting Preference?** Vercel, AWS, GCP, or on-premise?
4. **CRM Integration?** Which system, if any?
5. **Property Data Source?** AI-generated categories or real listings?

---

## Contact

For technical questions about this specification, reach out to the development team.

---

*Document Version: 1.0*
*Last Updated: December 29, 2025*

