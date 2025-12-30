import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Cpu, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getLLMProviders } from '../utils/ai';
import type { LLMProvider } from '../types';

interface LLMOption {
  provider: LLMProvider;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isConfigured: boolean;
}

const LLM_OPTIONS: Record<LLMProvider, Omit<LLMOption, 'provider' | 'isConfigured'>> = {
  openai: {
    label: 'OpenAI GPT-4',
    shortLabel: 'OpenAI',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  anthropic: {
    label: 'Anthropic Claude',
    shortLabel: 'Claude',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  gemini: {
    label: 'Google Gemini',
    shortLabel: 'Gemini',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
};

interface LLMSelectorProps {
  compact?: boolean;
  showLabel?: boolean;
}

export default function LLMSelector({ compact = false, showLabel = true }: LLMSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedLLM, setSelectedLLM } = useStore();

  // Get configured providers
  const configuredProviders = getLLMProviders();

  const options: LLMOption[] = configuredProviders.map(({ provider, isConfigured }) => ({
    provider,
    ...LLM_OPTIONS[provider],
    isConfigured,
  }));

  const currentOption = options.find(o => o.provider === selectedLLM) || options[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (provider: LLMProvider) => {
    setSelectedLLM(provider);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${isOpen
            ? 'bg-slate-800 border-slate-600'
            : 'bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-slate-800/50'
          }
        `}
      >
        <div className={`p-1 rounded ${currentOption.bgColor}`}>
          <Cpu className={`w-4 h-4 ${currentOption.color}`} />
        </div>
        {showLabel && (
          <span className={`text-sm font-medium ${currentOption.color}`}>
            {compact ? currentOption.shortLabel : currentOption.label}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                AI Model
              </p>
              {options.map((option) => (
                <button
                  key={option.provider}
                  onClick={() => option.isConfigured && handleSelect(option.provider)}
                  disabled={!option.isConfigured}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all
                    ${option.provider === selectedLLM
                      ? `${option.bgColor} ${option.borderColor} border`
                      : option.isConfigured
                        ? 'hover:bg-slate-800'
                        : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${option.bgColor}`}>
                      <Cpu className={`w-4 h-4 ${option.color}`} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${option.isConfigured ? 'text-white' : 'text-slate-500'}`}>
                        {option.label}
                      </p>
                      {!option.isConfigured && (
                        <p className="text-xs text-slate-600">Not configured</p>
                      )}
                    </div>
                  </div>
                  {option.provider === selectedLLM && (
                    <Check className={`w-4 h-4 ${option.color}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 bg-slate-800/50 border-t border-white/5">
              <p className="text-xs text-slate-500">
                Used for JD analysis, candidate evaluation, and screening notes.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Badge version for inline display
export function LLMBadge({ className = '' }: { className?: string }) {
  const { selectedLLM } = useStore();
  const option = LLM_OPTIONS[selectedLLM];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${option.bgColor} ${option.borderColor} border ${className}`}>
      <Cpu className={`w-3 h-3 ${option.color}`} />
      <span className={`text-xs font-medium ${option.color}`}>
        Powered by {option.shortLabel}
      </span>
    </div>
  );
}
