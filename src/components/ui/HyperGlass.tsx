import { motion } from 'framer-motion';
import { ReactNode, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Noise texture SVG as data URI
const noiseDataUri = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

interface HyperGlassCardProps {
  children: ReactNode;
  className?: string;
  enableTilt?: boolean;
  glowColor?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
}

export function HyperGlassCard({
  children,
  className = '',
  enableTilt = false,
  glowColor,
  intensity = 'medium',
}: HyperGlassCardProps) {
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = (y - centerY) / 20;
    const tiltY = (centerX - x) / 20;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const blurAmount = intensity === 'subtle' ? '20px' : intensity === 'medium' ? '40px' : '60px';
  const opacity = isDark ? (intensity === 'subtle' ? 0.3 : intensity === 'medium' ? 0.4 : 0.5) : (intensity === 'subtle' ? 0.5 : intensity === 'medium' ? 0.6 : 0.7);

  const defaultGlow = isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';
  const activeGlow = glowColor || defaultGlow;

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glass background */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: isDark
            ? `linear-gradient(135deg, rgba(30, 41, 59, ${opacity}) 0%, rgba(15, 23, 42, ${opacity}) 100%)`
            : `linear-gradient(135deg, rgba(255, 255, 255, ${opacity}) 0%, rgba(248, 250, 252, ${opacity}) 100%)`,
          backdropFilter: `blur(${blurAmount})`,
          WebkitBackdropFilter: `blur(${blurAmount})`,
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          backgroundImage: noiseDataUri,
          opacity: 0.08,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Border gradient */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
          background: isDark
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, transparent 50%, rgba(255, 255, 255, 0.4) 100%)',
          backgroundClip: 'padding-box',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'xor',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {/* Glow effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            boxShadow: `0 0 60px ${activeGlow}, inset 0 0 30px ${activeGlow}`,
          }}
        />
      )}

      {/* Spotlight gradient following cursor */}
      {isHovered && enableTilt && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + tilt.y * 2}% ${50 - tilt.x * 2}%, ${activeGlow} 0%, transparent 50%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// Score Ring Component
interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ScoreRing({ score, size = 80, strokeWidth = 6, showLabel = true }: ScoreRingProps) {
  const { isDark } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 90) return isDark ? '#22d3ee' : '#06b6d4'; // Cyan for unicorn
    if (score >= 75) return isDark ? '#34d399' : '#10b981'; // Green for good
    if (score >= 60) return isDark ? '#fbbf24' : '#f59e0b'; // Gold for average
    return isDark ? '#f87171' : '#ef4444'; // Red for low
  };

  const color = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      )}
    </div>
  );
}

// Skill Radar Chart
interface SkillRadarProps {
  skills: { name: string; value: number }[];
  size?: number;
}

export function SkillRadar({ skills, size = 200 }: SkillRadarProps) {
  const { isDark } = useTheme();
  const center = size / 2;
  const maxRadius = size / 2 - 30;
  const levels = 5;

  // Generate polygon points for skill values
  const generatePoints = (values: number[]) => {
    return values.map((value, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const radius = (value / 100) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
  };

  const points = generatePoints(skills.map(s => s.value));
  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Generate grid lines
  const gridLines = [];
  for (let i = 1; i <= levels; i++) {
    const radius = (i / levels) * maxRadius;
    const levelPoints = skills.map((_, j) => {
      const angle = (Math.PI * 2 * j) / skills.length - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
      };
    });
    gridLines.push(levelPoints.map(p => `${p.x},${p.y}`).join(' '));
  }

  // Generate axis lines
  const axisLines = skills.map((_, i) => {
    const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
    return {
      x: center + maxRadius * Math.cos(angle),
      y: center + maxRadius * Math.sin(angle),
    };
  });

  // Label positions
  const labelPositions = skills.map((skill, i) => {
    const angle = (Math.PI * 2 * i) / skills.length - Math.PI / 2;
    const labelRadius = maxRadius + 20;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      name: skill.name,
    };
  });

  const accentColor = isDark ? '#8b5cf6' : '#6366f1';

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid polygons */}
      {gridLines.map((line, i) => (
        <polygon
          key={i}
          points={line}
          fill="none"
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((point, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={point.x}
          y2={point.y}
          stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
          strokeWidth="1"
        />
      ))}

      {/* Data polygon */}
      <motion.polygon
        points={polygonPath}
        fill={`${accentColor}33`}
        stroke={accentColor}
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          transformOrigin: 'center',
          filter: `drop-shadow(0 0 10px ${accentColor})`,
        }}
      />

      {/* Data points */}
      {points.map((point, i) => (
        <motion.circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={accentColor}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
        />
      ))}

      {/* Labels */}
      {labelPositions.map((pos, i) => (
        <text
          key={i}
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={`text-xs ${isDark ? 'fill-slate-400' : 'fill-slate-500'}`}
        >
          {pos.name}
        </text>
      ))}
    </svg>
  );
}

// Confetti Effect for Unicorn candidates
export function UnicornConfetti({ isActive }: { isActive: boolean }) {
  if (!isActive) return null;

  const colors = ['#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#22d3ee'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{
            y: -20,
            opacity: 1,
            rotate: p.rotation,
          }}
          animate={{
            y: '100vh',
            x: (Math.random() - 0.5) * 200,
            rotate: p.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Typing Effect for AI-generated content
interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export function TypingEffect({ text, speed = 30, onComplete, className = '' }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useState(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  });

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

// Neon Glow Text
interface NeonTextProps {
  children: ReactNode;
  color?: 'cyan' | 'pink' | 'violet' | 'emerald' | 'amber';
  className?: string;
}

export function NeonText({ children, color = 'cyan', className = '' }: NeonTextProps) {
  const colors = {
    cyan: { text: '#22d3ee', glow: 'rgba(34, 211, 238, 0.5)' },
    pink: { text: '#f472b6', glow: 'rgba(244, 114, 182, 0.5)' },
    violet: { text: '#a78bfa', glow: 'rgba(167, 139, 250, 0.5)' },
    emerald: { text: '#34d399', glow: 'rgba(52, 211, 153, 0.5)' },
    amber: { text: '#fbbf24', glow: 'rgba(251, 191, 36, 0.5)' },
  };

  const { text, glow } = colors[color];

  return (
    <span
      className={className}
      style={{
        color: text,
        textShadow: `0 0 10px ${glow}, 0 0 20px ${glow}, 0 0 40px ${glow}`,
      }}
    >
      {children}
    </span>
  );
}
