import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export const WarRoomScene = () => {
  // Simulate the AI processing different candidates
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'match' | 'reject'>('scanning');

  // Cycle through the "Story" loop
  useEffect(() => {
    const scanCycle = async () => {
      setScanStatus('scanning');
      // 1. Scan for 2 seconds
      await new Promise(r => setTimeout(r, 2000));
      
      // 2. Random verdict (Match or Reject)
      const verdict = Math.random() > 0.4 ? 'match' : 'reject';
      setScanStatus(verdict);
      
      // 3. Move to next card after short pause
      await new Promise(r => setTimeout(r, 1000));
      setActiveCardIndex(prev => (prev + 1) % 3); // Loop through 3 cards
    };

    scanCycle();
  }, [activeCardIndex]);

  return (
    <div className="w-full h-[400px] relative overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center">
      
      {/* === BACKGROUND GRID (Tactical Map Look) === */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* === CENTRAL AI BRAIN === */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          animate={{ boxShadow: ["0 0 20px #8b5cf6", "0 0 50px #8b5cf6", "0 0 20px #8b5cf6"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-slate-900 border-2 border-purple-500 flex items-center justify-center relative"
        >
          <Bot size={48} className="text-purple-400" />
          {/* Rotating Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-purple-500 rounded-full w-full h-full scale-125 opacity-50"
          />
        </motion.div>
        
        {/* Connection Lines to Cards */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none z-0">
           <line x1="300" y1="150" x2="100" y2="150" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
           <line x1="300" y1="150" x2="500" y2="150" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
           <line x1="300" y1="150" x2="300" y2="280" stroke="#475569" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      {/* === THE CARDS (Candidates) === */}
      {/* Position 1: Left */}
      <CandidateCard 
        position="left" 
        isActive={activeCardIndex === 0} 
        status={activeCardIndex === 0 ? scanStatus : 'waiting'} 
      />
      
      {/* Position 2: Right */}
      <CandidateCard 
        position="right" 
        isActive={activeCardIndex === 1} 
        status={activeCardIndex === 1 ? scanStatus : 'waiting'} 
      />

      {/* Position 3: Bottom */}
      <CandidateCard 
        position="bottom" 
        isActive={activeCardIndex === 2} 
        status={activeCardIndex === 2 ? scanStatus : 'waiting'} 
      />

    </div>
  );
};

// --- SUB-COMPONENT: THE RESUME CARD ---
const CandidateCard = ({ position, isActive, status }: { position: string, isActive: boolean, status: string }) => {
  // Positioning logic
  const posClasses = {
    left: "left-10 top-1/2 -translate-y-1/2",
    right: "right-10 top-1/2 -translate-y-1/2",
    bottom: "bottom-10 left-1/2 -translate-x-1/2"
  };

  return (
    <motion.div
      // Floating animation
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute ${posClasses[position as keyof typeof posClasses]} w-48 h-64 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${isActive ? 'scale-110 border-blue-500 z-20' : 'scale-90 opacity-60'}`}
    >
      {/* Header */}
      <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-3 gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500"/>
        <div className="w-2 h-2 rounded-full bg-yellow-500"/>
        <div className="w-2 h-2 rounded-full bg-green-500"/>
      </div>

      {/* Body (Resume Text Effect) */}
      <div className="p-4 space-y-2 relative h-full">
        <div className="w-3/4 h-3 bg-slate-700 rounded animate-pulse"/>
        <div className="w-1/2 h-3 bg-slate-700 rounded animate-pulse"/>
        <div className="w-full h-2 bg-slate-800 rounded mt-4"/>
        <div className="w-full h-2 bg-slate-800 rounded"/>
        <div className="w-5/6 h-2 bg-slate-800 rounded"/>
        
        {/* === THE LASER SCANNER === */}
        {isActive && status === 'scanning' && (
          <motion.div
            initial={{ top: "0%" }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-10 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/50 border-b-2 border-blue-400 blur-sm pointer-events-none"
          />
        )}

        {/* === THE VERDICT OVERLAY === */}
        <AnimatePresence>
          {status === 'match' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-green-500/20 flex flex-col items-center justify-center backdrop-blur-sm">
              <CheckCircle className="text-green-400 w-12 h-12 mb-2" />
              <span className="font-bold text-green-100">MATCH</span>
            </motion.div>
          )}
          {status === 'reject' && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center backdrop-blur-sm">
              <XCircle className="text-red-400 w-12 h-12 mb-2" />
              <span className="font-bold text-red-100">PASS</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
