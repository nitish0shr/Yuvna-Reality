import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealEstateStore } from '../../store/realEstateStore';
import type { ChatMessage } from '../../types/realEstate';
import {
  Send,
  Bot,
  User,
  Building2,
  Calculator,
  Phone,
  Calendar,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';

import { YuvnaHeader } from './YuvnaHeader';


const detectIntentSignals = (message: string): string[] => {
  const signals: string[] = [];
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('visit') || lowerMessage.includes('coming to dubai')) signals.push('planning_visit');
  if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) signals.push('purchase_intent');
  if (lowerMessage.includes('speak') || lowerMessage.includes('call') || lowerMessage.includes('talk to someone')) signals.push('call_request');
  if (lowerMessage.includes('available') || lowerMessage.includes('options')) signals.push('property_interest');
  if (lowerMessage.includes('reserve') || lowerMessage.includes('book')) signals.push('booking_intent');
  return signals;
};

const shouldEscalate = (signals: string[]): boolean => {
  const highIntentSignals = ['call_request', 'booking_intent', 'planning_visit'];
  return signals.some(s => highIntentSignals.includes(s));
};

const generateAIResponse = (message: string, context: any): { content: string; signals: string[]; escalate: boolean } => {
  const signals = detectIntentSignals(message);
  const escalate = shouldEscalate(signals);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/^(hi|hello|hey)/)) {
    return {
      content: `Hello! 👋 Welcome to Yuvna Realty. I'm your dedicated investment advisor.\n\nBased on your profile as a ${context.persona?.replace('-', ' ') || 'buyer'}, I can help you with:\n\n• Property recommendations for your budget\n• ROI projections and market analysis\n• Visa options and buying process\n• Area comparisons\n\nWhat would you like to explore?`,
      signals,
      escalate: false,
    };
  }

  if (lowerMessage.includes('roi') || lowerMessage.includes('return') || lowerMessage.includes('yield')) {
    return {
      content: `Great question! 📊 Here's what you can expect for your budget range:\n\n**Rental Yields:**\n• Growth areas (JVC, Dubai South): 7-8.5%\n• Prime areas (Downtown, Marina): 5-6%\n• Emerging areas: 6.5-8%\n\n**Capital Appreciation (2024):**\n• Prime: 5-8% annually\n• Growth areas: 10-15% annually\n\nWould you like me to create a detailed projection for your specific scenario? You can also use our ROI Calculator for custom analysis.`,
      signals,
      escalate: false,
    };
  }

  if (lowerMessage.includes('visa') || lowerMessage.includes('golden visa') || lowerMessage.includes('residency')) {
    return {
      content: `The UAE offers excellent visa options through property investment! 🏠\n\n**Golden Visa (10-year):**\n• Minimum: AED 2,000,000 (~$545,000)\n• Includes family members\n• No sponsor required\n\n**Property Visa (2-year):**\n• Minimum: AED 750,000 (~$205,000)\n• Renewable, covers family\n• Can work or start a business\n\nBased on your budget, you qualify for both options. Would you like property recommendations that meet visa requirements?`,
      signals,
      escalate: false,
    };
  }

  if (signals.includes('call_request')) {
    return {
      content: `Absolutely! I'd be happy to connect you with one of our expert property consultants. 📞\n\nBased on your profile, you'll be matched with someone specializing in:\n• ${context.budget} properties\n• ${context.goal === 'investment' ? 'Investment acquisitions' : 'Lifestyle purchases'}\n\n**Next Steps:**\n1. A consultant will reach out within 4 hours\n2. They'll have your complete profile\n3. No obligation - just expert guidance\n\nWhat's your preferred contact method - call or WhatsApp?`,
      signals,
      escalate: true,
    };
  }

  if (signals.includes('planning_visit')) {
    return {
      content: `Excellent! Visiting Dubai is the best way to finalize your decision. 🌴\n\n**We can arrange:**\n• Personalized property tours\n• Area orientation drives\n• Developer showroom visits\n• Meeting with our consultants\n\n**Pro Tips:**\n• Weekdays are best for viewings\n• Budget 2-3 full days\n• Bring passport copies\n\nWhen are you planning to visit? I can help coordinate everything.`,
      signals,
      escalate: true,
    };
  }

  return {
    content: `That's a great question! As a ${context.persona?.replace('-', ' ') || 'buyer'} with your profile, you have excellent options in Dubai.\n\nI can provide detailed information on:\n• 🏠 Property recommendations\n• 📊 ROI calculations\n• 🌍 Area comparisons\n• 📋 Buying process\n• ✈️ Visa options\n\nWhat would you like to explore?`,
    signals,
    escalate, // Use calculated escalate based on signal detection
  };
};

const quickActions = [
  { label: 'Show ROI projections', icon: Calculator },
  { label: 'Best areas for my budget', icon: Building2 },
  { label: 'Explain Golden Visa', icon: Building2 },
  { label: 'Buying process steps', icon: Clock },
];

export function JuvnaChat() {
  const { currentBuyer } = useRealEstateStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      conversationId: 'main',
      role: 'advisor',
      content: `Hi ${currentBuyer?.firstName || 'there'}! 👋 I'm your Yuvna Realty investment advisor.\n\nI can see you're interested in ${currentBuyer?.goal || 'property investment'} with a budget of ${currentBuyer?.budgetBand?.replace('-', ' to ').toUpperCase() || 'flexible range'}.\n\nHow can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [currentBuyer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      conversationId: 'main',
      role: 'buyer',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const context = {
        persona: currentBuyer?.persona || null,
        budget: currentBuyer?.budgetBand || '500k-1m',
        goal: currentBuyer?.goal || 'investment',
      };
      
      const { content, signals, escalate } = generateAIResponse(messageText, context);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        conversationId: 'main',
        role: 'advisor',
        content,
        timestamp: new Date(),
        intentSignals: signals,
        escalationTrigger: escalate,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      
      if (escalate) setTimeout(() => setShowEscalation(true), 1000);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex flex-col">
      <YuvnaHeader currentPage="chat" />

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === 'buyer' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                message.role === 'buyer' ? 'bg-[#3D2D22]' : 'bg-[#E07F26]/10'
              }`}>
                {message.role === 'buyer' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-[#E07F26]" />
                )}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'buyer' ? 'bg-[#3D2D22] text-white' : 'bg-white border border-[#E8E4E0]'
              }`}>
                <div className={`whitespace-pre-wrap leading-relaxed text-sm ${
                  message.role === 'buyer' ? 'text-white' : 'text-[#3D2D22]'
                }`}>
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${message.role === 'buyer' ? 'text-white/50' : 'text-[#7a6a5f]'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E07F26]/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#E07F26]" />
              </div>
              <div className="bg-white border border-[#E8E4E0] rounded-2xl p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#E07F26] animate-spin" />
                <span className="text-[#7a6a5f] text-sm">Typing...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="border-t border-[#E8E4E0] bg-white">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.label)}
                  className="px-4 py-2 rounded-lg bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] text-sm hover:border-[#E07F26] hover:bg-[#E07F26]/5 transition-all flex items-center gap-2"
                >
                  <action.icon className="w-4 h-4 text-[#E07F26]" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#E8E4E0] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about Dubai real estate..."
              className="flex-1 px-5 py-3 rounded-xl bg-[#F9F7F5] border border-[#E8E4E0] text-[#3D2D22] placeholder:text-[#9a8a7f] focus:outline-none focus:border-[#E07F26]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="px-6 py-3 rounded-xl bg-[#E07F26] text-white font-semibold flex items-center gap-2 hover:bg-[#c96e1f] transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Escalation Modal */}
      <AnimatePresence>
        {showEscalation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
            onClick={() => setShowEscalation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-xl bg-[#E07F26]/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-[#E07F26]" />
                </div>
                <h2 className="text-xl font-serif font-bold text-[#3D2D22] mb-2">Ready for the Next Step?</h2>
                <p className="text-[#7a6a5f] text-sm">
                  Connect with one of our licensed property consultants for personalized guidance.
                </p>
              </div>

              <div className="space-y-3">
                <button onClick={() => setShowEscalation(false)} className="w-full py-3 rounded-xl bg-[#E07F26] text-white font-semibold flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" /> Request a Call Back
                </button>
                <button onClick={() => setShowEscalation(false)} className="w-full py-3 rounded-xl border-2 border-[#3D2D22] text-[#3D2D22] font-semibold flex items-center justify-center gap-2 hover:bg-[#3D2D22] hover:text-white transition-all">
                  <Calendar className="w-5 h-5" /> Schedule a Meeting
                </button>
                <button onClick={() => setShowEscalation(false)} className="w-full py-3 text-[#7a6a5f] text-sm hover:text-[#3D2D22] transition-colors">
                  Continue chatting
                </button>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-[#F9F7F5] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#7a6a5f] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#7a6a5f]">Our consultants are RERA licensed. No obligation, just expert advice.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

