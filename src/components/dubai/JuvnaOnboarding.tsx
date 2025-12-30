import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { BuyerProfile, BuyerGoal, BuyerPersona } from '../../types/realEstate';
import { 
  ChevronRight, 
  ChevronLeft,
  TrendingUp,
  Home,
  Plane,
  HelpCircle,
  Clock,
  Shield,
  Check
} from 'lucide-react';

import { YuvnaLogoCompact } from './YuvnaLogo';

interface Question {
  id: string;
  type: 'single' | 'text' | 'email';
  question: string;
  subtext?: string;
  options?: { value: string; label: string; icon?: any; description?: string }[];
  field: string;
  next?: string;
}

const questions: Question[] = [
  {
    id: 'welcome',
    type: 'single',
    question: "What brings you to Dubai real estate?",
    subtext: "Help us personalize your experience",
    options: [
      { value: 'investment', label: 'Investment Returns', icon: TrendingUp, description: 'Rental yield or capital appreciation' },
      { value: 'lifestyle', label: 'Lifestyle Purchase', icon: Home, description: 'A home for myself or family' },
      { value: 'visa', label: 'UAE Residency', icon: Plane, description: 'Property for visa qualification' },
      { value: 'exploring', label: 'Just Exploring', icon: HelpCircle, description: 'Curious about opportunities' },
    ],
    field: 'goal',
    next: 'budget',
  },
  {
    id: 'budget',
    type: 'single',
    question: "What's your investment budget?",
    subtext: "Select the range that fits your plans",
    options: [
      { value: 'under-500k', label: 'Under $500K', description: 'Studios, 1BR apartments' },
      { value: '500k-1m', label: '$500K - $1M', description: '1-2BR apartments, some townhouses' },
      { value: '1m-2m', label: '$1M - $2M', description: '2-3BR, Golden Visa eligible' },
      { value: '2m-5m', label: '$2M - $5M', description: 'Premium apartments, villas' },
      { value: '5m-plus', label: '$5M+', description: 'Luxury properties, prime locations' },
    ],
    field: 'budgetBand',
    next: 'timeline',
  },
  {
    id: 'timeline',
    type: 'single',
    question: "When are you looking to invest?",
    subtext: "This helps us prioritize opportunities",
    options: [
      { value: 'immediate', label: 'Ready Now', icon: Clock, description: 'Within the next month' },
      { value: 'short-term', label: '1-3 Months', description: 'Actively searching' },
      { value: 'medium-term', label: '3-6 Months', description: 'Planning ahead' },
      { value: 'long-term', label: '6-12 Months', description: 'Early research phase' },
      { value: 'just-exploring', label: 'No Timeline', description: 'Just gathering information' },
    ],
    field: 'urgency',
    next: 'risk',
  },
  {
    id: 'risk',
    type: 'single',
    question: "What's your investment approach?",
    subtext: "Understanding your risk tolerance helps us match properties",
    options: [
      { value: 'conservative', label: 'Conservative', icon: Shield, description: 'Stable returns, ready properties' },
      { value: 'moderate', label: 'Balanced', description: 'Mix of stability and growth' },
      { value: 'aggressive', label: 'Growth-Focused', description: 'Higher returns, off-plan' },
    ],
    field: 'riskTolerance',
    next: 'country',
  },
  {
    id: 'country',
    type: 'single',
    question: "Where are you based?",
    subtext: "We'll personalize currency and communication",
    options: [
      { value: 'UAE', label: 'United Arab Emirates' },
      { value: 'UK', label: 'United Kingdom' },
      { value: 'US', label: 'United States' },
      { value: 'India', label: 'India' },
      { value: 'EU', label: 'Europe' },
      { value: 'other', label: 'Other' },
    ],
    field: 'country',
    next: 'email',
  },
  {
    id: 'email',
    type: 'email',
    question: "Where should we send your personalized plan?",
    subtext: "We'll also create your investor dashboard",
    field: 'email',
    next: 'name',
  },
  {
    id: 'name',
    type: 'text',
    question: "What should we call you?",
    subtext: "First name is fine",
    field: 'firstName',
    next: 'complete',
  },
];

function calculatePersona(answers: Record<string, any>): { persona: BuyerPersona; confidence: number } {
  const goal = answers.goal as BuyerGoal;
  const risk = answers.riskTolerance;

  if (goal === 'visa') return { persona: 'visa-driven', confidence: 90 };
  if (goal === 'lifestyle') return { persona: 'lifestyle', confidence: 85 };
  if (goal === 'exploring') return { persona: 'explorer', confidence: 70 };
  if (risk === 'conservative') return { persona: 'yield-investor', confidence: 80 };
  if (risk === 'aggressive') return { persona: 'capital-investor', confidence: 75 };
  return { persona: 'yield-investor', confidence: 70 };
}

function calculateUrgencyScore(answers: Record<string, any>): number {
  const scores: Record<string, number> = {
    'immediate': 95, 'short-term': 80, 'medium-term': 60, 'long-term': 40, 'just-exploring': 20,
  };
  return scores[answers.urgency] || 50;
}

function getCurrencyFromCountry(country: string): string {
  const map: Record<string, string> = { 'UAE': 'AED', 'UK': 'GBP', 'US': 'USD', 'India': 'INR', 'EU': 'EUR' };
  return map[country] || 'USD';
}

export function JuvnaOnboarding() {
  const { 
    setView, 
    updateOnboardingAnswer, 
    setOnboardingProgress,
    completeOnboarding,
    setCurrentBuyer,
    addBuyer,
  } = useRealEstateStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setOnboardingProgress(progress);
  }, [progress, setOnboardingProgress]);

  const handleAnswer = (value: any) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newAnswers = { ...answers, [currentQuestion.field]: value };
    setAnswers(newAnswers);
    updateOnboardingAnswer(currentQuestion.id, value);

    if (currentQuestion.next === 'complete' || currentQuestionIndex === questions.length - 1) {
      handleComplete(newAnswers);
      return;
    }

    setTimeout(() => {
      setCurrentQuestionIndex(prev => prev + 1);
      setInputValue('');
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0 && !isAnimating) {
      setCurrentQuestionIndex(prev => prev - 1);
      setInputValue(answers[questions[currentQuestionIndex - 1].field] || '');
    }
  };

  const handleComplete = (finalAnswers: Record<string, any>) => {
    const { persona, confidence } = calculatePersona(finalAnswers);
    const urgencyScore = calculateUrgencyScore(finalAnswers);

    const buyerProfile: BuyerProfile = {
      id: Math.random().toString(36).substring(2, 15),
      firstName: finalAnswers.firstName || 'Friend',
      lastName: '',
      email: finalAnswers.email || '',
      country: finalAnswers.country || 'other',
      language: 'en',
      currency: getCurrencyFromCountry(finalAnswers.country),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      persona,
      personaConfidence: confidence,
      goal: finalAnswers.goal,
      budgetBand: finalAnswers.budgetBand,
      urgencyScore,
      leadScore: urgencyScore >= 70 ? 'warm' : 'cold',
      engagementScore: 30,
      riskTolerance: finalAnswers.riskTolerance || 'moderate',
      investmentHorizon: '3-5-years',
      source: 'onboarding-widget',
      consentMarketing: true,
      consentWhatsApp: false,
      consentEmail: true,
      optOutChannels: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActiveAt: new Date(),
      onboardingCompletedAt: new Date(),
    };

    completeOnboarding();
    setCurrentBuyer(buyerProfile);
    addBuyer(buyerProfile);
    
    setTimeout(() => setView('dashboard'), 500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[#E8E4E0] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <YuvnaLogoCompact />
          <div className="text-sm text-[#7a6a5f]">
            Step {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-[#F5F3F1]">
        <motion.div 
          className="h-full bg-[#E07F26]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Question */}
              <div className="text-center space-y-3">
                <div className="w-12 h-1 bg-[#E07F26] mx-auto mb-6" />
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-[#3D2D22]">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtext && (
                  <p className="text-lg text-[#7a6a5f]">{currentQuestion.subtext}</p>
                )}
              </div>

              {/* Options */}
              {currentQuestion.type === 'single' ? (
                <div className="grid gap-3">
                  {currentQuestion.options?.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className={`
                        group relative p-5 rounded-xl border-2 text-left transition-all
                        ${answers[currentQuestion.field] === option.value 
                          ? 'bg-[#E07F26]/5 border-[#E07F26]' 
                          : 'bg-white border-[#E8E4E0] hover:border-[#E07F26]/50 hover:bg-[#F9F7F5]'}
                      `}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center gap-4">
                        {option.icon && (
                          <div className={`
                            w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                            ${answers[currentQuestion.field] === option.value 
                              ? 'bg-[#E07F26] text-white' 
                              : 'bg-[#F5F3F1] text-[#3D2D22] group-hover:bg-[#E07F26]/10'}
                          `}>
                            <option.icon className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-semibold text-[#3D2D22] text-lg">{option.label}</div>
                          {option.description && (
                            <div className="text-[#7a6a5f] text-sm mt-1">{option.description}</div>
                          )}
                        </div>
                        <div className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                          ${answers[currentQuestion.field] === option.value 
                            ? 'border-[#E07F26] bg-[#E07F26]' 
                            : 'border-[#E8E4E0]'}
                        `}>
                          {answers[currentQuestion.field] === option.value && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <input
                    type={currentQuestion.type === 'email' ? 'email' : 'text'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentQuestion.type === 'email' ? 'your@email.com' : 'Enter your name'}
                    className="w-full px-6 py-5 rounded-xl bg-white border-2 border-[#E8E4E0] text-[#3D2D22] text-xl placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26] transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        handleAnswer(inputValue.trim());
                      }
                    }}
                  />
                  <button
                    onClick={() => inputValue.trim() && handleAnswer(inputValue.trim())}
                    disabled={!inputValue.trim()}
                    className={`
                      w-full py-4 rounded-xl font-semibold text-base uppercase tracking-wider flex items-center justify-center gap-3 transition-all
                      ${inputValue.trim() 
                        ? 'bg-[#E07F26] text-white hover:bg-[#c96e1f]' 
                        : 'bg-[#E8E4E0] text-[#9a8a7f] cursor-not-allowed'}
                    `}
                  >
                    Continue
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E4E0] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          {currentQuestionIndex > 0 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#7a6a5f] hover:text-[#3D2D22] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2 text-[#9a8a7f] text-sm">
            <Shield className="w-4 h-4" />
            <span>Your data is secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

