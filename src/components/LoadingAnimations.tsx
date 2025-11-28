import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { RecruiterBot } from './RecruiterBot';

// 15 different loading animations
const animations = [
  // 1. Orbiting Dots
  function OrbitingDots() {
    return (
      <div className="relative w-24 h-24">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-violet-400 to-rose-400"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.15,
            }}
            style={{
              top: '50%',
              left: '50%',
              transformOrigin: '0 -30px',
            }}
          />
        ))}
      </div>
    );
  },

  // 2. Pulsing Rings
  function PulsingRings() {
    return (
      <div className="relative w-24 h-24 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-violet-400/50"
            initial={{ width: 20, height: 20, opacity: 1 }}
            animate={{
              width: [20, 80],
              height: [20, 80],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
        <div className="w-4 h-4 rounded-full bg-violet-500" />
      </div>
    );
  },

  // 3. DNA Helix
  function DNAHelix() {
    return (
      <div className="relative w-16 h-24 flex items-center justify-center">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute flex gap-8"
            style={{ top: `${i * 12}%` }}
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.1,
            }}
          >
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <div className="w-2 h-2 rounded-full bg-rose-400" />
          </motion.div>
        ))}
      </div>
    );
  },

  // 4. Morphing Square
  function MorphingSquare() {
    return (
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-violet-500 to-rose-500"
        animate={{
          borderRadius: ['10%', '50%', '30%', '50%', '10%'],
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  },

  // 5. Bouncing Bars
  function BouncingBars() {
    return (
      <div className="flex items-end gap-1 h-16">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-3 bg-gradient-to-t from-violet-600 to-violet-400 rounded-full"
            animate={{
              height: [16, 48, 16],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  },

  // 6. Spinning Gradient
  function SpinningGradient() {
    return (
      <motion.div
        className="w-20 h-20 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, #8b5cf6, #ec4899, #8b5cf6)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute inset-2 rounded-full bg-slate-900" />
      </motion.div>
    );
  },

  // 7. Floating Particles
  function FloatingParticles() {
    return (
      <div className="relative w-24 h-24">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#8b5cf6' : '#ec4899',
              left: `${20 + (i % 4) * 20}%`,
              top: `${20 + Math.floor(i / 4) * 25}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    );
  },

  // 8. Cube Rotation
  function CubeRotation() {
    return (
      <motion.div
        className="w-16 h-16"
        style={{ perspective: 200 }}
      >
        <motion.div
          className="w-full h-full bg-gradient-to-br from-violet-500 to-rose-500 rounded-lg"
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    );
  },

  // 9. Wave Dots
  function WaveDots() {
    return (
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-violet-400"
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    );
  },

  // 10. Heartbeat
  function Heartbeat() {
    return (
      <motion.div
        className="text-5xl"
        animate={{
          scale: [1, 1.2, 1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          times: [0, 0.1, 0.3, 0.4, 1],
        }}
      >
        💜
      </motion.div>
    );
  },

  // 11. Spinning Arcs
  function SpinningArcs() {
    return (
      <div className="relative w-20 h-20">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: i === 0 ? '#8b5cf6' : i === 1 ? '#ec4899' : '#fbbf24',
              borderRightColor: i === 0 ? '#8b5cf6' : i === 1 ? '#ec4899' : '#fbbf24',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5 - i * 0.3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    );
  },

  // 12. Glowing Orb
  function GlowingOrb() {
    return (
      <motion.div
        className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-rose-500"
        animate={{
          boxShadow: [
            '0 0 20px rgba(139, 92, 246, 0.5)',
            '0 0 60px rgba(139, 92, 246, 0.8)',
            '0 0 20px rgba(139, 92, 246, 0.5)',
          ],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  },

  // 13. Flip Cards
  function FlipCards() {
    return (
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-8 h-12 bg-gradient-to-br from-violet-500 to-rose-500 rounded"
            animate={{
              rotateY: [0, 180, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    );
  },

  // 14. Atomic Orbit
  function AtomicOrbit() {
    return (
      <div className="relative w-24 h-24">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-violet-500" />
        {[0, 60, 120].map((angle) => (
          <motion.div
            key={angle}
            className="absolute inset-0"
            style={{ transform: `rotate(${angle}deg)` }}
          >
            <motion.div
              className="absolute w-2 h-2 rounded-full bg-rose-400"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 -35px',
              }}
            />
          </motion.div>
        ))}
      </div>
    );
  },

  // 15. Text Shimmer
  function TextShimmer() {
    return (
      <motion.div
        className="text-2xl font-bold bg-gradient-to-r from-violet-400 via-rose-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_100%]"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        Processing...
      </motion.div>
    );
  },
];

const loadingMessages = [
  'Analyzing document...',
  'Extracting content...',
  'Processing file...',
  'Reading data...',
  'Almost there...',
  'Working magic...',
  'Parsing content...',
  'Understanding resume...',
  'Scanning document...',
  'Preparing data...',
];

export function RandomLoadingAnimation({ message }: { message?: string }) {
  const AnimationComponent = useMemo(() => {
    const index = Math.floor(Math.random() * animations.length);
    return animations[index];
  }, []);

  const displayMessage = useMemo(() => {
    if (message) return message;
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center gap-6"
    >
      <AnimationComponent />
      <motion.p
        className="text-white/70 text-lg font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {displayMessage}
      </motion.p>
    </motion.div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl"
      >
        <RandomLoadingAnimation message={message} />
      </motion.div>
    </motion.div>
  );
}

// Recruiter Bot Loading Animation with phase progression
type BotPhase = 'idle' | 'receiving' | 'reading' | 'analyzing' | 'writing' | 'complete';

const phaseMessages: Record<BotPhase, string> = {
  idle: 'Getting ready...',
  receiving: 'Receiving documents from hiring manager...',
  reading: 'Reading through the resume...',
  analyzing: 'Analyzing candidate fit...',
  writing: 'Writing screening notes...',
  complete: 'Analysis complete!',
};

export function RecruiterBotLoading({
  message,
  autoProgress = true,
  initialPhase = 'receiving' as BotPhase,
}: {
  message?: string;
  autoProgress?: boolean;
  initialPhase?: BotPhase;
}) {
  const [phase, setPhase] = useState<BotPhase>(initialPhase);

  useEffect(() => {
    if (!autoProgress) return;

    const phases: BotPhase[] = ['receiving', 'reading', 'analyzing', 'writing'];
    let currentIndex = phases.indexOf(initialPhase);
    if (currentIndex === -1) currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setPhase(phases[currentIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, [autoProgress, initialPhase]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center"
    >
      <RecruiterBot phase={phase} message={message || phaseMessages[phase]} />
    </motion.div>
  );
}
