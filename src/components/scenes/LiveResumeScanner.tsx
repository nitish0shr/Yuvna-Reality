import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// The "Story" Sequence
const critiqueSequence = [
  { time: 1000, type: 'good', text: "Strong Tenure at Big Tech", icon: CheckCircle2, color: "emerald" },
  { time: 2500, type: 'warning', text: "Gap in employment (2023)", icon: AlertTriangle, color: "amber" },
  { time: 4000, type: 'good', text: "Perfect Skill Match (React)", icon: CheckCircle2, color: "emerald" },
  { time: 5500, type: 'bad', text: "Missing Citizenship Status", icon: XCircle, color: "rose" },
];

interface ReactionBeat {
  time: number;
  type: string;
  text: string;
  icon: typeof CheckCircle2;
  color: string;
}

export const LiveResumeScanner = () => {
  const [activeReaction, setActiveReaction] = useState<ReactionBeat | null>(null);

  useEffect(() => {
    // 1. Clear any existing state
    setActiveReaction(null);

    // 2. Schedule the story beats
    const timers: ReturnType<typeof setTimeout>[] = [];

    const runSequence = () => {
      critiqueSequence.forEach((beat) => {
        const t1 = setTimeout(() => setActiveReaction(beat), beat.time);
        const t2 = setTimeout(() => setActiveReaction(null), beat.time + 1200);
        timers.push(t1, t2);
      });
    };

    runSequence();
    const loop = setInterval(runSequence, 7000); // Loop every 7 seconds

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto h-[380px] relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col items-center">

      {/* === HEADER === */}
      <div className="w-full h-12 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-700" />
          <div className="w-3 h-3 rounded-full bg-slate-700" />
        </div>
        <div className="text-[10px] font-mono text-cyan-500 animate-pulse">ANALYZING...</div>
      </div>

      {/* === ABSTRACT RESUME (Background) === */}
      <div className="w-full flex-1 p-6 space-y-4 opacity-30 blur-[2px] relative z-0 scale-90 origin-top">
        <div className="flex gap-4 mb-8">
          <div className="w-16 h-16 bg-slate-600 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-slate-600 rounded" />
            <div className="h-3 w-1/2 bg-slate-700 rounded" />
          </div>
        </div>
        <div className="h-2 w-full bg-slate-700 rounded" />
        <div className="h-2 w-full bg-slate-700 rounded" />
        <div className="h-2 w-5/6 bg-slate-700 rounded" />
        <div className="h-32 w-full bg-slate-800 rounded mt-4" />
      </div>

      {/* === LASER SCANNER === */}
      <motion.div
        animate={{ top: ["10%", "90%"] }}
        transition={{ duration: 3.5, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10 opacity-70"
      />

      {/* === STORY POPUPS (The Reaction) === */}
      <AnimatePresence>
        {activeReaction && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="absolute top-1/2 left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none"
          >
            {/* Icon Bubble */}
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-white/10 mb-3
              ${activeReaction.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-500/40' : ''}
              ${activeReaction.color === 'amber' ? 'bg-amber-500 shadow-amber-500/40' : ''}
              ${activeReaction.color === 'rose' ? 'bg-rose-600 shadow-rose-600/40' : ''}
            `}>
              <activeReaction.icon size={28} className="text-white" />
            </div>

            {/* Text Label */}
            <div className="px-4 py-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-xl shadow-xl">
              <span className={`text-xs font-bold
                ${activeReaction.color === 'emerald' ? 'text-emerald-400' : ''}
                ${activeReaction.color === 'amber' ? 'text-amber-400' : ''}
                ${activeReaction.color === 'rose' ? 'text-rose-400' : ''}
              `}>
                {activeReaction.text}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
