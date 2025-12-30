import React from 'react';
import { Trash2, Lock, Hexagon } from 'lucide-react'; // Ensure lucide-react is installed
import { useStore } from '../../store/useStore';

interface HeaderProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, setCurrentStep }) => {
    const resetAll = useStore((state) => state.resetAll);

    const handleReset = () => {
        if (confirm("⚠️ Are you sure? This will wipe all candidates and strategy data.")) {
            resetAll();
            setCurrentStep(1);
        }
    };

    const steps = [
        { id: 1, label: "Role Intake" },
        { id: 2, label: "Build Strategy" },
        { id: 3, label: "Find Candidates" },
        { id: 4, label: "Evaluate & Score" }
    ];

    return (
        <header className="h-16 border-b border-white/5 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Brand */}
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-lotus-cyan/20 flex items-center justify-center text-lotus-cyan">
                    <Hexagon size={20} fill="currentColor" className="opacity-20" />
                    <span className="absolute font-bold text-xs">L</span>
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-wide text-white">PROJECT LOTUS</h1>
                    <p className="text-[10px] text-lotus-cyan font-mono tracking-widest uppercase">Mission Control</p>
                </div>
            </div>

            {/* Stepper Navigation */}
            <nav className="flex items-center gap-8">
                {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const isLocked = !isCompleted && !isActive && step.id !== 1; // Simplified locking logic

                    return (
                        <button
                            key={step.id}
                            onClick={() => !isLocked && setCurrentStep(step.id)}
                            disabled={isLocked}
                            className={`
                text-xs font-medium flex items-center gap-2 transition-all duration-300
                ${isActive ? 'text-lotus-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}
                ${isCompleted ? 'text-gray-300 hover:text-white' : ''}
                ${isLocked ? 'text-gray-600 cursor-not-allowed' : ''}
              `}
                        >
                            <span className={`
                w-5 h-5 rounded-full flex items-center justify-center text-[10px] border
                ${isActive ? 'border-lotus-cyan bg-lotus-cyan/10' : 'border-gray-700 bg-gray-800'}
              `}>
                                {step.id}
                            </span>
                            {step.label}
                            {isLocked && <Lock size={10} className="opacity-50" />}
                        </button>
                    );
                })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-gray-300">Claude 3.5 Sonnet</span>
                </div>

                <button
                    onClick={handleReset}
                    className="text-gray-500 hover:text-lotus-red transition-colors p-2 rounded-md hover:bg-white/5"
                    title="Reset Workspace"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </header>
    );
};
