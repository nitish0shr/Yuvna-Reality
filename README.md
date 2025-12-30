# 🏠 Yuvna Realty - AI-Powered Dubai Real Estate Platform

A complete real estate advisory platform that guides property buyers through their investment journey using AI, while providing agents with powerful lead management and outreach tools.

![Yuvna Realty](https://img.shields.io/badge/Yuvna-Realty-E07F26?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)

---

## 🎯 What This App Does

### For Property Buyers
- **AI-Powered Chat Advisor** - 24/7 real estate guidance powered by Claude/GPT/Gemini
- **Smart Onboarding** - Personalized questionnaire to understand buyer needs
- **Property Recommendations** - AI-curated investment categories based on profile
- **ROI Calculator** - Interactive simulator with yield projections and exit values
- **Persona Matching** - Automatically classifies buyers (Yield Investor, Lifestyle, Visa-driven, etc.)

### For Real Estate Agents
- **Unified Inbox** - Manage all buyer conversations in one place
- **Lead Pipeline** - Kanban board for deal management
- **Lead Scoring** - Automatic scoring based on engagement and intent
- **Outreach Engine** - Automated lead generation with email campaigns
- **Auto-Pilot Mode** - Automatically generates leads when pipeline drops below threshold

---

## ✨ Features

### 🤖 AI Advisor Chat
```
┌─────────────────────────────────────────────┐
│  🤖 AI Advisor                              │
│                                             │
│  "Based on your $1M budget and investment   │
│   goal, I recommend looking at growth       │
│   corridor areas like JVC or Dubai South.   │
│   They offer 7-8% yields with strong        │
│   appreciation potential..."                │
│                                             │
│  [Ask about ROI] [Golden Visa] [Areas]      │
└─────────────────────────────────────────────┘
```
- Real AI responses (Claude, GPT-4, or Gemini)
- Context-aware conversations
- Intent detection for high-value leads
- Automatic escalation to human agents

### 📊 ROI Calculator
- Multi-currency support (USD, AED, GBP, EUR, INR)
- Property type comparisons
- Area-based yield projections
- 1-10 year exit value calculations
- Conservative/Moderate/Optimistic scenarios

### 🚀 Outreach Engine
```
┌─────────────────────────────────────────────┐
│  PIPELINE HEALTH: 23/50 leads    ⚠️         │
│  ████████░░░░░░░░░░░░  46%                  │
│                                             │
│  🤖 Auto-Pilot: ON                          │
│  → Sends 100 emails/day when below 50       │
│  → Stops at 100 qualified leads             │
│                                             │
│  [🚀 Generate Now]  [📤 Upload CSV]         │
└─────────────────────────────────────────────┘
```
- Upload CSV/Excel lead lists
- Create email sequences (Day 1, 3, 7 follow-ups)
- Multi-channel tracking (Email, LinkedIn, Instagram, WhatsApp)
- Threshold-based automation
- Real-time notifications

### 📱 Buyer Journey
1. **Landing** → Compelling value proposition
2. **Onboarding** → Smart questionnaire
3. **Dashboard** → Personalized home base
4. **Recommendations** → AI-curated properties
5. **ROI Simulator** → Calculate returns
6. **AI Chat** → Get expert guidance
7. **Agent Handoff** → Seamless transition

### 👔 Agent Portal
1. **Inbox** → All conversations
2. **Pipeline** → Deal stages (Kanban)
3. **Leads** → Full lead database
4. **Outreach** → Campaign management
5. **Analytics** → Performance metrics

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **State** | Zustand |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Magic Link) |
| **AI** | Claude / GPT-4 / Gemini |
| **Hosting** | Vercel (Serverless) |

---

## 🚀 Quick Deploy (15 minutes)

### Prerequisites
- GitHub account
- Supabase account (free)
- AI API key (OpenAI, Anthropic, or Google)

### Step 1: Fork & Clone
```bash
# Clone the repository
git clone https://github.com/nitish0shr/Yuvna-Reality.git
cd Yuvna-Reality

# Install dependencies
npm install
```

### Step 2: Setup Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) → Create account
2. Create new project: `yuvna-realty`
3. Go to **SQL Editor** → Run the contents of `supabase-schema.sql`
4. Go to **Settings** → **API** → Copy:
   - Project URL: `https://xxx.supabase.co`
   - Anon Key: `eyJxxx...`

### Step 3: Get AI API Key (2 min)

Choose ONE:
- **Claude (Recommended)**: [console.anthropic.com](https://console.anthropic.com)
- **GPT-4**: [platform.openai.com](https://platform.openai.com)
- **Gemini**: [makersuite.google.com](https://makersuite.google.com/app/apikey)

### Step 4: Deploy to Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New"** → **"Project"**
3. Import `Yuvna-Reality` repository
4. Add Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxx...` |
| `ANTHROPIC_API_KEY` | `sk-ant-xxx` |

5. Click **Deploy** → Done! 🎉

### Step 5: Configure Auth Redirect

1. In Supabase → **Authentication** → **URL Configuration**
2. Set Site URL: `https://your-app.vercel.app`
3. Add Redirect URL: `https://your-app.vercel.app/*`

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your keys to .env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Start development server
npm run dev

# Start API proxy (for AI calls)
node server.js

# Or run both together
npm run dev:all
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
yuvna-realty/
├── api/                    # Vercel serverless functions
│   ├── anthropic.js        # Claude API proxy
│   ├── openai.js           # GPT API proxy
│   ├── gemini.js           # Gemini API proxy
│   └── health.js           # Health check
├── src/
│   ├── components/
│   │   └── dubai/          # Main app components
│   │       ├── JuvnaApp.tsx           # App router
│   │       ├── JuvnaLanding.tsx       # Landing page
│   │       ├── JuvnaOnboarding.tsx    # Buyer questionnaire
│   │       ├── JuvnaDashboard.tsx     # Buyer dashboard
│   │       ├── JuvnaRecommendations.tsx # Property recommendations
│   │       ├── JuvnaROI.tsx           # ROI calculator
│   │       ├── JuvnaChat.tsx          # AI advisor chat
│   │       ├── JuvnaAgentInbox.tsx    # Agent inbox
│   │       ├── JuvnaPipeline.tsx      # Deal pipeline
│   │       ├── JuvnaLeads.tsx         # Lead management
│   │       ├── JuvnaOutreach.tsx      # Outreach engine
│   │       ├── YuvnaHeader.tsx        # Navigation header
│   │       └── YuvnaLogo.tsx          # Brand logo
│   ├── lib/
│   │   ├── supabase.ts     # Database client
│   │   ├── ai.ts           # AI integration
│   │   └── auth.ts         # Authentication
│   ├── store/
│   │   └── realEstateStore.ts  # Zustand state
│   ├── types/
│   │   └── realEstate.ts   # TypeScript types
│   └── styles/
│       └── juvna-theme.css # Brand theme
├── supabase-schema.sql     # Database schema
├── vercel.json             # Deployment config
├── server.js               # Local API proxy
└── package.json
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | ⚡ | Claude API key |
| `OPENAI_API_KEY` | ⚡ | OpenAI API key |
| `GEMINI_API_KEY` | ⚡ | Google Gemini key |

⚡ = At least one AI key required

---

## 💰 Hosting Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | 100GB bandwidth | $20/mo |
| **Supabase** | 500MB DB, 50K users | $25/mo |
| **AI API** | - | ~$5-20/mo |

**Estimated: $0-15/month** for small-medium traffic

---

## 🗺️ Roadmap

### Currently Implemented ✅
- [x] AI-powered chat advisor
- [x] Buyer onboarding flow
- [x] Property recommendations
- [x] ROI calculator
- [x] Agent inbox & pipeline
- [x] Outreach engine with auto-pilot
- [x] Lead scoring
- [x] Multi-channel tracking

### Coming Soon 🔜
- [ ] SendGrid email integration
- [ ] WhatsApp Business API
- [ ] Real property listings API
- [ ] Calendar booking integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software for Yuvna Realty.

---

## 🆘 Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md` for detailed setup
- **Technical Spec**: See `TECHNICAL_SPECIFICATION.md` for architecture details
- **Issues**: Open a GitHub issue

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)
- AI powered by [Anthropic Claude](https://anthropic.com/)
- Deployed on [Vercel](https://vercel.com/)

---

<p align="center">
  <img src="https://img.shields.io/badge/Made%20with-❤️-E07F26?style=for-the-badge" alt="Made with love">
</p>
