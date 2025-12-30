// ============================================
// DUBAI REAL ESTATE ADVISORY PLATFORM - TYPES
// ============================================

// ==================== BUYER TYPES ====================

export type BuyerPersona = 
  | 'yield-investor'      // Yield-driven investor
  | 'capital-investor'    // Capital appreciation investor
  | 'lifestyle'           // Lifestyle buyer
  | 'visa-driven'         // Visa-driven buyer
  | 'explorer';           // Just exploring

export type BuyerGoal = 
  | 'investment'
  | 'lifestyle'
  | 'visa'
  | 'exploring';

export type BudgetBand = 
  | 'under-500k'
  | '500k-1m'
  | '1m-2m'
  | '2m-5m'
  | '5m-plus';

export type UrgencyLevel = 'immediate' | 'short-term' | 'medium-term' | 'long-term' | 'just-exploring';

export type LeadScore = 'cold' | 'warm' | 'hot' | 'ready-to-call';

export type LeadSource = 
  | 'onboarding-widget'
  | 'csv-upload'
  | 'linkedin'
  | 'partner-referral'
  | 'website'
  | 'event'
  | 'paid-ad'
  | 'social';

export interface BuyerProfile {
  id: string;
  
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Location & Preferences
  country: string;
  language: string;
  currency: string;
  timezone: string;
  
  // Buyer Intelligence
  persona: BuyerPersona | null;
  personaConfidence: number; // 0-100
  goal: BuyerGoal;
  budgetBand: BudgetBand;
  budgetMin?: number;
  budgetMax?: number;
  
  // Scoring
  urgencyScore: number; // 0-100
  leadScore: LeadScore;
  engagementScore: number; // 0-100
  
  // Risk Profile
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentHorizon: '1-2-years' | '3-5-years' | '5-10-years' | '10-plus-years';
  
  // Tracking
  source: LeadSource;
  utmCampaign?: string;
  utmSource?: string;
  utmMedium?: string;
  referrerPartner?: string;
  
  // Consent & Compliance
  consentMarketing: boolean;
  consentWhatsApp: boolean;
  consentEmail: boolean;
  optOutChannels: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  onboardingCompletedAt?: Date;
}

// ==================== ONBOARDING TYPES ====================

export interface OnboardingQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'slider' | 'text' | 'budget-range';
  question: string;
  subtext?: string;
  options?: OnboardingOption[];
  conditionalNext?: Record<string, string>; // option value -> next question id
  defaultNext?: string;
  required: boolean;
  field: keyof BuyerProfile | string;
}

export interface OnboardingOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface OnboardingState {
  currentQuestionId: string;
  answers: Record<string, any>;
  progress: number; // 0-100
  startedAt: Date;
  completedAt?: Date;
}

// ==================== PROPERTY TYPES ====================

export type PropertyType = 
  | 'studio'
  | '1br'
  | '2br'
  | '3br'
  | 'townhouse'
  | 'villa'
  | 'penthouse';

export type PropertyStatus = 'off-plan' | 'ready' | 'resale';

export type AreaCluster = 
  | 'prime'           // Downtown, Marina, Palm
  | 'growth-corridor' // JVC, Dubai South, etc.
  | 'family-hub'      // Arabian Ranches, Springs
  | 'waterfront'      // Creek, Lagoons
  | 'emerging';       // New developments

export type InvestmentStrategy = 'rent' | 'flip' | 'hold';

export interface PropertyRecommendation {
  id: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  areaCluster: AreaCluster;
  strategy: InvestmentStrategy;
  riskScore: number; // 1-10
  expectedYield: number; // percentage
  expectedAppreciation: number; // percentage
  priceRange: { min: number; max: number };
  whyItFits: string;
  pros: string[];
  cons: string[];
}

// ==================== ROI SIMULATOR TYPES ====================

export interface ROISimulation {
  id: string;
  buyerId: string;
  
  // Inputs
  budget: number;
  currency: string;
  timeHorizon: number; // years
  propertyType: PropertyType;
  areaCluster: AreaCluster;
  
  // Outputs
  conservativeYield: number;
  moderateYield: number;
  optimisticYield: number;
  
  appreciationScenarios: {
    conservative: number;
    moderate: number;
    optimistic: number;
  };
  
  exitValueProjections: {
    year1: number;
    year3: number;
    year5: number;
    year10: number;
  };
  
  currencyConversions: Record<string, number>;
  
  disclaimers: string[];
  createdAt: Date;
}

// ==================== CHAT & ADVISOR TYPES ====================

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'buyer' | 'advisor' | 'system';
  content: string;
  timestamp: Date;
  
  // AI Analysis
  intentSignals?: string[];
  objectionsDetected?: string[];
  escalationTrigger?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Conversation {
  id: string;
  buyerId: string;
  channel: 'chat' | 'email' | 'whatsapp';
  status: 'active' | 'escalated' | 'closed';
  
  messages: ChatMessage[];
  
  // AI Summary
  summary?: string;
  keyTopics?: string[];
  objectionsResolved?: string[];
  buyingSignals?: string[];
  
  escalatedAt?: Date;
  escalatedReason?: string;
  assignedAgentId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ==================== LEAD SCORING TYPES ====================

export interface LeadScoreBreakdown {
  // Engagement Signals (positive)
  onboardingCompleted: number;
  timeSpentMinutes: number;
  sessionCount: number;
  returningVisits: number;
  roiSimulationsRun: number;
  recommendationsViewed: number;
  chatEngagement: number;
  
  // Readiness Signals (positive)
  budgetClarity: number;
  timelineMentioned: boolean;
  callRequested: boolean;
  contactShared: boolean;
  
  // Negative Signals
  optedOut: boolean;
  disinterestSignals: number;
  inactiveDays: number;
  
  // Calculated Score
  totalScore: number;
  category: LeadScore;
  lastCalculatedAt: Date;
}

// ==================== CRM / DEAL TYPES ====================

export type DealStage = 
  | 'new'
  | 'qualified'
  | 'advisory'
  | 'site-visit'
  | 'booking'
  | 'closed-won'
  | 'closed-lost';

export interface Deal {
  id: string;
  buyerId: string;
  
  stage: DealStage;
  stageHistory: { stage: DealStage; enteredAt: Date; exitedAt?: Date }[];
  
  // Property Interest
  interestedProperties?: string[];
  budget: number;
  timeline?: string;
  
  // Agent Assignment
  assignedAgentId?: string;
  
  // AI Assistance
  stalledDays?: number;
  dropOffRisk: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  
  // Outcomes
  closedValue?: number;
  lostReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

// ==================== AGENT TYPES ====================

export interface Agent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'agent' | 'manager' | 'admin';
  activeDeals: number;
  closedDeals: number;
  conversionRate: number;
}

export interface AgentHandoffPackage {
  buyer: BuyerProfile;
  scoreBreakdown: LeadScoreBreakdown;
  
  // What the agent needs to know
  personaSummary: string;
  urgencyLevel: string;
  timelineHints: string[];
  
  // Engagement History
  toolsUsed: {
    roiSimulations: number;
    recommendationsViewed: number;
    chatMessages: number;
  };
  
  // Key Information
  questionsAsked: string[];
  objectionsRaised: string[];
  objectionsResolved: string[];
  
  // Recommendations
  suggestedOpener: string;
  nextBestAction: string;
  talkingPoints: string[];
}

// ==================== OUTREACH TYPES ====================

export interface OutreachSequence {
  id: string;
  name: string;
  targetPersona: BuyerPersona;
  targetCountry?: string;
  
  steps: OutreachStep[];
  
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
}

export interface OutreachStep {
  id: string;
  dayOffset: number; // days from sequence start
  channel: 'email' | 'whatsapp' | 'sms';
  
  subject?: string;
  content: string;
  
  // Personalization tokens
  personalizedFields: string[];
  
  // Stop conditions
  stopOnReply: boolean;
  stopOnOptOut: boolean;
  stopOnNegativeSignal: boolean;
}

export interface OutreachCampaign {
  id: string;
  sequenceId: string;
  buyerId: string;
  
  currentStep: number;
  status: 'active' | 'paused' | 'completed' | 'stopped';
  stoppedReason?: string;
  
  sentMessages: {
    stepId: string;
    sentAt: Date;
    opened: boolean;
    clicked: boolean;
    replied: boolean;
  }[];
  
  startedAt: Date;
  completedAt?: Date;
}

// ==================== COMPLIANCE TYPES ====================

export interface ConsentRecord {
  buyerId: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'phone';
  consented: boolean;
  consentedAt?: Date;
  revokedAt?: Date;
  source: string;
  ipAddress?: string;
}

export interface AuditLog {
  id: string;
  buyerId: string;
  action: string;
  details: Record<string, any>;
  performedBy: 'system' | 'ai' | string; // agent id
  timestamp: Date;
}

// ==================== PARTNER TYPES ====================

export interface Partner {
  id: string;
  name: string;
  type: 'relocation' | 'wealth-manager' | 'property-management' | 'immigration';
  contactEmail: string;
  trackingCode: string;
  
  // Performance
  leadsReferred: number;
  qualifiedLeads: number;
  conversions: number;
  
  createdAt: Date;
}

// ==================== APP STATE ====================

export interface AppView {
  // Buyer-facing views
  currentView: 
    | 'landing'
    | 'onboarding'
    | 'dashboard'
    | 'recommendations'
    | 'roi-simulator'
    | 'chat'
    // Agent-facing views
    | 'agent-inbox'
    | 'agent-pipeline'
    | 'agent-leads'
    | 'agent-analytics'
    // Admin views
    | 'admin-partners'
    | 'admin-outreach'
    | 'admin-settings';
  
  userType: 'buyer' | 'agent' | 'admin';
}

