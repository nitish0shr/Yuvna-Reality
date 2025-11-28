import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * PulseLoader - Animated pulsing dots
 */
export function PulseLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { isDark } = useTheme();
  const sizes = { sm: 8, md: 12, lg: 16 };
  const dotSize = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`rounded-full ${isDark ? 'bg-cyan-400' : 'bg-blue-500'}`}
          style={{ width: dotSize, height: dotSize }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * SpinnerLoader - Circular spinning loader
 */
export function SpinnerLoader({ size = 40 }: { size?: number }) {
  const { isDark } = useTheme();

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg width={size} height={size} viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth="4"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={isDark ? '#22D3EE' : '#3B82F6'}
          strokeWidth="4"
          strokeDasharray="80"
          strokeDashoffset="60"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
}

/**
 * GlowingOrb - Pulsing glow loading indicator
 */
export function GlowingOrb({ size = 60 }: { size?: number }) {
  const { isDark } = useTheme();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            background: isDark
              ? `radial-gradient(circle, rgba(34, 211, 238, ${0.3 - i * 0.1}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(59, 130, 246, ${0.3 - i * 0.1}) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.5 + i * 0.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.4,
          height: size * 0.4,
          top: '50%',
          left: '50%',
          x: '-50%',
          y: '-50%',
          background: isDark
            ? 'linear-gradient(135deg, #22D3EE, #3B82F6)'
            : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          boxShadow: isDark
            ? '0 0 20px rgba(34, 211, 238, 0.5)'
            : '0 0 20px rgba(59, 130, 246, 0.5)',
        }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

/**
 * SkeletonPulse - Skeleton loading placeholder
 */
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full' | '2xl' | '3xl';
  className?: string;
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

export function SkeletonPulse({
  width = '100%',
  height = 20,
  rounded = 'md',
  className = '',
}: SkeletonProps) {
  const { isDark } = useTheme();

  return (
    <motion.div
      className={`
        ${roundedMap[rounded]}
        ${isDark ? 'bg-white/5' : 'bg-black/5'}
        ${className}
      `}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

/**
 * SkeletonCard - Full card skeleton placeholder
 */
export function SkeletonCard() {
  const { isDark } = useTheme();

  return (
    <div
      className={`
        rounded-[2rem] p-6 space-y-4
        ${isDark ? 'bg-white/5' : 'bg-black/5'}
        backdrop-blur-xl border
        ${isDark ? 'border-white/5' : 'border-black/5'}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonPulse width={60} height={60} rounded="full" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse width="60%" height={20} rounded="lg" />
          <SkeletonPulse width="40%" height={14} rounded="lg" />
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2">
        <SkeletonPulse width="100%" height={12} rounded="lg" />
        <SkeletonPulse width="90%" height={12} rounded="lg" />
        <SkeletonPulse width="75%" height={12} rounded="lg" />
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <SkeletonPulse width={80} height={32} rounded="full" />
        <SkeletonPulse width={80} height={32} rounded="full" />
        <SkeletonPulse width={80} height={32} rounded="full" />
      </div>
    </div>
  );
}

/**
 * ProcessingAnimation - Cinematic processing indicator
 */
export function ProcessingAnimation({ message = 'Processing...' }: { message?: string }) {
  const { isDark } = useTheme();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Animated rings */}
      <div className="relative w-24 h-24">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: isDark
                ? `rgba(34, 211, 238, ${0.3 - i * 0.1})`
                : `rgba(59, 130, 246, ${0.3 - i * 0.1})`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1 - i * 0.1, 1.1 - i * 0.1, 1 - i * 0.1],
            }}
            transition={{
              rotate: {
                duration: 3 + i,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        ))}

        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div
            className={`w-8 h-8 rounded-full ${
              isDark
                ? 'bg-gradient-to-br from-cyan-400 to-blue-500'
                : 'bg-gradient-to-br from-blue-400 to-indigo-500'
            }`}
          />
        </motion.div>
      </div>

      {/* Message */}
      <motion.p
        className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-slate-600'}`}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}

/**
 * WaveLoader - Audio wave-style loader
 */
export function WaveLoader({ bars = 5 }: { bars?: number }) {
  const { isDark } = useTheme();

  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${
            isDark ? 'bg-cyan-400' : 'bg-blue-500'
          }`}
          animate={{
            height: ['30%', '100%', '30%'],
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
}

/**
 * ProgressRing - Circular progress indicator
 */
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showPercent?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 4,
  showPercent = true,
}: ProgressRingProps) {
  const { isDark } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? '#22D3EE' : '#3B82F6'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>

      {showPercent && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            key={progress}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      )}
    </div>
  );
}
