import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Check, X, FileText, Sparkles, Search, Trophy, Archive, ThumbsUp, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

// ========================================
// CHARACTER DESIGN: HM-Bot (Hiring Manager)
// Robust, stationary, authoritative
// ========================================
export function HMBot({
  action = 'idle',
  size = 'medium'
}: {
  action?: 'idle' | 'holding' | 'passing' | 'thumbsUp' | 'pointing';
  size?: 'small' | 'medium' | 'large';
}) {
  const scale = size === 'small' ? 0.6 : size === 'large' ? 1.4 : 1;

  return (
    <motion.div
      className="relative"
      style={{ transform: `scale(${scale})` }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg width="100" height="140" viewBox="0 0 100 140">
        {/* Glow effect */}
        <defs>
          <radialGradient id="hmGlow">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </radialGradient>
          <linearGradient id="hmBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="hmAccent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Glow */}
        <motion.ellipse
          cx="50"
          cy="70"
          rx="45"
          ry="60"
          fill="url(#hmGlow)"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Base/Stand - Stationary feel */}
        <rect x="30" y="120" width="40" height="10" rx="3" fill="#1e3a5f" />
        <rect x="35" y="115" width="30" height="8" rx="2" fill="#2563eb" />

        {/* Body - Robust rectangular shape */}
        <motion.rect
          x="25"
          y="55"
          width="50"
          height="60"
          rx="8"
          fill="url(#hmBody)"
          animate={action === 'thumbsUp' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        />

        {/* Tie/Authority stripe */}
        <rect x="47" y="60" width="6" height="50" rx="2" fill="#1e40af" />

        {/* Chest display */}
        <rect x="32" y="70" width="36" height="20" rx="4" fill="#0f172a" />
        <motion.rect
          x="35"
          y="73"
          width="30"
          height="14"
          rx="2"
          fill="#1e3a5f"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <text x="50" y="84" textAnchor="middle" fill="#60a5fa" fontSize="8" fontFamily="monospace">
          {action === 'thumbsUp' ? '👍' : 'HM'}
        </text>

        {/* Head - Square/authoritative */}
        <motion.rect
          x="30"
          y="15"
          width="40"
          height="38"
          rx="6"
          fill="url(#hmBody)"
          animate={action === 'pointing' ? { rotate: [0, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
        />

        {/* Face plate */}
        <rect x="35" y="22" width="30" height="24" rx="4" fill="#0f172a" />

        {/* Eyes - Serious/focused */}
        <motion.rect
          x="38"
          y="28"
          width="8"
          height="4"
          rx="1"
          fill="#60a5fa"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.rect
          x="54"
          y="28"
          width="8"
          height="4"
          rx="1"
          fill="#60a5fa"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
        />

        {/* Mouth - Stoic line */}
        <rect x="42" y="38" width="16" height="3" rx="1" fill="#334155" />

        {/* Arms */}
        <motion.g
          animate={action === 'passing' ? { x: [0, 15, 0] } : action === 'pointing' ? { rotate: [0, -20, 0] } : {}}
          transition={{ duration: 0.8 }}
          style={{ transformOrigin: '75px 75px' }}
        >
          {/* Right arm */}
          <rect x="75" y="65" width="20" height="10" rx="4" fill="url(#hmAccent)" />
          {action === 'thumbsUp' && (
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <circle cx="90" cy="60" r="8" fill="#fbbf24" />
              <ThumbsUp className="text-white" style={{ transform: 'translate(82px, 52px)' }} size={16} />
            </motion.g>
          )}
        </motion.g>

        {/* Left arm - holding clipboard when needed */}
        <motion.g
          animate={action === 'holding' || action === 'passing' ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <rect x="5" y="65" width="20" height="10" rx="4" fill="url(#hmAccent)" />
        </motion.g>

        {/* Clipboard when holding */}
        <AnimatePresence>
          {(action === 'holding' || action === 'passing') && (
            <motion.g
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: action === 'passing' ? 30 : 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <rect x="0" y="50" width="25" height="35" rx="3" fill="#fbbf24" />
              <rect x="3" y="55" width="19" height="3" rx="1" fill="#92400e" />
              <rect x="3" y="61" width="15" height="2" rx="1" fill="#92400e" opacity="0.7" />
              <rect x="3" y="66" width="17" height="2" rx="1" fill="#92400e" opacity="0.7" />
              <rect x="3" y="71" width="12" height="2" rx="1" fill="#92400e" opacity="0.7" />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Label */}
      <motion.div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-blue-300 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        HM-Bot
      </motion.div>
    </motion.div>
  );
}

// ========================================
// CHARACTER DESIGN: R-Bot (Recruiter)
// Agile, floating, energetic, with scanner
// ========================================
export function RBot({
  action = 'idle',
  size = 'medium',
  showGoggles = false
}: {
  action?: 'idle' | 'receiving' | 'scanning' | 'writing' | 'celebrating' | 'sympathetic' | 'thinking';
  size?: 'small' | 'medium' | 'large';
  showGoggles?: boolean;
}) {
  const scale = size === 'small' ? 0.6 : size === 'large' ? 1.4 : 1;

  return (
    <motion.div
      className="relative"
      style={{ transform: `scale(${scale})` }}
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Floating animation wrapper */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="100" height="130" viewBox="0 0 100 130">
          {/* Glow effect */}
          <defs>
            <radialGradient id="rGlow">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.5)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            <linearGradient id="rBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="rAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Glow */}
          <motion.ellipse
            cx="50"
            cy="60"
            rx="40"
            ry="50"
            fill="url(#rGlow)"
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Hover jets */}
          <motion.g
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          >
            <ellipse cx="35" cy="115" rx="8" ry="4" fill="#a78bfa" opacity="0.6" />
            <ellipse cx="65" cy="115" rx="8" ry="4" fill="#a78bfa" opacity="0.6" />
            <motion.path
              d="M35 115 L30 125 M35 115 L35 128 M35 115 L40 125"
              stroke="#a78bfa"
              strokeWidth="2"
              opacity="0.4"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.2, repeat: Infinity }}
            />
            <motion.path
              d="M65 115 L60 125 M65 115 L65 128 M65 115 L70 125"
              stroke="#a78bfa"
              strokeWidth="2"
              opacity="0.4"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 0.2, repeat: Infinity, delay: 0.1 }}
            />
          </motion.g>

          {/* Body - Rounded/agile shape */}
          <motion.ellipse
            cx="50"
            cy="75"
            rx="28"
            ry="35"
            fill="url(#rBody)"
            animate={action === 'celebrating' ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3, repeat: action === 'celebrating' ? Infinity : 0 }}
          />

          {/* Chest display */}
          <ellipse cx="50" cy="80" rx="18" ry="15" fill="#0f172a" />
          <motion.ellipse
            cx="50"
            cy="80"
            rx="14"
            ry="11"
            fill="#1e1b4b"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <text x="50" y="84" textAnchor="middle" fill="#a78bfa" fontSize="10" fontFamily="monospace">
            {action === 'scanning' ? '🔍' : action === 'writing' ? '✍️' : action === 'celebrating' ? '🎉' : 'R'}
          </text>

          {/* Head - Rounder/friendlier */}
          <motion.circle
            cx="50"
            cy="30"
            r="22"
            fill="url(#rBody)"
            animate={
              action === 'thinking' ? { rotate: [0, -5, 5, 0] } :
              action === 'sympathetic' ? { y: [0, 3, 0] } : {}
            }
            transition={{ duration: 1, repeat: Infinity }}
          />

          {/* Face plate */}
          <ellipse cx="50" cy="30" rx="16" ry="14" fill="#0f172a" />

          {/* Eyes - Expressive */}
          <motion.g
            animate={
              action === 'celebrating' ? { scale: [1, 1.2, 1] } :
              action === 'sympathetic' ? { y: [0, 2, 0] } : {}
            }
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <motion.circle
              cx="42"
              cy="27"
              r="5"
              fill="#a78bfa"
              animate={{
                scaleY: action === 'scanning' ? [1, 0.3, 1] : [1, 0.8, 1]
              }}
              transition={{ duration: action === 'scanning' ? 0.5 : 2, repeat: Infinity }}
            />
            <motion.circle
              cx="58"
              cy="27"
              r="5"
              fill="#a78bfa"
              animate={{
                scaleY: action === 'scanning' ? [1, 0.3, 1] : [1, 0.8, 1]
              }}
              transition={{ duration: action === 'scanning' ? 0.5 : 2, repeat: Infinity, delay: 0.1 }}
            />
            {/* Eye sparkle */}
            <circle cx="44" cy="25" r="1.5" fill="white" opacity="0.8" />
            <circle cx="60" cy="25" r="1.5" fill="white" opacity="0.8" />
          </motion.g>

          {/* Mouth - Animated */}
          <motion.path
            d={
              action === 'celebrating' ? 'M42 36 Q50 44 58 36' :
              action === 'sympathetic' ? 'M42 38 Q50 34 58 38' :
              'M42 36 Q50 40 58 36'
            }
            fill="none"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Goggles/Scanner when active */}
          <AnimatePresence>
            {(showGoggles || action === 'scanning') && (
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <rect x="32" y="20" width="36" height="14" rx="4" fill="#f59e0b" />
                <rect x="35" y="22" width="12" height="10" rx="2" fill="#0f172a" />
                <rect x="53" y="22" width="12" height="10" rx="2" fill="#0f172a" />
                <motion.rect
                  x="37"
                  y="24"
                  width="8"
                  height="6"
                  rx="1"
                  fill="#10b981"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                />
                <motion.rect
                  x="55"
                  y="24"
                  width="8"
                  height="6"
                  rx="1"
                  fill="#10b981"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Antenna */}
          <motion.g
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ transformOrigin: '50px 8px' }}
          >
            <line x1="50" y1="8" x2="50" y2="0" stroke="#8b5cf6" strokeWidth="2" />
            <motion.circle
              cx="50"
              cy="0"
              r="4"
              fill="#f59e0b"
              animate={{
                fill: ['#f59e0b', '#10b981', '#f59e0b'],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.g>

          {/* Arms */}
          {/* Left arm */}
          <motion.g
            animate={
              action === 'receiving' ? { rotate: [0, 20, 0], x: [-5, 0, -5] } :
              action === 'writing' ? { rotate: [0, -10, 0] } : {}
            }
            transition={{ duration: 0.5, repeat: Infinity }}
            style={{ transformOrigin: '22px 65px' }}
          >
            <ellipse cx="18" cy="65" rx="10" ry="6" fill="url(#rAccent)" />
            {/* Hand */}
            <circle cx="10" cy="65" r="5" fill="#a78bfa" />
          </motion.g>

          {/* Right arm */}
          <motion.g
            animate={
              action === 'scanning' ? { rotate: [0, -30, 0] } :
              action === 'writing' ? { rotate: [-20, -30, -20], y: [0, 5, 0] } :
              action === 'celebrating' ? { rotate: [0, -45, 0] } : {}
            }
            transition={{ duration: action === 'writing' ? 0.3 : 0.8, repeat: Infinity }}
            style={{ transformOrigin: '78px 65px' }}
          >
            <ellipse cx="82" cy="65" rx="10" ry="6" fill="url(#rAccent)" />
            {/* Hand */}
            <circle cx="90" cy="65" r="5" fill="#a78bfa" />

            {/* Scanner beam when scanning */}
            {action === 'scanning' && (
              <motion.line
                x1="90"
                y1="70"
                x2="90"
                y2="120"
                stroke="#10b981"
                strokeWidth="3"
                opacity="0.6"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />
            )}

            {/* Pen when writing */}
            {action === 'writing' && (
              <motion.g>
                <rect x="88" y="68" width="3" height="20" rx="1" fill="#f59e0b" />
                <polygon points="89.5,88 87,92 92,92" fill="#1f2937" />
              </motion.g>
            )}
          </motion.g>
        </svg>
      </motion.div>

      {/* Label */}
      <motion.div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-violet-300 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        R-Bot
      </motion.div>
    </motion.div>
  );
}

// ========================================
// ACT 1: THE HAND-OFF SCENE
// ========================================
interface HandOffSceneProps {
  phase: 'entering' | 'handoff' | 'extraction' | 'complete';
  extractedFields?: { label: string; value: string }[];
  onComplete?: () => void;
}

export function HandOffScene({ phase, extractedFields = [] }: HandOffSceneProps) {
  const [localPhase, setLocalPhase] = useState(phase);

  useEffect(() => {
    setLocalPhase(phase);
  }, [phase]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[300px]">
      {/* Characters */}
      <div className="flex items-end justify-center gap-8">
        <AnimatePresence>
          {(localPhase === 'entering' || localPhase === 'handoff') && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HMBot action={localPhase === 'handoff' ? 'passing' : 'holding'} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating document during handoff */}
        <AnimatePresence>
          {localPhase === 'handoff' && (
            <motion.div
              className="absolute"
              initial={{ x: -20, y: 0, rotate: 0 }}
              animate={{ x: 80, y: -10, rotate: 5 }}
              exit={{ x: 100, y: 0, opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="w-16 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg shadow-lg flex flex-col items-center justify-center p-2">
                <FileText className="w-6 h-6 text-amber-900 mb-1" />
                <div className="w-10 h-1 bg-amber-700/50 rounded" />
                <div className="w-8 h-1 bg-amber-700/50 rounded mt-1" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <RBot action={localPhase === 'handoff' ? 'receiving' : 'idle'} />
        </motion.div>
      </div>

      {/* Fist bump effect */}
      <AnimatePresence>
        {localPhase === 'handoff' && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Sparkles className="w-12 h-12 text-amber-400" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extracted fields flying out */}
      <AnimatePresence>
        {localPhase === 'extraction' && extractedFields.length > 0 && (
          <motion.div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-3">
            {extractedFields.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ y: -100, x: 50, opacity: 0, scale: 0 }}
                animate={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2, duration: 0.5, type: 'spring' }}
                className="px-4 py-2 bg-gradient-to-r from-violet-500/80 to-blue-500/80 rounded-full text-white text-sm shadow-lg"
              >
                <span className="font-medium">{field.label}:</span> {field.value}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status message */}
      <motion.p
        className="mt-8 text-white/70 text-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {localPhase === 'entering' && 'Hiring Manager arriving with job details...'}
        {localPhase === 'handoff' && 'Handing over the job requirements...'}
        {localPhase === 'extraction' && 'Extracting key criteria...'}
        {localPhase === 'complete' && 'Ready to find candidates!'}
      </motion.p>
    </div>
  );
}

// ========================================
// ACT 2: THE WAR ROOM SCENE
// ========================================
interface WarRoomSceneProps {
  phase: 'focusing' | 'scanning' | 'noting' | 'complete';
  currentFile?: string;
  findings?: { type: 'skill' | 'gap' | 'flag'; text: string }[];
}

export function WarRoomScene({ phase, currentFile, findings = [] }: WarRoomSceneProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[350px]">
      {/* R-Bot with goggles */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <RBot
          action={
            phase === 'focusing' ? 'idle' :
            phase === 'scanning' ? 'scanning' :
            phase === 'noting' ? 'writing' : 'celebrating'
          }
          showGoggles={phase === 'focusing' || phase === 'scanning'}
          size="large"
        />

        {/* Scanning target (resume) */}
        <AnimatePresence>
          {phase === 'scanning' && (
            <motion.div
              className="absolute -right-24 top-10"
              initial={{ x: 50, opacity: 0, rotate: 10 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <motion.div
                className="w-20 h-28 bg-white rounded-lg shadow-2xl p-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-full h-2 bg-gray-200 rounded mb-1" />
                <div className="w-3/4 h-2 bg-gray-200 rounded mb-1" />
                <div className="w-full h-2 bg-gray-200 rounded mb-1" />
                <div className="w-1/2 h-2 bg-gray-200 rounded mb-2" />
                <div className="text-[6px] text-gray-400 text-center truncate">
                  {currentFile || 'resume.pdf'}
                </div>
              </motion.div>

              {/* Scan line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-emerald-400"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ filter: 'blur(1px)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Writing pad when noting */}
        <AnimatePresence>
          {phase === 'noting' && (
            <motion.div
              className="absolute -left-20 top-10"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg p-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-full h-1 bg-blue-400/50 rounded mb-1"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: i * 0.3, duration: 0.5 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Findings bubbles */}
      <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-md">
        <AnimatePresence>
          {findings.map((finding, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${
                finding.type === 'skill' ? 'bg-emerald-500/80 text-white' :
                finding.type === 'gap' ? 'bg-amber-500/80 text-white' :
                'bg-red-500/80 text-white'
              }`}
            >
              {finding.type === 'skill' && <Check className="w-3 h-3" />}
              {finding.type === 'gap' && <Search className="w-3 h-3" />}
              {finding.type === 'flag' && <X className="w-3 h-3" />}
              {finding.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Status message */}
      <motion.p
        className="mt-6 text-white/70 text-lg"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {phase === 'focusing' && 'R-Bot putting on focus goggles...'}
        {phase === 'scanning' && `Scanning ${currentFile || 'resume'}...`}
        {phase === 'noting' && 'Taking detailed notes...'}
        {phase === 'complete' && 'Analysis complete!'}
      </motion.p>
    </div>
  );
}

// ========================================
// ACT 3: THE VERDICT SCENE
// ========================================
interface VerdictSceneProps {
  score: number;
  candidateName: string;
  verdict: 'unicorn' | 'good' | 'maybe' | 'notfit';
}

export function VerdictScene({ score, candidateName, verdict }: VerdictSceneProps) {
  const isUnicorn = verdict === 'unicorn' || score >= 90;
  const isNotFit = verdict === 'notfit' || score < 50;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[350px] overflow-hidden">
      {/* Confetti for unicorn */}
      <AnimatePresence>
        {isUnicorn && (
          <>
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: ['#f59e0b', '#8b5cf6', '#ec4899', '#10b981'][i % 4],
                  left: `${Math.random() * 100}%`,
                }}
                initial={{ y: -20, opacity: 1 }}
                animate={{
                  y: 400,
                  x: (Math.random() - 0.5) * 200,
                  rotate: Math.random() * 720
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Characters */}
      <div className="flex items-end justify-center gap-12">
        {/* HM-Bot with thumbs up for unicorn */}
        {isUnicorn && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <HMBot action="thumbsUp" />
          </motion.div>
        )}

        {/* R-Bot with trophy or being sympathetic */}
        <motion.div className="relative">
          <RBot
            action={isUnicorn ? 'celebrating' : isNotFit ? 'sympathetic' : 'idle'}
            size="large"
          />

          {/* Trophy for unicorn */}
          {isUnicorn && (
            <motion.div
              className="absolute -top-16 left-1/2 -translate-x-1/2"
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <motion.div
                animate={{
                  rotate: [-5, 5, -5],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="relative"
              >
                <Trophy className="w-16 h-16 text-amber-400" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)',
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {/* Paper airplane for not fit */}
          {isNotFit && (
            <motion.div
              className="absolute top-0 right-0"
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{
                x: [0, 100, 200],
                y: [0, -50, 100],
                rotate: [0, 15, 45]
              }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              <svg width="40" height="30" viewBox="0 0 40 30">
                <path
                  d="M0 15 L40 0 L30 15 L40 30 Z"
                  fill="white"
                  opacity="0.8"
                />
                <path
                  d="M0 15 L30 15"
                  stroke="#d1d5db"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>
          )}

          {/* Archive box for not fit */}
          {isNotFit && (
            <motion.div
              className="absolute -right-24 bottom-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="relative">
                <Archive className="w-12 h-12 text-slate-400" />
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-500">
                  Future
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Score card */}
      <motion.div
        className={`mt-8 px-8 py-4 rounded-2xl ${
          isUnicorn ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-lg shadow-amber-500/50' :
          isNotFit ? 'bg-slate-600/50' :
          'bg-gradient-to-r from-violet-500 to-blue-500'
        }`}
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', delay: 0.3 }}
      >
        <div className="text-center">
          <div className={`text-4xl font-bold ${isUnicorn ? 'text-amber-900' : 'text-white'}`}>
            {score}
          </div>
          <div className={`text-sm ${isUnicorn ? 'text-amber-800' : 'text-white/70'}`}>
            {candidateName}
          </div>
        </div>
      </motion.div>

      {/* Verdict message */}
      <motion.p
        className="mt-4 text-lg font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isUnicorn && <span className="text-amber-400">🦄 The Unicorn!</span>}
        {verdict === 'good' && <span className="text-emerald-400">Strong Candidate</span>}
        {verdict === 'maybe' && <span className="text-blue-400">Worth Exploring</span>}
        {isNotFit && <span className="text-slate-400">Saved for Future Opportunities</span>}
      </motion.p>
    </div>
  );
}

// ========================================
// UNIFIED LOADING SCENE
// ========================================
type LoadingPhase =
  | 'handoff-entering' | 'handoff-passing' | 'handoff-extracting'
  | 'warroom-focusing' | 'warroom-scanning' | 'warroom-noting'
  | 'verdict';

interface DigitalCoPilotLoadingProps {
  type: 'job' | 'resume' | 'evaluation';
  message?: string;
  currentFile?: string;
  score?: number;
  candidateName?: string;
}

export function DigitalCoPilotLoading({
  type,
  message,
  currentFile,
  score,
  candidateName
}: DigitalCoPilotLoadingProps) {
  const [phase, setPhase] = useState<LoadingPhase>(
    type === 'job' ? 'handoff-entering' :
    type === 'resume' ? 'warroom-focusing' : 'warroom-scanning'
  );

  useEffect(() => {
    if (type === 'job') {
      const sequence: LoadingPhase[] = ['handoff-entering', 'handoff-passing', 'handoff-extracting'];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % sequence.length;
        setPhase(sequence[i]);
      }, 2000);
      return () => clearInterval(interval);
    } else if (type === 'resume') {
      const sequence: LoadingPhase[] = ['warroom-focusing', 'warroom-scanning', 'warroom-noting'];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % sequence.length;
        setPhase(sequence[i]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [type]);

  if (type === 'job') {
    return (
      <HandOffScene
        phase={
          phase === 'handoff-entering' ? 'entering' :
          phase === 'handoff-passing' ? 'handoff' : 'extraction'
        }
        extractedFields={[
          { label: 'Title', value: 'Loading...' },
          { label: 'Skills', value: '...' }
        ]}
      />
    );
  }

  if (type === 'resume') {
    return (
      <WarRoomScene
        phase={
          phase === 'warroom-focusing' ? 'focusing' :
          phase === 'warroom-scanning' ? 'scanning' : 'noting'
        }
        currentFile={currentFile}
        findings={[]}
      />
    );
  }

  if (type === 'evaluation' && score !== undefined && candidateName) {
    return (
      <VerdictScene
        score={score}
        candidateName={candidateName}
        verdict={score >= 90 ? 'unicorn' : score >= 70 ? 'good' : score >= 50 ? 'maybe' : 'notfit'}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <RBot action="scanning" />
      <p className="mt-4 text-white/70">{message || 'Processing...'}</p>
    </div>
  );
}

// ========================================
// SPONSORSHIP GATE MODAL
// Hard filter after JD upload
// ========================================
interface SponsorshipGateProps {
  isOpen: boolean;
  onSelect: (canSponsor: boolean | null) => void;
  jobTitle?: string;
}

export function SponsorshipGate({ isOpen, onSelect, jobTitle }: SponsorshipGateProps) {
  if (!isOpen) return null;

  const options = [
    {
      value: false,
      label: 'No – US Authorization Required',
      desc: 'Only show candidates who can work without sponsorship',
      icon: ShieldCheck,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500/50',
      iconColor: 'text-emerald-400',
      recommended: true,
    },
    {
      value: true,
      label: 'Yes – We Can Sponsor',
      desc: 'Open to candidates who require visa sponsorship',
      icon: ShieldAlert,
      color: 'amber',
      bgGradient: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/50',
      iconColor: 'text-amber-400',
      recommended: false,
    },
    {
      value: null,
      label: 'No Preference',
      desc: 'Show all candidates regardless of status',
      icon: Shield,
      color: 'violet',
      bgGradient: 'from-violet-500/20 to-violet-600/20',
      borderColor: 'border-violet-500/50',
      iconColor: 'text-violet-400',
      recommended: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
      >
        {/* R-Bot Header */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <RBot action="thinking" size="small" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              One Quick Question! 🛂
            </h2>
            <p className="text-white/60 text-lg">
              Does <span className="text-violet-400 font-medium">{jobTitle || 'this role'}</span> support visa sponsorship?
            </p>
            <p className="text-white/40 text-sm mt-2">
              This helps filter candidates accurately. You can always change this later.
            </p>
          </motion.div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={String(opt.value)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(opt.value)}
                  className={`relative w-full p-5 rounded-2xl text-left transition-all bg-gradient-to-r ${opt.bgGradient} border-2 ${opt.borderColor} hover:shadow-lg group`}
                >
                  {opt.recommended && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 right-4 text-xs bg-emerald-500 text-white px-3 py-0.5 rounded-full font-medium"
                    >
                      Most Common
                    </motion.span>
                  )}
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-white/10 ${opt.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-lg group-hover:text-white/90">
                        {opt.label}
                      </div>
                      <div className="text-white/50 text-sm mt-0.5">
                        {opt.desc}
                      </div>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    >
                      <div className={`p-2 rounded-full bg-white/10 ${opt.iconColor}`}>
                        <Check className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3"
          >
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 text-sm font-medium">Hard Filter Active</p>
              <p className="text-white/50 text-xs mt-1">
                If you select "No – US Authorization Required", candidates requiring sponsorship will be automatically filtered out during evaluation.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
