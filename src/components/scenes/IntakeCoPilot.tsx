import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Sparkles } from "lucide-react";

// Pass the name of the input field currently focused (e.g. "title", "skills", "salary")
interface IntakeCoPilotProps {
  focusedField: string | null;
}

const tips: Record<string, string> = {
  title: "AI Tip: Standard titles (e.g., 'Senior Engineer' vs 'Code Ninja') get 3x more matches.",
  skills: "AI Tip: Adding 'Must-Have' skills forces the AI to filter strictly. 'Nice-to-haves' are flexible.",
  experience: "AI Tip: Don't just ask for years. Ask for 'Scale' (e.g., managed $1M budget).",
  salary: "AI Tip: Candidates are 60% more likely to apply if a salary range is visible.",
  location: "AI Tip: Opening to 'Remote' expands your talent pool by 400% on average."
};

export const IntakeCoPilot = ({ focusedField }: IntakeCoPilotProps) => {
  const currentTip = focusedField ? tips[focusedField] : null;

  return (
    <div className="fixed right-6 top-1/3 z-50 pointer-events-none w-72 hidden xl:block">
      <AnimatePresence mode="wait">
        {currentTip && (
          <motion.div
            key={focusedField}
            initial={{ x: 50, opacity: 0, scale: 0.9 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative"
          >
            {/* The Floating Orb */}
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.6)] z-20">
              <Lightbulb className="text-amber-950 w-5 h-5" />
            </div>

            {/* The Tip Card */}
            <div className="glass-panel p-5 pt-6 rounded-2xl border border-amber-500/30 bg-slate-900/90 backdrop-blur-xl shadow-2xl relative z-10">
              <Sparkles className="text-amber-400 w-3 h-3 absolute top-3 right-3 opacity-70 animate-pulse" />
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                Optimization Tip
              </div>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                {currentTip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
