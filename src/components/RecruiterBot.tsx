import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Search, PenTool, CheckCircle } from 'lucide-react';

type BotPhase = 'idle' | 'receiving' | 'reading' | 'analyzing' | 'writing' | 'complete';

interface RecruiterBotProps {
  phase: BotPhase;
  message?: string;
}

// Hiring Manager Character (smaller, passes document)
function HiringManager({ isAnimating }: { isAnimating: boolean }) {
  return (
    <motion.div
      className="relative"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Body */}
      <svg width="80" height="100" viewBox="0 0 80 100">
        {/* Head */}
        <motion.circle
          cx="40"
          cy="25"
          r="18"
          fill="#fbbf24"
          animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {/* Eyes */}
        <circle cx="34" cy="22" r="3" fill="#1f2937" />
        <circle cx="46" cy="22" r="3" fill="#1f2937" />
        {/* Smile */}
        <motion.path
          d="M32 30 Q40 36 48 30"
          fill="none"
          stroke="#1f2937"
          strokeWidth="2"
          strokeLinecap="round"
          animate={isAnimating ? { d: ['M32 30 Q40 36 48 30', 'M32 32 Q40 38 48 32', 'M32 30 Q40 36 48 30'] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        {/* Body */}
        <rect x="25" y="45" width="30" height="40" rx="5" fill="#3b82f6" />
        {/* Tie */}
        <polygon points="40,45 35,55 40,90 45,55" fill="#1e40af" />
        {/* Arms */}
        <motion.rect
          x="55"
          y="50"
          width="20"
          height="8"
          rx="4"
          fill="#fbbf24"
          animate={isAnimating ? { rotate: [0, -15, 0], x: [55, 60, 55] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{ transformOrigin: '55px 54px' }}
        />
        <rect x="5" y="50" width="20" height="8" rx="4" fill="#fbbf24" />
      </svg>

      {/* Label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Hiring Manager
      </motion.div>
    </motion.div>
  );
}

// Document being passed
function FloatingDocument({ isAnimating }: { isAnimating: boolean }) {
  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="absolute"
          initial={{ x: 0, y: 20, rotate: 0, opacity: 0 }}
          animate={{ x: 80, y: 0, rotate: 5, opacity: 1 }}
          exit={{ x: 160, y: -10, rotate: 0, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        >
          <div className="w-12 h-16 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center p-1">
            <div className="w-8 h-1 bg-gray-300 rounded mb-1" />
            <div className="w-6 h-1 bg-gray-300 rounded mb-1" />
            <div className="w-7 h-1 bg-gray-300 rounded mb-1" />
            <div className="w-5 h-1 bg-gray-300 rounded" />
            <FileText className="w-4 h-4 text-violet-500 mt-1" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Main Recruiter Bot Character
function RecruiterBotCharacter({ phase }: { phase: BotPhase }) {
  const isReading = phase === 'reading' || phase === 'analyzing';
  const isWriting = phase === 'writing';
  const isComplete = phase === 'complete';

  return (
    <motion.div className="relative">
      <svg width="120" height="150" viewBox="0 0 120 150">
        {/* Glow effect */}
        <motion.circle
          cx="60"
          cy="50"
          r="45"
          fill="url(#botGlow)"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="botGlow">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </radialGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        {/* Robot Head */}
        <motion.rect
          x="30"
          y="15"
          width="60"
          height="50"
          rx="12"
          fill="url(#bodyGradient)"
          animate={isReading ? { y: [15, 12, 15] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        />

        {/* Antenna */}
        <motion.line
          x1="60"
          y1="15"
          x2="60"
          y2="5"
          stroke="#8b5cf6"
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ y2: [5, 2, 5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.circle
          cx="60"
          cy="3"
          r="4"
          fill="#f59e0b"
          animate={{
            fill: ['#f59e0b', '#10b981', '#f59e0b'],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Eyes */}
        <motion.rect
          x="38"
          y="28"
          width="16"
          height="12"
          rx="4"
          fill="#1f2937"
          animate={isReading ? {
            scaleY: [1, 0.3, 1],
          } : isComplete ? {
            fill: ['#1f2937', '#10b981', '#1f2937'],
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        />
        <motion.rect
          x="66"
          y="28"
          width="16"
          height="12"
          rx="4"
          fill="#1f2937"
          animate={isReading ? {
            scaleY: [1, 0.3, 1],
          } : isComplete ? {
            fill: ['#1f2937', '#10b981', '#1f2937'],
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        />

        {/* Eye glow */}
        <motion.rect
          x="42"
          y="32"
          width="8"
          height="4"
          rx="2"
          fill="#60a5fa"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.rect
          x="70"
          y="32"
          width="8"
          height="4"
          rx="2"
          fill="#60a5fa"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />

        {/* Mouth / Display */}
        <motion.rect
          x="42"
          y="48"
          width="36"
          height="10"
          rx="3"
          fill="#1f2937"
          animate={isWriting ? {
            fill: ['#1f2937', '#059669', '#1f2937'],
          } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        />

        {/* Mouth wave animation */}
        {(isReading || isWriting) && (
          <motion.path
            d="M45 53 Q50 50 55 53 Q60 56 65 53 Q70 50 75 53"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            animate={{
              d: [
                'M45 53 Q50 50 55 53 Q60 56 65 53 Q70 50 75 53',
                'M45 53 Q50 56 55 53 Q60 50 65 53 Q70 56 75 53',
                'M45 53 Q50 50 55 53 Q60 56 65 53 Q70 50 75 53',
              ],
            }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        )}

        {/* Body */}
        <motion.rect
          x="35"
          y="70"
          width="50"
          height="55"
          rx="8"
          fill="url(#bodyGradient)"
        />

        {/* Chest display */}
        <rect x="45" y="80" width="30" height="20" rx="4" fill="#1f2937" />
        <motion.text
          x="60"
          y="94"
          textAnchor="middle"
          fill="#10b981"
          fontSize="10"
          fontFamily="monospace"
          animate={{
            opacity: [1, 0.5, 1],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {isReading ? '📖' : isWriting ? '✍️' : isComplete ? '✓' : '●'}
        </motion.text>

        {/* Arms */}
        <motion.rect
          x="10"
          y="75"
          width="25"
          height="10"
          rx="5"
          fill="#7c3aed"
          animate={isWriting ? {
            rotate: [0, -10, 0, 10, 0],
          } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ transformOrigin: '35px 80px' }}
        />
        <motion.rect
          x="85"
          y="75"
          width="25"
          height="10"
          rx="5"
          fill="#7c3aed"
          animate={isReading ? {
            rotate: [0, 15, 0],
            y: [75, 70, 75],
          } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ transformOrigin: '85px 80px' }}
        />

        {/* Hands holding document when reading */}
        {isReading && (
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <rect x="95" y="55" width="20" height="28" rx="3" fill="white" />
            <rect x="98" y="60" width="14" height="2" rx="1" fill="#d1d5db" />
            <rect x="98" y="65" width="12" height="2" rx="1" fill="#d1d5db" />
            <rect x="98" y="70" width="10" height="2" rx="1" fill="#d1d5db" />
          </motion.g>
        )}

        {/* Pen when writing */}
        {isWriting && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: [-5, 5, -5] }}
            transition={{ duration: 0.3, repeat: Infinity }}
            style={{ transformOrigin: '20px 90px' }}
          >
            <rect x="5" y="85" width="20" height="4" rx="2" fill="#f59e0b" />
            <polygon points="5,87 0,87 2,85 2,89" fill="#1f2937" />
          </motion.g>
        )}
      </svg>

      {/* Label */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-violet-300 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Recruiter Bot
      </motion.div>
    </motion.div>
  );
}

// Action icon that appears based on phase
function ActionIndicator({ phase }: { phase: BotPhase }) {
  const icons = {
    idle: null,
    receiving: FileText,
    reading: Search,
    analyzing: Sparkles,
    writing: PenTool,
    complete: CheckCircle,
  };

  const Icon = icons[phase];
  if (!Icon) return null;

  const colors = {
    idle: 'text-white/40',
    receiving: 'text-amber-400',
    reading: 'text-blue-400',
    analyzing: 'text-violet-400',
    writing: 'text-emerald-400',
    complete: 'text-emerald-400',
  };

  return (
    <motion.div
      key={phase}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      className="absolute -top-8 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={{
          y: [0, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 1, repeat: Infinity }}
        className={`p-3 rounded-full bg-white/10 backdrop-blur-sm ${colors[phase]}`}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
    </motion.div>
  );
}

export function RecruiterBot({ phase, message }: RecruiterBotProps) {
  const isReceiving = phase === 'receiving';

  return (
    <div className="relative flex flex-col items-center">
      {/* Scene Container */}
      <div className="relative flex items-end justify-center gap-8 h-40">
        {/* Hiring Manager (only shows during receiving) */}
        <AnimatePresence>
          {isReceiving && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <HiringManager isAnimating={isReceiving} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Document */}
        <FloatingDocument isAnimating={isReceiving} />

        {/* Main Bot */}
        <div className="relative">
          <ActionIndicator phase={phase} />
          <RecruiterBotCharacter phase={phase} />
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 text-center"
          >
            <motion.p
              className="text-white/80 text-lg font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {message}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini version for compact spaces
export function RecruiterBotMini({ phase }: { phase: BotPhase }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.div
        className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
        animate={{
          scale: phase === 'reading' || phase === 'analyzing' ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <span className="text-sm">🤖</span>
      </motion.div>
      <span className="text-white/60 text-sm">
        {phase === 'reading' && 'Reading...'}
        {phase === 'analyzing' && 'Analyzing...'}
        {phase === 'writing' && 'Writing...'}
        {phase === 'complete' && 'Done!'}
      </span>
    </motion.div>
  );
}
