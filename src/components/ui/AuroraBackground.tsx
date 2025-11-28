import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Aurora Background - Animated gradient mesh that creates a stunning
 * northern lights effect. This is a premium visual element.
 */
export function AuroraBackground() {
  const { isDark } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          isDark ? 'opacity-100' : 'opacity-40'
        }`}
      >
        {/* Primary aurora blob - Cyan/Blue */}
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
            top: '-20%',
            left: '-10%',
          }}
          animate={{
            x: [0, 100, 50, 0],
            y: [0, 50, 100, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Secondary aurora blob - Pink/Magenta */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(244, 114, 182, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
            filter: 'blur(100px)',
            top: '30%',
            right: '-5%',
          }}
          animate={{
            x: [0, -80, -40, 0],
            y: [0, 80, -30, 0],
            scale: [1, 0.8, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* Tertiary aurora blob - Green/Mint */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(74, 222, 128, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(74, 222, 128, 0.06) 0%, transparent 70%)',
            filter: 'blur(90px)',
            bottom: '-10%',
            left: '30%',
          }}
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.3, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5,
          }}
        />

        {/* Quaternary blob - Purple accent */}
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
            filter: 'blur(70px)',
            top: '50%',
            left: '10%',
          }}
          animate={{
            x: [0, 40, -60, 0],
            y: [0, -40, 60, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8,
          }}
        />
      </div>

      {/* Grid overlay for depth */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? 'opacity-[0.02]' : 'opacity-[0.015]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 0%, rgba(3, 7, 18, 0.4) 100%)'
            : 'radial-gradient(ellipse at center, transparent 0%, rgba(248, 250, 252, 0.6) 100%)',
        }}
      />
    </div>
  );
}
