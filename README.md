# Recruiter AI Ultra

A cinematic, AI-powered candidate screening dashboard that transforms the recruitment process into an intuitive, visually stunning experience. Built with React 19, TypeScript, and cutting-edge animation technologies.

![Recruiter AI Ultra](https://img.shields.io/badge/Recruiter_AI-Ultra-22D3EE?style=for-the-badge&labelColor=030712)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=flat-square&logo=tailwindcss)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Application Flow](#application-flow)
- [AI Capabilities](#ai-capabilities)
- [Component Architecture](#component-architecture)
- [Design System](#design-system)
- [Data Structures](#data-structures)
- [Configuration](#configuration)
- [Project Structure](#project-structure)

---

## Overview

**Recruiter AI Ultra** is a sophisticated recruitment tool that leverages artificial intelligence to streamline candidate evaluation. The application guides recruiters through a three-phase workflow:

1. **Job Creation** - Upload and parse job descriptions
2. **Candidate Collection** - Bulk upload and parse resumes
3. **AI Evaluation** - Comprehensive scoring and personalized outreach

The interface features premium glassmorphism design, cinematic animations, and a dual-theme system (Day/Night modes).

---

## Features

### Phase 1: Job Creation

| Feature | Description |
|---------|-------------|
| **Drag & Drop Upload** | Upload job descriptions (PDF, DOCX, TXT) via drag-and-drop |
| **AI Extraction** | Automatically extracts job title, company, skills, experience requirements |
| **Skill Management** | Add/remove must-have and nice-to-have skills |
| **Sponsorship Gate** | Configure visa sponsorship requirements with 3-option modal |
| **Salary Range** | Set minimum and maximum salary expectations |
| **Location Settings** | Define location requirements and remote options |

### Phase 2: Candidate Drop Zone

| Feature | Description |
|---------|-------------|
| **Bulk Resume Upload** | Upload multiple resumes simultaneously |
| **Smart Parsing** | Extracts candidate name, current job title, company, sponsorship status |
| **Visual Feedback** | Animated ripples and processing indicators |
| **Candidate Management** | Remove candidates, view upload status |
| **Multi-Format Support** | Supports PDF, DOCX, DOC, and TXT files |

### Phase 3: Candidate Evaluation & Reveal

| Feature | Description |
|---------|-------------|
| **AI Scoring** | 0-100 comprehensive scoring with 7-category breakdown |
| **Recommendation Tiers** | Strong Yes, Yes, Maybe, Lean No, No |
| **Fit Snapshot** | One-line verdict, match level, risk level, hiring priority |
| **Evidence Grid** | Maps job requirements to resume evidence |
| **Screening Notes** | Detailed overview, strengths, gaps, risks, positioning |
| **Personalized Outreach** | AI-generated emails with tone adaptation |
| **Screening Questions** | 3-5 targeted questions based on evaluation |
| **Star/Favorite** | Mark top candidates for quick access |
| **Drag-to-Reorder** | Manually adjust candidate rankings |
| **Resume Preview** | View full resume in modal |
| **Gmail Integration** | One-click open email in Gmail |

### Visual Features

| Feature | Description |
|---------|-------------|
| **Aurora Background** | Animated gradient mesh with morphing blobs |
| **Particle System** | Floating particles throughout the interface |
| **Glassmorphism** | Premium frosted glass card effects |
| **15+ Loading Animations** | Randomly selected engaging loaders |
| **Dual Theme System** | Day (Optimistic Clarity) / Night (Deep Space Luxury) |
| **Staircase Layout** | Luminous cascading candidate cards |
| **3D Hover Effects** | Depth and perspective on interactions |

---

## Tech Stack

### Core Framework
- **React 19.0** - Latest React with concurrent features
- **TypeScript 5.5** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool

### State Management
- **Zustand 4.5** - Lightweight state management with persistence

### Styling & Animation
- **TailwindCSS 4.0** - Utility-first CSS framework
- **Framer Motion 10.18** - Production-ready animations
- **Lucide React** - Beautiful, consistent icons

### File Processing
- **PDF.js 4.0** - PDF text extraction
- **Mammoth 1.11** - DOCX to text conversion

### AI Integration
- **OpenAI GPT-4o** - Job extraction, evaluation, outreach generation

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (optional - demo mode available)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd candidate-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenAI API key to .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

> **Note:** Without an API key, the app runs in Demo Mode with simulated evaluations.

### Running the Application

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

The application will be available at `http://localhost:5173`

---

## Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 1: CREATE JOB                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Upload Job Description (drag & drop)                        │
│  2. AI extracts: title, company, skills, experience, etc.       │
│  3. Refine extracted data manually                              │
│  4. Configure sponsorship requirements                          │
│  5. Click "Start Screening" to proceed                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PHASE 2: DROP CANDIDATES                      │
├─────────────────────────────────────────────────────────────────┤
│  1. Bulk upload resumes (drag & drop multiple files)            │
│  2. System parses: name, job title, company, sponsorship        │
│  3. Review candidate list                                       │
│  4. Remove unwanted candidates                                  │
│  5. Click "Evaluate All" to proceed                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: REVEAL & EVALUATE                   │
├─────────────────────────────────────────────────────────────────┤
│  1. AI evaluates each candidate (0-100 score)                   │
│  2. View detailed breakdowns:                                   │
│     • Score breakdown (7 categories)                            │
│     • Fit snapshot (verdict, match, risk, priority)             │
│     • Evidence grid (requirements → resume evidence)            │
│     • Screening notes (overview, strengths, gaps, risks)        │
│  3. Generate personalized outreach emails                       │
│  4. Star favorites, reorder manually                            │
│  5. Copy emails or open directly in Gmail                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Capabilities

### Job Description Extraction

The AI analyzes uploaded job descriptions and extracts:

```typescript
{
  title: string           // Job title
  company: string         // Company name
  mustHaveSkills: string[] // Required skills (max 10)
  niceToHaveSkills: string[] // Preferred skills (max 5)
  minYearsExperience: number // Minimum experience
  location: string        // Work location
  salaryMin: number       // Minimum salary
  salaryMax: number       // Maximum salary
  requiresSponsorship: boolean // Visa sponsorship
}
```

### Candidate Evaluation

Each candidate receives a comprehensive evaluation:

#### Score Breakdown (0-100 points)

| Category | Max Points | Description |
|----------|------------|-------------|
| Must-Have Skills | 20 | Match against required skills |
| Nice-to-Have Skills | 15 | Match against preferred skills |
| Experience Depth | 20 | Years and relevance of experience |
| Constraint Match | 15 | Location, salary, sponsorship fit |
| Red Flags | -10 | Job hopping, gaps, inconsistencies |
| Deal Breakers | -10 | Critical mismatches |
| Cultural Signals | 10 | Motivation, culture fit indicators |

#### Recommendation Tiers

| Score | Recommendation | Action |
|-------|---------------|--------|
| 95-100 | Strong Yes | Top pick - prioritize |
| 85-94 | Yes | Good fit - proceed |
| 70-84 | Maybe | Consider - clarify gaps |
| 50-69 | Lean No | Backup only |
| 0-49 | No | Pass |

### Personalized Outreach

AI generates emails with:
- **Tone Adaptation**: Excited (95+), Curious (85-94), Cautious (70-84), Decline (<70)
- **Personalized Subject**: Starts with candidate's first name
- **Specific References**: Mentions actual companies, projects, achievements from resume
- **Screening Questions**: 3-5 targeted questions based on:
  - Job requirements
  - Candidate strengths to confirm
  - Identified gaps to clarify
  - Constraint concerns (visa, location, salary)

---

## Component Architecture

### Page Components

```
src/components/
├── JobCreation.tsx        # Phase 1 - Job setup
├── CandidateDropZone.tsx  # Phase 2 - Resume upload
├── CandidateReveal.tsx    # Phase 3 - Evaluation display
```

### Feature Components

```
src/components/
├── DigitalCoPilots.tsx    # Animated bot characters
│   ├── HMBot              # Hiring Manager bot
│   ├── RBot               # Recruiter bot
│   ├── HandOffScene       # Document passing animation
│   ├── WarRoomScene       # Processing animation
│   ├── VerdictScene       # Results animation
│   └── SponsorshipGate    # Sponsorship modal
├── TopBar.tsx             # Stats display header
├── LivingFlower.tsx       # Active job indicator
└── LoadingAnimations.tsx  # 15 unique loading animations
```

### UI System Components

```
src/components/ui/
├── AuroraBackground.tsx   # Animated gradient background
├── ParticleField.tsx      # Floating particle system
├── GlassCard.tsx          # Glassmorphism card + button + input
├── AnimatedText.tsx       # Text animation effects
├── PageTransition.tsx     # Page transition wrappers
├── LoadingStates.tsx      # Loading indicators
├── Perspective3D.tsx      # 3D effects and parallax
└── index.ts               # Barrel export
```

### Loading Animation Variants

1. Orbiting Dots
2. Pulsing Rings
3. DNA Helix
4. Floating Particles
5. Double Sphere
6. Wave Pulse
7. Morphing Blob
8. Waveform
9. Radar Scan
10. Matrix Rain
11. Cosmic Rays
12. Fibonacci Spiral
13. Neuron Network
14. Pendulum
15. Liquid Blob

---

## Design System

### Color Palette

#### Night Mode (Deep Space Luxury)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-app` | `#030712` | Main background |
| `bg-surface` | `rgba(17, 24, 39, 0.4)` | Cards, panels |
| `accent-action` | `#22D3EE` | Buttons, links |
| `accent-highlight` | `#F472B6` | Alerts, badges |
| `text-primary` | `#F8FAFC` | Headings |
| `text-secondary` | `#94A3B8` | Subtitles |

#### Day Mode (Optimistic Clarity)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-app` | `#F8FAFC` | Main background |
| `bg-surface` | `rgba(255, 255, 255, 0.6)` | Cards, panels |
| `accent-action` | `#3B82F6` | Buttons, links |
| `accent-highlight` | `#F97316` | Alerts, badges |
| `text-primary` | `#0F172A` | Headings |
| `text-secondary` | `#64748B` | Subtitles |

### Score Colors

| Score Range | Color | Label |
|-------------|-------|-------|
| 95-100 | `#4ADE80` (Mint) | Unicorn |
| 85-94 | `#F97316` (Orange) | Strong |
| 70-84 | `#3B82F6` (Blue) | Good |
| 0-69 | `#F43F5E` (Coral) | Poor |

### Typography

| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Hero Display | 96px (6rem) | 700 | -0.05em |
| H1 Page Title | 36px (2.25rem) | 700 | -0.025em |
| H2 Card Name | 24px (1.5rem) | 700 | 0 |
| Body Large | 18px (1.125rem) | 500 | 0 |
| Body Regular | 16px (1rem) | 400 | 0 |
| Micro Label | 10px (0.625rem) | 700 | 0.1em |

**Font Family:** Satoshi (primary), Inter (fallback), system fonts

### Glass Card Specifications

```css
.card-glass {
  background: rgba(17, 24, 39, 0.4);    /* Semi-transparent */
  backdrop-filter: blur(40px);           /* Heavy blur */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2rem;                   /* 32px */
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.card-glass:hover {
  transform: scale(1.02) translateY(-4px);
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.1);
}
```

### Animation Timing

| Animation | Duration | Easing |
|-----------|----------|--------|
| Page Transition | Spring (stiffness: 200, damping: 30) | - |
| Card Reveal | 0.6s | cubic-bezier(0.2, 0.8, 0.2, 1) |
| Stagger Delay | 0.1s per item | - |
| Hover Effects | 0.3-0.5s | ease-out |
| Bot Animations | 0.8s | Spring with overshoot |

---

## Data Structures

### Job

```typescript
interface Job {
  id: string;
  title: string;
  company: string;
  rawDescription: string;
  requiresSponsorship: boolean | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  minYearsExperience: number;
  notes: string;
  createdAt: Date;
}
```

### Candidate

```typescript
interface Candidate {
  id: string;
  jobId: string;
  name: string;
  rawResume: string;
  fileName: string;
  currentJobTitle: string | null;
  currentCompany: string | null;
  requiresSponsorship: boolean | null;
  evaluation: CandidateEvaluation | null;
  isEvaluating: boolean;
  outreachEmail: string | null;
  outreachDraft: string | null;
  isStarred: boolean;
  hasReachedOut: boolean;
  manualRank: number | null;
  createdAt: Date;
}
```

### CandidateEvaluation

```typescript
interface CandidateEvaluation {
  score: number;  // 0-100
  recommendation: 'Strong Yes' | 'Yes' | 'Maybe' | 'Lean No' | 'No';
  summary: string;
  strengths: string[];
  gaps: string[];
  redFlags: string[];
  dealBreakers: string[];
  scoreBreakdown: ScoreBreakdown;
  fitSnapshot: FitSnapshot;
  screeningNotes: ScreeningNotes;
  evidenceGrid: EvidenceItem[];
  risksNextSteps: RisksNextSteps;
}
```

### FitSnapshot

```typescript
interface FitSnapshot {
  oneLineVerdict: string;
  matchLevel: 'High' | 'Medium' | 'Low';
  riskLevel: 'Low' | 'Medium' | 'High';
  hiringPriority: 'Top pick' | 'Consider' | 'Backup' | 'Pass';
}
```

### EvidenceItem

```typescript
interface EvidenceItem {
  requirement: string;
  evidence: string;
  fit: 'match' | 'partial' | 'gap' | 'blocker';
}
```

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | No | OpenAI API key for AI features |

### Demo Mode

When no API key is provided:
- Job extraction uses sensible defaults
- Candidate evaluation generates random scores (60-100)
- Outreach emails use template-based generation
- Full UI functionality remains available

### Persistence

The application automatically persists to localStorage:
- Current job configuration
- All candidates and evaluations
- Current phase
- Star/favorite status
- Outreach drafts

Theme preference is stored separately and syncs with system preference.

---

## Project Structure

```
candidate-dashboard/
├── public/
│   └── sounds/
│       └── chime.mp3          # Success sound effect
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── AuroraBackground.tsx
│   │   │   ├── ParticleField.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   ├── AnimatedText.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   ├── LoadingStates.tsx
│   │   │   ├── Perspective3D.tsx
│   │   │   └── index.ts
│   │   ├── CandidateDropZone.tsx
│   │   ├── CandidateReveal.tsx
│   │   ├── CosmicBackground.tsx
│   │   ├── DigitalCoPilots.tsx
│   │   ├── JobCreation.tsx
│   │   ├── LivingFlower.tsx
│   │   ├── LoadingAnimations.tsx
│   │   └── TopBar.tsx
│   ├── context/
│   │   └── ThemeContext.tsx   # Theme provider
│   ├── store/
│   │   └── useStore.ts        # Zustand store
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   ├── utils/
│   │   ├── ai.ts              # OpenAI integration
│   │   └── fileParser.ts      # File parsing utilities
│   ├── App.tsx                # Main application
│   ├── index.css              # Global styles & design system
│   └── main.tsx               # Entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── index.html                 # HTML template
├── package.json               # Dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

> **Note:** Requires modern browser with support for:
> - CSS backdrop-filter
> - CSS custom properties
> - ES2020+ JavaScript features

---

## Performance Considerations

- **Lazy evaluation**: Candidates are evaluated on-demand, not all at once
- **Optimized animations**: Uses GPU-accelerated transforms
- **Efficient re-renders**: Zustand prevents unnecessary component updates
- **Code splitting**: Vite automatically splits chunks
- **Asset optimization**: PDF.js worker loaded from CDN

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## License

MIT License - See LICENSE file for details.

---

## Acknowledgments

- [OpenAI](https://openai.com) for GPT-4o API
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide](https://lucide.dev) for icons
- [Fontshare](https://www.fontshare.com) for Satoshi font
- [TailwindCSS](https://tailwindcss.com) for styling

---

<p align="center">
  <strong>Built with care for recruiters who deserve better tools.</strong>
</p>

<p align="center">
  <sub>Recruiter AI Ultra - Transforming recruitment, one candidate at a time.</sub>
</p>
