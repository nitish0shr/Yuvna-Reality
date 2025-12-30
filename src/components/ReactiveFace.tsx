import { motion } from "framer-motion";

interface ReactiveFaceProps {
  score: number; // 0 to 100
  size?: number; // Size in pixels (default 64)
  showLabel?: boolean; // Show the status text below
}

export const ReactiveFace = ({ score, size = 64, showLabel = true }: ReactiveFaceProps) => {
  // 1. Determine the "Mood"
  const getMood = (s: number) => {
    if (s >= 85) return {
      emoji: "🤩",
      color: "from-green-400 to-emerald-600",
      label: "Shortlisted!",
      animation: { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
    };
    if (s >= 50) return {
      emoji: "🤔",
      color: "from-amber-400 to-orange-500",
      label: "Maybe?",
      animation: { y: [0, -5, 0] }
    };
    return {
      emoji: "🫠",
      color: "from-red-400 to-rose-600",
      label: "Not a fit",
      animation: { rotate: [0, -10, 0] } // Drooping
    };
  };

  const mood = getMood(score);

  // Calculate sizes based on the main size prop
  const isCompact = size < 48;
  const emojiSize = isCompact ? 'text-xl' : size < 56 ? 'text-2xl' : 'text-4xl';
  const badgeSize = isCompact ? 'w-4 h-4 text-[8px]' : 'w-6 h-6 text-xs';
  const borderRadius = isCompact ? 'rounded-lg' : 'rounded-2xl';
  const innerRadius = isCompact ? 'rounded-[6px]' : 'rounded-[14px]';

  return (
    <div className={`flex flex-col items-center ${showLabel ? 'gap-1' : ''}`}>
      {/* The Glowing Avatar Container */}
      <div
        className={`relative ${borderRadius} bg-gradient-to-br ${mood.color} p-0.5 shadow-xl`}
        style={{ width: size, height: size }}
      >
        <div className={`w-full h-full bg-slate-900/90 ${innerRadius} flex items-center justify-center backdrop-blur-sm`}>
          <motion.div
            key={mood.emoji} // Triggers animation when emoji changes
            animate={mood.animation}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className={`${emojiSize} filter drop-shadow-lg`}
          >
            {mood.emoji}
          </motion.div>
        </div>

        {/* The "Score Badge" */}
        <div className={`absolute -bottom-1 -right-1 bg-white text-slate-900 font-bold ${badgeSize} rounded-full flex items-center justify-center border-2 border-slate-900`}>
          {score}
        </div>
      </div>

      {/* The Status Text - only shown if showLabel is true */}
      {showLabel && (
        <span className={`text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${mood.color} bg-clip-text text-transparent`}>
          {mood.label}
        </span>
      )}
    </div>
  );
};
