import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedTextProps {
  children: string;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: -90 },
  visible: { opacity: 1, y: 0, rotateX: 0 },
};

/**
 * AnimatedText - Character-by-character text reveal animation
 */
export function AnimatedText({
  children,
  className = '',
  delay = 0,
  staggerChildren = 0.03,
  as: Component = 'span',
}: AnimatedTextProps) {
  const letters = children.split('');

  return (
    <Component className={`inline-block ${className}`}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.4,
            delay: delay + i * staggerChildren,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="inline-block"
          style={{ whiteSpace: letter === ' ' ? 'pre' : 'normal' }}
        >
          {letter}
        </motion.span>
      ))}
    </Component>
  );
}

/**
 * AnimatedWords - Word-by-word text reveal with 3D rotation
 */
export function AnimatedWords({
  children,
  className = '',
  delay = 0,
  staggerChildren = 0.1,
  as: Component = 'span',
}: AnimatedTextProps) {
  const words = children.split(' ');

  return (
    <Component className={`inline-block ${className}`} style={{ perspective: 1000 }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          transition={{
            duration: 0.6,
            delay: delay + i * staggerChildren,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="inline-block mr-2"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {word}
        </motion.span>
      ))}
    </Component>
  );
}

/**
 * GradientText - Animated gradient text effect
 */
interface GradientTextProps {
  children: ReactNode;
  className?: string;
  gradient?: 'aurora' | 'sunset' | 'ocean' | 'neon' | 'fire';
  animate?: boolean;
}

const gradients = {
  aurora: 'from-cyan-400 via-blue-500 to-purple-600',
  sunset: 'from-orange-400 via-pink-500 to-purple-600',
  ocean: 'from-cyan-400 via-teal-500 to-emerald-500',
  neon: 'from-pink-500 via-purple-500 to-cyan-500',
  fire: 'from-yellow-400 via-orange-500 to-red-500',
};

export function GradientText({
  children,
  className = '',
  gradient = 'aurora',
  animate = true,
}: GradientTextProps) {
  return (
    <span
      className={`
        bg-gradient-to-r ${gradients[gradient]}
        bg-clip-text text-transparent
        ${animate ? 'bg-[length:200%_auto] animate-gradient' : ''}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

/**
 * TypewriterText - Typewriter effect for text
 */
interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
}

export function TypewriterText({
  text,
  className = '',
  speed = 50,
  delay = 0,
  cursor = true,
}: TypewriterTextProps) {
  return (
    <motion.span className={`inline-block ${className}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.01,
            delay: delay + (i * speed) / 1000,
          }}
        >
          {char}
        </motion.span>
      ))}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </motion.span>
  );
}

/**
 * CountUp - Animated number counter
 */
interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  end,
  duration = 2,
  delay = 0,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay, duration }}
      >
        {end}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

/**
 * SplitReveal - Split text reveal animation
 */
interface SplitRevealProps {
  children: string;
  className?: string;
  delay?: number;
}

export function SplitReveal({ children, className = '', delay = 0 }: SplitRevealProps) {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`}>
      <motion.span
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.8,
          delay,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}
