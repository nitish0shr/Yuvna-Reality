import { create } from 'zustand';
import type {
  BuyerProfile,
  BuyerPersona,
  LeadScore,
  OnboardingState,
  PropertyRecommendation,
  ROISimulation,
  Conversation,
  ChatMessage,
  Deal,
  DealStage,
  Agent,
  AgentHandoffPackage,
  LeadScoreBreakdown,
  AppView,
} from '../types/realEstate';

// ==================== STORE INTERFACE ====================

interface RealEstateStore {
  // App State
  currentView: AppView['currentView'];
  userType: AppView['userType'];
  setView: (view: AppView['currentView']) => void;
  setUserType: (type: AppView['userType']) => void;

  // Current Buyer (for buyer-facing app)
  currentBuyer: BuyerProfile | null;
  setCurrentBuyer: (buyer: BuyerProfile | null) => void;
  updateBuyerProfile: (updates: Partial<BuyerProfile>) => void;

  // Onboarding
  onboardingState: OnboardingState | null;
  startOnboarding: () => void;
  updateOnboardingAnswer: (questionId: string, answer: any) => void;
  setOnboardingProgress: (progress: number) => void;
  completeOnboarding: () => void;

  // Recommendations
  recommendations: PropertyRecommendation[];
  setRecommendations: (recs: PropertyRecommendation[]) => void;
  selectedRecommendation: PropertyRecommendation | null;
  selectRecommendation: (rec: PropertyRecommendation | null) => void;

  // ROI Simulator
  roiSimulations: ROISimulation[];
  currentSimulation: ROISimulation | null;
  addSimulation: (sim: ROISimulation) => void;
  setCurrentSimulation: (sim: ROISimulation | null) => void;

  // Chat / Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conv: Conversation | null) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  createConversation: (buyerId: string) => Conversation;

  // Lead Scoring
  leadScores: Record<string, LeadScoreBreakdown>;
  updateLeadScore: (buyerId: string, score: LeadScoreBreakdown) => void;
  calculateLeadScore: (buyerId: string) => LeadScoreBreakdown;

  // Agent State (for agent dashboard)
  currentAgent: Agent | null;
  setCurrentAgent: (agent: Agent | null) => void;
  
  // All Buyers (for agent view)
  allBuyers: BuyerProfile[];
  addBuyer: (buyer: BuyerProfile) => void;
  updateBuyer: (buyerId: string, updates: Partial<BuyerProfile>) => void;
  getBuyerById: (id: string) => BuyerProfile | undefined;

  // Deals / Pipeline
  deals: Deal[];
  addDeal: (deal: Deal) => void;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  moveDealStage: (dealId: string, newStage: DealStage) => void;
  getDealsByStage: (stage: DealStage) => Deal[];

  // Handoff
  generateHandoffPackage: (buyerId: string) => AgentHandoffPackage | null;

  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Modal State
  activeModal: string | null;
  modalData: any;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
}

// ==================== HELPER FUNCTIONS ====================

const generateId = () => Math.random().toString(36).substring(2, 15);

const calculateLeadCategory = (score: number): LeadScore => {
  if (score >= 80) return 'ready-to-call';
  if (score >= 60) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
};

// ==================== STORE IMPLEMENTATION ====================

export const useRealEstateStore = create<RealEstateStore>((set, get) => ({
  // ==================== APP STATE ====================
  currentView: 'landing',
  userType: 'buyer',
  
  setView: (view) => set({ currentView: view }),
  setUserType: (type) => set({ userType: type }),

  // ==================== CURRENT BUYER ====================
  currentBuyer: null,
  
  setCurrentBuyer: (buyer) => set({ currentBuyer: buyer }),
  
  updateBuyerProfile: (updates) => set((state) => ({
    currentBuyer: state.currentBuyer 
      ? { ...state.currentBuyer, ...updates, updatedAt: new Date() }
      : null
  })),

  // ==================== ONBOARDING ====================
  onboardingState: null,
  
  startOnboarding: () => set({
    onboardingState: {
      currentQuestionId: 'welcome',
      answers: {},
      progress: 0,
      startedAt: new Date(),
    }
  }),
  
  updateOnboardingAnswer: (questionId, answer) => set((state) => ({
    onboardingState: state.onboardingState 
      ? {
          ...state.onboardingState,
          answers: { ...state.onboardingState.answers, [questionId]: answer }
        }
      : null
  })),
  
  setOnboardingProgress: (progress) => set((state) => ({
    onboardingState: state.onboardingState 
      ? { ...state.onboardingState, progress }
      : null
  })),
  
  completeOnboarding: () => set((state) => ({
    onboardingState: state.onboardingState 
      ? { ...state.onboardingState, completedAt: new Date(), progress: 100 }
      : null
  })),

  // ==================== RECOMMENDATIONS ====================
  recommendations: [],
  selectedRecommendation: null,
  
  setRecommendations: (recs) => set({ recommendations: recs }),
  selectRecommendation: (rec) => set({ selectedRecommendation: rec }),

  // ==================== ROI SIMULATOR ====================
  roiSimulations: [],
  currentSimulation: null,
  
  addSimulation: (sim) => set((state) => ({
    roiSimulations: [...state.roiSimulations, sim]
  })),
  
  setCurrentSimulation: (sim) => set({ currentSimulation: sim }),

  // ==================== CONVERSATIONS ====================
  conversations: [],
  activeConversation: null,
  
  setActiveConversation: (conv) => set({ activeConversation: conv }),
  
  addMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, messages: [...conv.messages, message], updatedAt: new Date() }
        : conv
    ),
    activeConversation: state.activeConversation?.id === conversationId
      ? { ...state.activeConversation, messages: [...state.activeConversation.messages, message] }
      : state.activeConversation
  })),
  
  createConversation: (buyerId) => {
    const newConv: Conversation = {
      id: generateId(),
      buyerId,
      channel: 'chat',
      status: 'active',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      conversations: [...state.conversations, newConv],
      activeConversation: newConv
    }));
    return newConv;
  },

  // ==================== LEAD SCORING ====================
  leadScores: {},
  
  updateLeadScore: (buyerId, score) => set((state) => ({
    leadScores: { ...state.leadScores, [buyerId]: score }
  })),
  
  calculateLeadScore: (buyerId) => {
    const state = get();
    const buyer = state.allBuyers.find(b => b.id === buyerId) || state.currentBuyer;
    const conversations = state.conversations.filter(c => c.buyerId === buyerId);
    const simulations = state.roiSimulations.filter(s => s.buyerId === buyerId);
    
    let score = 0;
    
    // Onboarding completed: +20
    if (buyer?.onboardingCompletedAt) score += 20;
    
    // ROI simulations run: +10 each (max 30)
    score += Math.min(simulations.length * 10, 30);
    
    // Chat engagement: +5 per conversation, +1 per message (max 20)
    const chatScore = conversations.reduce((acc, conv) => 
      acc + 5 + conv.messages.filter(m => m.role === 'buyer').length, 0);
    score += Math.min(chatScore, 20);
    
    // Budget clarity: +10
    if (buyer?.budgetBand && buyer.budgetBand !== 'under-500k') score += 10;
    
    // High urgency: +10
    if (buyer?.urgencyScore && buyer.urgencyScore > 70) score += 10;
    
    // Returning visits (simulated): +5
    if (buyer?.lastActiveAt && buyer.createdAt) {
      const daysSinceCreation = (new Date().getTime() - new Date(buyer.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 1) score += 5;
    }
    
    const breakdown: LeadScoreBreakdown = {
      onboardingCompleted: buyer?.onboardingCompletedAt ? 20 : 0,
      timeSpentMinutes: 0,
      sessionCount: 1,
      returningVisits: 0,
      roiSimulationsRun: simulations.length,
      recommendationsViewed: state.recommendations.length > 0 ? 1 : 0,
      chatEngagement: conversations.length,
      budgetClarity: buyer?.budgetBand ? 10 : 0,
      timelineMentioned: false,
      callRequested: false,
      contactShared: !!(buyer?.phone),
      optedOut: false,
      disinterestSignals: 0,
      inactiveDays: 0,
      totalScore: Math.min(score, 100),
      category: calculateLeadCategory(score),
      lastCalculatedAt: new Date(),
    };
    
    set((state) => ({
      leadScores: { ...state.leadScores, [buyerId]: breakdown }
    }));
    
    return breakdown;
  },

  // ==================== AGENT STATE ====================
  currentAgent: null,
  setCurrentAgent: (agent) => set({ currentAgent: agent }),

  // ==================== ALL BUYERS ====================
  allBuyers: [],
  
  addBuyer: (buyer) => set((state) => ({
    allBuyers: [...state.allBuyers, buyer]
  })),
  
  updateBuyer: (buyerId, updates) => set((state) => ({
    allBuyers: state.allBuyers.map(b =>
      b.id === buyerId ? { ...b, ...updates, updatedAt: new Date() } : b
    )
  })),
  
  getBuyerById: (id) => get().allBuyers.find(b => b.id === id),

  // ==================== DEALS ====================
  deals: [],
  
  addDeal: (deal) => set((state) => ({
    deals: [...state.deals, deal]
  })),
  
  updateDeal: (dealId, updates) => set((state) => ({
    deals: state.deals.map(d =>
      d.id === dealId ? { ...d, ...updates, updatedAt: new Date() } : d
    )
  })),
  
  moveDealStage: (dealId, newStage) => set((state) => ({
    deals: state.deals.map(d => {
      if (d.id !== dealId) return d;
      const now = new Date();
      const updatedHistory = d.stageHistory.map((h, i) =>
        i === d.stageHistory.length - 1 ? { ...h, exitedAt: now } : h
      );
      return {
        ...d,
        stage: newStage,
        stageHistory: [...updatedHistory, { stage: newStage, enteredAt: now }],
        updatedAt: now,
        closedAt: newStage.startsWith('closed') ? now : undefined,
      };
    })
  })),
  
  getDealsByStage: (stage) => get().deals.filter(d => d.stage === stage),

  // ==================== HANDOFF ====================
  generateHandoffPackage: (buyerId) => {
    const state = get();
    const buyer = state.allBuyers.find(b => b.id === buyerId) || state.currentBuyer;
    if (!buyer) return null;
    
    const score = state.leadScores[buyerId] || state.calculateLeadScore(buyerId);
    const conversations = state.conversations.filter(c => c.buyerId === buyerId);
    const simulations = state.roiSimulations.filter(s => s.buyerId === buyerId);
    
    // Extract questions and objections from chat
    const allMessages = conversations.flatMap(c => c.messages);
    const buyerMessages = allMessages.filter(m => m.role === 'buyer');
    const questionsAsked = buyerMessages
      .filter(m => m.content.includes('?'))
      .map(m => m.content)
      .slice(-5);
    
    const package_: AgentHandoffPackage = {
      buyer,
      scoreBreakdown: score,
      personaSummary: getPersonaSummary(buyer.persona),
      urgencyLevel: getUrgencyLevel(buyer.urgencyScore),
      timelineHints: getTimelineHints(buyer),
      toolsUsed: {
        roiSimulations: simulations.length,
        recommendationsViewed: state.recommendations.length > 0 ? 1 : 0,
        chatMessages: buyerMessages.length,
      },
      questionsAsked,
      objectionsRaised: [], // Would come from AI analysis
      objectionsResolved: [],
      suggestedOpener: generateOpener(buyer),
      nextBestAction: getNextBestAction(buyer, score),
      talkingPoints: getTalkingPoints(buyer, simulations),
    };
    
    return package_;
  },

  // ==================== UI STATE ====================
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  
  activeModal: null,
  modalData: null,
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}));

// ==================== HELPER FUNCTIONS ====================

function getPersonaSummary(persona: BuyerPersona | null): string {
  const summaries: Record<BuyerPersona, string> = {
    'yield-investor': 'Focused on rental returns. Prioritizes areas with high occupancy and stable yields.',
    'capital-investor': 'Looking for capital appreciation. Interested in emerging areas and off-plan opportunities.',
    'lifestyle': 'Buying for personal use. Quality of life, amenities, and location are key factors.',
    'visa-driven': 'Primary motivation is UAE residency. Needs to meet visa threshold requirements.',
    'explorer': 'Early stage, gathering information. Not ready to commit but showing interest.',
  };
  return persona ? summaries[persona] : 'Persona not yet determined.';
}

function getUrgencyLevel(score: number): string {
  if (score >= 80) return 'Very High - Ready to move now';
  if (score >= 60) return 'High - Active buyer, 1-3 months';
  if (score >= 40) return 'Medium - 3-6 months timeline';
  if (score >= 20) return 'Low - 6-12 months, still researching';
  return 'Very Low - Just exploring, no timeline';
}

function getTimelineHints(buyer: BuyerProfile): string[] {
  const hints: string[] = [];
  if (buyer.urgencyScore >= 70) hints.push('Mentioned visiting Dubai soon');
  if (buyer.goal === 'visa') hints.push('Visa deadline may be a factor');
  if (buyer.budgetBand === '5m-plus') hints.push('Serious budget indicates readiness');
  return hints;
}

function generateOpener(buyer: BuyerProfile): string {
  const name = buyer.firstName;
  const goal = buyer.goal;
  
  if (goal === 'investment') {
    return `Hi ${name}, I saw you've been exploring investment opportunities in Dubai. Based on your profile, I have some specific yield opportunities that match your criteria. Would you have 15 minutes this week to discuss?`;
  }
  if (goal === 'visa') {
    return `Hi ${name}, I understand you're interested in the UAE residency pathway through property. I can walk you through the most efficient options that meet the visa threshold. When works for a quick call?`;
  }
  if (goal === 'lifestyle') {
    return `Hi ${name}, I noticed you're looking at Dubai for a lifestyle move. I'd love to share some communities that match what you're looking for. Shall we schedule a call?`;
  }
  return `Hi ${name}, thank you for your interest in Dubai real estate. I'd be happy to answer any questions and share personalized recommendations. What's the best time to connect?`;
}

function getNextBestAction(_buyer: BuyerProfile, score: LeadScoreBreakdown): string {
  if (score.callRequested) return 'Schedule call immediately - buyer requested contact';
  if (score.totalScore >= 80) return 'Call within 4 hours - hot lead';
  if (score.roiSimulationsRun > 2) return 'Send detailed property comparison based on their ROI interests';
  if (!score.budgetClarity) return 'Qualify budget and timeline';
  return 'Send personalized follow-up with area recommendations';
}

function getTalkingPoints(buyer: BuyerProfile, simulations: ROISimulation[]): string[] {
  const points: string[] = [];
  
  if (buyer.persona === 'yield-investor') {
    points.push('Discuss current rental yields in their preferred areas');
    points.push('Mention property management services');
  }
  
  if (buyer.persona === 'visa-driven') {
    points.push('Confirm visa threshold requirements (AED 750k minimum)');
    points.push('Explain the Golden Visa option for 2M+ investments');
  }
  
  if (simulations.length > 0) {
    points.push(`They ran ${simulations.length} ROI simulation(s) - discuss their specific scenarios`);
  }
  
  points.push(`They prefer communication in ${buyer.language}`);
  points.push(`Their budget range is ${buyer.budgetBand.replace('-', ' to ').replace('k', 'K').replace('m', 'M')}`);
  
  return points;
}

export default useRealEstateStore;

