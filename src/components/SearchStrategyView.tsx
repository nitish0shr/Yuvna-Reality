import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Copy, CheckCircle, Target, Lightbulb, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateSearchStrategy } from '../utils/ai';

interface SearchStrategyViewProps {
    onNext: () => void;
}

export default function SearchStrategyView({ onNext }: SearchStrategyViewProps) {
    const {
        enhancedIntake,
        currentJob,
        searchStrategy,
        setSearchStrategy,
        isGeneratingStrategy,
        setGeneratingStrategy
    } = useStore();

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        const generate = async () => {
            if (!enhancedIntake || !currentJob?.rawDescription || searchStrategy || isGeneratingStrategy) return;

            setGeneratingStrategy(true);
            try {
                const strategy = await generateSearchStrategy(enhancedIntake, currentJob.rawDescription);
                setSearchStrategy(strategy);
            } catch (error) {
                console.error("Failed to generate strategy:", error);
            } finally {
                setGeneratingStrategy(false);
            }
        };

        generate();
    }, [enhancedIntake, currentJob, searchStrategy, isGeneratingStrategy, setSearchStrategy, setGeneratingStrategy]);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (isGeneratingStrategy || !searchStrategy) {
        return (
            <div className="w-full max-w-5xl mx-auto p-8 min-h-[600px] flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    <Search className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Designing Search Strategy</h2>
                <p className="text-slate-400 max-w-md">
                    Analyzing talent pools, identifying target companies, and crafting boolean strings...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-6 font-sans text-slate-300 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-3">Sourcing Strategy</h2>
                    <p className="text-slate-400">AI-optimized plan to find the best candidates for <span className="text-cyan-400">{enhancedIntake?.primaryTitle}</span></p>
                </div>

                {/* Boolean Search Strings */}
                <div className="grid gap-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-cyan-400" />
                        Boolean Search Strings
                    </h3>
                    <div className="grid gap-4">
                        {searchStrategy.booleanSearchStrings.map((item, idx) => (
                            <div key={idx} className="bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-colors group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">{item.description}</span>
                                    <button
                                        onClick={() => handleCopy(item.query, idx)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                        title="Copy to clipboard"
                                    >
                                        {copiedIndex === idx ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                                <code className="block bg-black/30 p-4 rounded-lg text-sm font-mono text-slate-300 break-all border border-white/5">
                                    {item.query}
                                </code>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Target Companies */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="col-span-full">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                            <Building className="w-5 h-5 text-purple-400" />
                            Target Companies
                        </h3>
                    </div>

                    {/* Tier 1 */}
                    <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                            Tier 1: Perfect Match
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">High Priority</span>
                        </h4>
                        <ul className="space-y-3">
                            {searchStrategy.targetCompanies.tier1.map((c, i) => (
                                <li key={i} className="group">
                                    <div className="font-medium text-slate-200 group-hover:text-purple-300 transition-colors">{c.company}</div>
                                    <div className="text-xs text-slate-500">{c.reason}</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tier 2 */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                            Tier 2: Strong Overlap
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">Secondary</span>
                        </h4>
                        <ul className="space-y-3">
                            {searchStrategy.targetCompanies.tier2.map((c, i) => (
                                <li key={i} className="group">
                                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{c.company}</div>
                                    <div className="text-xs text-slate-500">{c.reason}</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tier 3 */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                            Tier 3: Hidden Gems
                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">Explore</span>
                        </h4>
                        <ul className="space-y-3">
                            {searchStrategy.targetCompanies.tier3.map((c, i) => (
                                <li key={i} className="group">
                                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors">{c.company}</div>
                                    <div className="text-xs text-slate-500">{c.reason}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Keywords & Tips */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Keywords */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                            <Target className="w-5 h-5 text-emerald-400" />
                            Keywords
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Must Have</h4>
                                <div className="flex flex-wrap gap-2">
                                    {searchStrategy.mustHaveKeywords.map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-300">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3">Nice to Have</h4>
                                <div className="flex flex-wrap gap-2">
                                    {searchStrategy.niceToHaveKeywords.map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-300">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">Exclude</h4>
                                <div className="flex flex-wrap gap-2">
                                    {searchStrategy.excludeKeywords.map((k, i) => (
                                        <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-sm text-rose-300 line-through decoration-rose-500/50">
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-6">
                            <Lightbulb className="w-5 h-5" />
                            Pro Tips
                        </h3>
                        <ul className="space-y-4">
                            {searchStrategy.searchTips.map((tip, i) => (
                                <li key={i} className="flex gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm leading-relaxed">{tip}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end pt-8">
                    <button
                        onClick={onNext}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
                    >
                        Proceed to Candidates
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function Building({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
        </svg>
    )
}
