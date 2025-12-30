import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, Sparkles, Target, Building, User, Briefcase, Search, List } from 'lucide-react';

interface IntakeData {
    roleName: string;
    companyName: string;
    hiringManager: string;
    mustHaves: string;
    niceToHaves: string;
    dealBreakers: string;
}

interface IntakeFormProps {
    initialData?: Partial<IntakeData>;
    onComplete: (data: IntakeData) => void;
}

export default function IntakeForm({ initialData, onComplete }: IntakeFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<IntakeData>({
        roleName: initialData?.roleName || '',
        companyName: initialData?.companyName || '',
        hiringManager: initialData?.hiringManager || '',
        mustHaves: initialData?.mustHaves || '',
        niceToHaves: initialData?.niceToHaves || '',
        dealBreakers: initialData?.dealBreakers || ''
    });

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const handleComplete = () => {
        // Add a small delay for the animation
        setTimeout(() => {
            onComplete(formData);
        }, 500);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 font-sans text-slate-300 min-h-[600px] flex flex-col">
            <div className="w-full max-w-4xl">

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex justify-between mb-4 px-2">
                        {['Basics', 'Criteria', 'Strategy'].map((label, index) => {
                            const stepNum = index + 1;
                            const isActive = step >= stepNum;
                            const isCurrent = step === stepNum;

                            return (
                                <div key={label} className="flex flex-col items-center relative z-10">
                                    <div
                                        className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500
                      ${isActive
                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                                                : 'bg-slate-900 border-slate-700 text-slate-500'
                                            }
                    `}
                                    >
                                        {isActive ? <CheckCircle className="w-5 h-5" /> : stepNum}
                                    </div>
                                    <span className={`mt-2 text-xs font-medium tracking-wider uppercase transition-colors duration-300 ${isCurrent ? 'text-indigo-400' : 'text-slate-600'}`}>
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progress Line */}
                    <div className="relative h-1 bg-slate-800 rounded-full -mt-14 mx-4 z-0">
                        <motion.div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* Main Glass Card */}
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-black/50 overflow-hidden min-h-[500px] flex flex-col">

                    {/* Header */}
                    <div className="mb-8 flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                            {step === 1 && <Briefcase className="w-6 h-6" />}
                            {step === 2 && <List className="w-6 h-6" />}
                            {step === 3 && <Sparkles className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">
                                {step === 1 && "Role Definitions"}
                                {step === 2 && "Search Criteria"}
                                {step === 3 && "Sourcing Strategy"}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {step === 1 && "Let's establish the core identity of the position."}
                                {step === 2 && "Define the technical and cultural requirements."}
                                {step === 3 && "AI-generated targeting parameters based on your inputs."}
                            </p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 relative">
                        <AnimatePresence mode="wait" custom={step}>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    custom={step}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Role Name</label>
                                            <div className="relative group">
                                                <Briefcase className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={formData.roleName}
                                                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                                    placeholder="e.g. Senior Frontend Engineer"
                                                    className="w-full bg-slate-800/50 border-b border-white/10 rounded-t-lg px-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Company Name</label>
                                            <div className="relative group">
                                                <Building className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={formData.companyName}
                                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                                    placeholder="e.g. Acme Corp"
                                                    className="w-full bg-slate-800/50 border-b border-white/10 rounded-t-lg px-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Hiring Manager</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="text"
                                                value={formData.hiringManager}
                                                onChange={(e) => setFormData({ ...formData, hiringManager: e.target.value })}
                                                placeholder="e.g. Sarah Connor"
                                                className="w-full bg-slate-800/50 border-b border-white/10 rounded-t-lg px-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:bg-slate-800/80 transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    custom={step}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Must Haves</label>
                                        <textarea
                                            value={formData.mustHaves}
                                            onChange={(e) => setFormData({ ...formData, mustHaves: e.target.value })}
                                            placeholder="List critical skills (e.g. React, Node.js, AWS)..."
                                            className="w-full h-24 bg-slate-800/50 border-b border-white/10 rounded-t-lg p-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:bg-slate-800/80 transition-all resize-none"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-purple-400 uppercase tracking-wider">Nice to Haves</label>
                                        <textarea
                                            value={formData.niceToHaves}
                                            onChange={(e) => setFormData({ ...formData, niceToHaves: e.target.value })}
                                            placeholder="Bonus skills (e.g. GraphQL, Docker)..."
                                            className="w-full h-20 bg-slate-800/50 border-b border-white/10 rounded-t-lg p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:bg-slate-800/80 transition-all resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-red-400 uppercase tracking-wider">Deal Breakers</label>
                                        <input
                                            type="text"
                                            value={formData.dealBreakers}
                                            onChange={(e) => setFormData({ ...formData, dealBreakers: e.target.value })}
                                            placeholder="e.g. No remote work, requires sponsorship..."
                                            className="w-full bg-slate-800/50 border-b border-white/10 rounded-t-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-red-500 focus:bg-slate-800/80 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    custom={step}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Search className="w-5 h-5 text-indigo-400" />
                                            <h3 className="text-lg font-bold text-white">Generated Sourcing Strategy</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Boolean String</label>
                                                <div className="mt-1 p-3 bg-slate-900/50 rounded-lg border border-white/5 font-mono text-xs text-indigo-300 break-all">
                                                    (React OR "React.js") AND (Node OR "Node.js") AND AWS AND "System Design" AND NOT "Junior"
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Companies</label>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {['Airbnb', 'Stripe', 'Uber', 'Netflix', 'Coinbase'].map(company => (
                                                        <span key={company} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-white/10">
                                                            {company}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keywords</label>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {['Full Stack', 'Cloud Native', 'Microservices', 'Scalability'].map(kw => (
                                                        <span key={kw} className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/30">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer / Navigation */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`
                flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium transition-all
                ${step === 1
                                    ? 'opacity-0 cursor-default'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }
              `}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>

                        <button
                            onClick={handleNext}
                            className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative flex items-center gap-2">
                                {step === totalSteps ? 'Launch Search' : 'Next Step'}
                                {step === totalSteps ? <Target className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
