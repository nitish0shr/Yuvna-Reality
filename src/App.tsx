import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sun, Moon, Sparkles, Settings, Volume2, VolumeX, Zap } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SoundProvider, useSound } from './context/SoundContext';
import { useStore } from './store/useStore';

// Import step components
import { JobUploadStep } from './components/steps/JobUploadStep';
import { JobAnalysisStep } from './components/steps/JobAnalysisStep';
import { CandidateUploadStep } from './components/steps/CandidateUploadStep';
import { CandidateResultsStep } from './components/steps/CandidateResultsStep';

// Floating Glow Orbs Background
function GlowOrbs() {
  return (
    <>
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />
    </>
  );
}

function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled, reducedMotion, setReducedMotion, play } = useSound();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl transition-all
          ${isDark
            ? 'glass text-white hover:bg-white/10'
            : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}
        `}
      >
        <Settings size={18} className={isOpen ? 'animate-spin' : ''} style={{ animationDuration: '2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={`absolute right-0 top-full mt-2 z-50 w-64 rounded-xl overflow-hidden
                ${isDark ? 'glass-card' : 'bg-white shadow-xl border border-slate-200'}
              `}
            >
              <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Preferences
                </h3>
              </div>

              <div className="p-3 space-y-3">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
                    ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {isDark ? <Moon size={18} className="text-cyan-400" /> : <Sun size={18} className="text-amber-500" />}
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {isDark ? 'Night Mode' : 'Day Mode'}
                    </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors
                    ${isDark ? 'bg-cyan-500/30' : 'bg-amber-500/30'}
                  `}>
                    <motion.div
                      layout
                      className={`absolute top-1 w-4 h-4 rounded-full
                        ${isDark ? 'bg-cyan-400 right-1' : 'bg-amber-500 left-1'}
                      `}
                    />
                  </div>
                </button>

                {/* Sound Toggle */}
                <button
                  onClick={() => {
                    setSoundEnabled(!soundEnabled);
                    if (!soundEnabled) {
                      // Play a test sound when enabling
                      setTimeout(() => play('settings_saved'), 100);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
                    ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {soundEnabled ? (
                      <Volume2 size={18} className={isDark ? 'text-emerald-400' : 'text-emerald-500'} />
                    ) : (
                      <VolumeX size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                    )}
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Sound Effects
                    </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors
                    ${soundEnabled
                      ? isDark ? 'bg-emerald-500/30' : 'bg-emerald-500/30'
                      : isDark ? 'bg-slate-700' : 'bg-slate-200'}
                  `}>
                    <motion.div
                      layout
                      className={`absolute top-1 w-4 h-4 rounded-full transition-colors
                        ${soundEnabled
                          ? isDark ? 'bg-emerald-400 right-1' : 'bg-emerald-500 right-1'
                          : isDark ? 'bg-slate-500 left-1' : 'bg-slate-400 left-1'}
                      `}
                      style={{ [soundEnabled ? 'right' : 'left']: 4 }}
                    />
                  </div>
                </button>

                {/* Reduced Motion Toggle */}
                <button
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all
                    ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Zap size={18} className={reducedMotion
                      ? isDark ? 'text-slate-500' : 'text-slate-400'
                      : isDark ? 'text-purple-400' : 'text-purple-500'
                    } />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Reduce Motion
                    </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors
                    ${reducedMotion
                      ? isDark ? 'bg-purple-500/30' : 'bg-purple-500/30'
                      : isDark ? 'bg-slate-700' : 'bg-slate-200'}
                  `}>
                    <motion.div
                      layout
                      className={`absolute top-1 w-4 h-4 rounded-full transition-colors
                        ${reducedMotion
                          ? isDark ? 'bg-purple-400 right-1' : 'bg-purple-500 right-1'
                          : isDark ? 'bg-slate-500 left-1' : 'bg-slate-400 left-1'}
                      `}
                      style={{ [reducedMotion ? 'right' : 'left']: 4 }}
                    />
                  </div>
                </button>
              </div>

              <div className={`px-4 py-2 text-xs ${isDark ? 'text-slate-500 border-t border-white/10' : 'text-slate-400 border-t border-slate-100'}`}>
                Preferences are saved automatically
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Logo() {
  const { isDark } = useTheme();
  const { reset } = useStore();

  return (
    <motion.div
      className="flex items-center gap-2.5 cursor-pointer"
      onClick={() => reset()}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center relative overflow-hidden
        ${isDark
          ? 'bg-gradient-to-br from-cyan-500 to-purple-600'
          : 'bg-gradient-to-br from-blue-500 to-indigo-600'}
      `}>
        <Sparkles size={18} className="text-white relative z-10" />
        {isDark && <div className="absolute inset-0 shimmer" />}
      </div>
      <div>
        <h1 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Project Lotus
        </h1>
        <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Intelligent Recruiting
        </p>
      </div>
    </motion.div>
  );
}

function StepIndicator() {
  const { isDark } = useTheme();
  const { phase } = useStore();

  const steps = [
    { id: 'upload-job', label: 'Job' },
    { id: 'analyze-job', label: 'Setup' },
    { id: 'upload-candidates', label: 'Resumes' },
    { id: 'results', label: 'Staircase' },
  ];

  const currentIndex = steps.findIndex(s => s.id === phase);

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              scale: index === currentIndex ? 1 : 0.95,
              opacity: index === currentIndex ? 1 : 0.8,
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${index === currentIndex
                ? isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-blue-600 text-white'
                : index < currentIndex
                  ? isDark
                    ? 'glass text-emerald-400 border border-emerald-500/30'
                    : 'bg-emerald-500 text-white'
                  : isDark
                    ? 'glass text-slate-500'
                    : 'bg-slate-200 text-slate-500'
              }`}
          >
            {index < currentIndex ? (
              <span className="w-4 h-4 flex items-center justify-center">✓</span>
            ) : (
              <span>{index + 1}</span>
            )}
            <span className="hidden md:inline">{step.label}</span>
          </motion.div>
          {index < steps.length - 1 && (
            <div className={`w-6 h-px mx-1 ${index < currentIndex
              ? isDark ? 'bg-emerald-500/50' : 'bg-emerald-500'
              : isDark ? 'bg-white/10' : 'bg-slate-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

function AppContent() {
  const { phase } = useStore();
  const { isDark } = useTheme();

  const renderStep = () => {
    switch (phase) {
      case 'upload-job':
        return <JobUploadStep />;
      case 'analyze-job':
        return <JobAnalysisStep />;
      case 'upload-candidates':
        return <CandidateUploadStep />;
      case 'results':
        return <CandidateResultsStep />;
      default:
        return <JobUploadStep />;
    }
  };

  return (
    <div className={`min-h-screen relative ${isDark ? 'nebula-bg noise-overlay' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      {/* Glow Orbs - Dark mode only */}
      {isDark && <GlowOrbs />}

      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6
        ${isDark ? 'glass border-b border-white/10' : 'bg-white/80 backdrop-blur-xl border-b border-slate-200'}
      `}>
        <Logo />
        <StepIndicator />
        <SettingsPanel />
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-16 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AppContent />
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
