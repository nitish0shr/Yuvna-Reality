import { motion } from "framer-motion";
import { User, Bot, Zap } from "lucide-react";

export const IntakeStory = () => {
  // Animation sequences
  const walkInLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "backOut" } }
  };
  const walkInRight = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "backOut", delay: 2.5 } }
  };
  const popUp = {
    hidden: { scale: 0, opacity: 0, y: 10 },
    visible: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } }
  };

  return (
    <div className="w-full h-72 relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center px-4 md:px-20 mb-8 shadow-2xl">
      {/* === BACKGROUND: CYBER GRID === */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      {/* === ACTOR 1: THE HIRING MANAGER (Left) === */}
      <motion.div
        variants={walkInLeft} initial="hidden" animate="visible"
        className="relative flex flex-col items-center mr-8 md:mr-16 z-10"
      >
        {/* Dialogue Bubble */}
        <motion.div
          variants={popUp} initial="hidden" animate="visible" transition={{ delay: 1 }}
          className="absolute -top-20 left-0 w-48 bg-cyan-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-100 text-xs font-medium p-3 rounded-2xl rounded-bl-none shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          "I need a React expert with 5 years experience. It's urgent."
        </motion.div>

        {/* Avatar Orb */}
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
          <User size={32} className="text-cyan-400 relative z-10" />
        </div>
        <div className="mt-3 text-xs font-bold tracking-widest text-cyan-600 uppercase">Hiring Manager</div>
      </motion.div>

      {/* === THE CLIMAX: PROTOCOL ACTIVATION (Center) === */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 4, type: "spring", bounce: 0.5 }}
        className="absolute z-0 flex flex-col items-center justify-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full animate-pulse" />
          <Zap size={48} className="text-yellow-400 relative z-10" />
        </div>
        <span className="mt-2 text-[10px] font-bold text-yellow-500 uppercase tracking-[0.2em] bg-slate-900/80 px-2 py-1 rounded">
          Sync Established
        </span>
      </motion.div>

      {/* === ACTOR 2: THE RECRUITER AGENT (Right) === */}
      <motion.div
        variants={walkInRight} initial="hidden" animate="visible"
        className="relative flex flex-col items-center ml-8 md:ml-16 z-10"
      >
        {/* Dialogue Bubble */}
        <motion.div
          variants={popUp} initial="hidden" animate="visible" transition={{ delay: 3.5 }}
          className="absolute -top-20 right-0 w-48 bg-purple-900/80 backdrop-blur-md border border-purple-500/30 text-purple-100 text-xs font-medium p-3 rounded-2xl rounded-br-none shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          "Understood. Initiating Deep Search Protocol across all channels."
        </motion.div>

        {/* Avatar Orb */}
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] relative">
          <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
          <Bot size={32} className="text-purple-400 relative z-10" />
        </div>
        <div className="mt-3 text-xs font-bold tracking-widest text-purple-600 uppercase">AI Agent</div>
      </motion.div>
    </div>
  );
};
