import { ReactNode, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'glow' | 'neon';
  hoverEffect?: boolean;
  glowColor?: 'cyan' | 'pink' | 'mint' | 'orange' | 'blue' | 'purple';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'light' | 'medium' | 'heavy';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

const blurMap = {
  light: 'backdrop-blur-md',
  medium: 'backdrop-blur-xl',
  heavy: 'backdrop-blur-[40px]',
};

const glowColors = {
  cyan: 'rgba(34, 211, 238, 0.3)',
  pink: 'rgba(244, 114, 182, 0.3)',
  mint: 'rgba(74, 222, 128, 0.3)',
  orange: 'rgba(249, 115, 22, 0.3)',
  blue: 'rgba(59, 130, 246, 0.3)',
  purple: 'rgba(139, 92, 246, 0.3)',
};

/**
 * GlassCard - Premium glassmorphism card component
 * The foundation of all card-based UI in the application.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = 'default',
      hoverEffect = true,
      glowColor = 'cyan',
      padding = 'lg',
      blur = 'heavy',
      className = '',
      ...props
    },
    ref
  ) => {
    const { isDark } = useTheme();

    const getVariantStyles = () => {
      switch (variant) {
        case 'elevated':
          return isDark
            ? 'bg-gray-900/60 border-white/10 shadow-2xl'
            : 'bg-white/80 border-black/5 shadow-xl';
        case 'subtle':
          return isDark
            ? 'bg-gray-900/20 border-white/5'
            : 'bg-white/40 border-black/5';
        case 'glow':
          return isDark
            ? `bg-gray-900/40 border-white/10 shadow-[0_0_30px_${glowColors[glowColor]}]`
            : `bg-white/60 border-black/5 shadow-[0_20px_50px_-12px_${glowColors[glowColor]}]`;
        case 'neon':
          return isDark
            ? 'bg-gray-900/50 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2),inset_0_0_20px_rgba(34,211,238,0.05)]'
            : 'bg-white/70 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]';
        default:
          return isDark
            ? 'bg-gray-900/40 border-white/8'
            : 'bg-white/60 border-black/6';
      }
    };

    const hoverStyles = hoverEffect
      ? 'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl'
      : '';

    return (
      <motion.div
        ref={ref}
        className={`
          relative rounded-[2rem] border
          ${blurMap[blur]}
          ${getVariantStyles()}
          ${paddingMap[padding]}
          ${hoverStyles}
          transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          ${className}
        `}
        {...props}
      >
        {/* Inner gradient overlay for depth */}
        <div
          className={`absolute inset-0 rounded-[2rem] pointer-events-none ${
            isDark
              ? 'bg-gradient-to-br from-white/[0.03] to-transparent'
              : 'bg-gradient-to-br from-white/50 to-transparent'
          }`}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

/**
 * GlassButton - Premium glass-styled button
 */
interface GlassButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

const buttonSizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-base',
  lg: 'px-8 py-3 text-lg',
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ children, variant = 'primary', size = 'md', glow = false, className = '', ...props }, ref) => {
    const { isDark } = useTheme();

    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return isDark
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400';
        case 'secondary':
          return isDark
            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
            : 'bg-black/5 text-slate-900 hover:bg-black/10 border border-black/10';
        case 'ghost':
          return isDark
            ? 'bg-transparent text-white hover:bg-white/10'
            : 'bg-transparent text-slate-900 hover:bg-black/5';
        case 'danger':
          return 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-400 hover:to-rose-400';
        default:
          return '';
      }
    };

    const glowStyle = glow
      ? isDark
        ? 'shadow-[0_0_20px_rgba(34,211,238,0.3)]'
        : 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.4)]'
      : '';

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative rounded-xl font-medium
          ${buttonSizes[size]}
          ${getVariantStyles()}
          ${glowStyle}
          transition-all duration-300
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

/**
 * GlassInput - Premium glass-styled input
 */
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const { isDark } = useTheme();

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={`text-sm font-medium ${
              isDark ? 'text-white/70' : 'text-slate-700'
            }`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl
            backdrop-blur-xl
            ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-white/30'
                : 'bg-black/5 border-black/10 text-slate-900 placeholder:text-slate-400'
            }
            border
            focus:outline-none focus:ring-2
            ${
              error
                ? 'focus:ring-red-500/50 border-red-500/50'
                : isDark
                ? 'focus:ring-cyan-500/50 focus:border-cyan-500/50'
                : 'focus:ring-blue-500/50 focus:border-blue-500/50'
            }
            transition-all duration-300
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
