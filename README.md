# Yuvna Realty - Dubai Real Estate Investment Platform

A modern, AI-powered real estate advisory platform for Dubai property investments. Built for Yuvna Realty brand.

![Yuvna Realty](https://yuvnarealty.com)

## 🏠 Features

### Buyer Journey
- **Landing Page** - Brand-aligned landing with services, testimonials, and CTAs
- **Smart Onboarding** - 7-step questionnaire that builds buyer persona
- **Personalized Dashboard** - Profile summary, market insights, quick actions
- **AI Property Recommendations** - Category-based recommendations matching buyer profile
- **ROI Calculator** - Multi-currency investment projections with yield scenarios
- **AI Advisor Chat** - 24/7 conversational assistant for property queries

### Agent Portal
- **Unified Inbox** - Lead management with priority scoring
- **Deal Pipeline** - Kanban-style deal tracking
- **Lead Management** - Filter, sort, and manage all leads

## 🎨 Brand Design

Matching [yuvnarealty.com](https://yuvnarealty.com):
- **Primary Color**: `#E07F26` (Orange)
- **Text Color**: `#3D2D22` (Dark Brown)
- **Typography**: Playfair Display (headings) + Open Sans (body)
- **Logo**: Orange sun with building skyline silhouette

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/nitish0shr/yuvna-realty.git
cd yuvna-realty

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   └── dubai/           # All Yuvna Realty components
│       ├── JuvnaApp.tsx         # Main app container
│       ├── JuvnaLanding.tsx     # Landing page
│       ├── JuvnaOnboarding.tsx  # Buyer onboarding flow
│       ├── JuvnaDashboard.tsx   # Buyer dashboard
│       ├── JuvnaRecommendations.tsx  # Property recommendations
│       ├── JuvnaROI.tsx         # ROI calculator
│       ├── JuvnaChat.tsx        # AI advisor chat
│       ├── JuvnaAgentInbox.tsx  # Agent inbox
│       ├── JuvnaPipeline.tsx    # Deal pipeline
│       ├── JuvnaLeads.tsx       # Lead management
│       ├── YuvnaHeader.tsx      # Navigation header
│       └── YuvnaLogo.tsx        # Brand logo component
├── store/
│   └── realEstateStore.ts   # Zustand state management
├── types/
│   └── realEstate.ts        # TypeScript interfaces
├── styles/
│   └── juvna-theme.css      # Brand CSS variables
└── App.tsx                  # App entry point
```

## 🛠 Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **Lucide React** - Icons

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |

## 🔒 Environment Variables (Optional)

For AI chat integration (not currently active):

```env
VITE_OPENAI_API_KEY=your-key
VITE_ANTHROPIC_API_KEY=your-key
VITE_GOOGLE_API_KEY=your-key
```

## 📱 Responsive Design

Fully responsive across:
- Desktop (1280px+)
- Tablet (768px+)
- Mobile (320px+)

## 🎯 Buyer Personas

The platform identifies and serves:
- **Yield Investors** - Focused on rental returns
- **Capital Investors** - Focused on appreciation
- **Lifestyle Buyers** - Personal/family use
- **Visa-Driven Buyers** - Golden Visa qualification
- **Explorers** - Early-stage research

## 📄 License

Private - Yuvna Realty

## 👤 Author

Built for Yuvna Realty
