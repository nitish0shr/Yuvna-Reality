import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Briefcase, MapPin, Award, ExternalLink, Linkedin, Github } from 'lucide-react';
import MessageGenerator from './MessageGenerator';
import type { Candidate } from '../types';

interface CandidateDetailProps {
    candidate: Candidate;
    onClose: () => void;
}

export default function CandidateDetail({ candidate, onClose }: CandidateDetailProps) {
    const [showMessageGenerator, setShowMessageGenerator] = useState(false);

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[800px] bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 flex flex-col font-sans text-slate-300"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20">
                        {candidate.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                        <p className="text-sm text-slate-400">{candidate.currentJobTitle || 'Unknown Role'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                {/* Recommendation Box */}
                {candidate.evaluation && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`p-6 rounded-2xl border ${candidate.evaluation.recommendation.includes('Yes') ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={`text-lg font-bold tracking-wider ${candidate.evaluation.recommendation.includes('Yes') ? 'text-emerald-400' : 'text-amber-400'}`}>
                                RECOMMENDATION: {candidate.evaluation.recommendation.toUpperCase()}
                            </h3>
                            {candidate.evaluation.recommendation.includes('Yes') && <Award className="w-6 h-6 text-emerald-400" />}
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                            {candidate.evaluation.summary}
                        </p>
                    </motion.div>
                )}

                {/* Split View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-24">

                    {/* Left Column: Info & Timeline */}
                    <div className="space-y-8">
                        {/* Contact & Links */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contact & Socials</h4>
                            <div className="flex flex-wrap gap-3">
                                {candidate.outreachEmail && (
                                    <a href={`mailto:${candidate.outreachEmail}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                        <ExternalLink className="w-4 h-4 text-slate-400" /> Email
                                    </a>
                                )}
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                    <Linkedin className="w-4 h-4 text-indigo-400" /> LinkedIn
                                </button>
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                                    <Github className="w-4 h-4 text-slate-400" /> GitHub
                                </button>
                            </div>
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {candidate.location || 'Unknown Location'}</div>
                                <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {candidate.yearsExperience || 0} Years Experience</div>
                            </div>
                        </div>

                        {/* Rich AI Analysis */}
                        <div className="space-y-6">

                            {/* Screening Notes */}
                            {candidate.evaluation?.screeningNotes && (
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-cyan-400" />
                                        Screening Notes
                                    </h3>
                                    <div className="space-y-4 text-sm text-slate-300">
                                        <p><span className="text-slate-500 font-medium uppercase text-xs tracking-wider block mb-1">Overview</span> {candidate.evaluation.screeningNotes.overview}</p>
                                        <p><span className="text-slate-500 font-medium uppercase text-xs tracking-wider block mb-1">Risks</span> {candidate.evaluation.screeningNotes.risksAndConcerns}</p>
                                        <p><span className="text-slate-500 font-medium uppercase text-xs tracking-wider block mb-1">Positioning</span> {candidate.evaluation.screeningNotes.positioningToHiringManager}</p>
                                    </div>
                                </div>
                            )}

                            {/* Evidence Grid */}
                            {candidate.evaluation?.evidenceGrid && (
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        Evidence Grid
                                    </h3>
                                    <div className="space-y-3">
                                        {candidate.evaluation.evidenceGrid.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-white/5">
                                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.fit === 'match' ? 'bg-emerald-500' :
                                                    item.fit === 'partial' ? 'bg-amber-500' :
                                                        'bg-rose-500'
                                                    }`} />
                                                <div>
                                                    <div className="text-sm font-medium text-slate-200 mb-1">{item.requirement}</div>
                                                    <div className="text-xs text-slate-400">{item.evidence}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Flags & Patterns */}
                            {candidate.evaluation?.flags && (candidate.evaluation.flags.isJobHopper || candidate.evaluation.flags.isContractor) && (
                                <div className="bg-rose-500/10 rounded-xl p-6 border border-rose-500/20">
                                    <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Pattern Detection
                                    </h3>
                                    <div className="space-y-2">
                                        {candidate.evaluation.flags.isJobHopper && (
                                            <div className="flex items-center gap-2 text-rose-300 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                Frequent Job Changes Detected
                                            </div>
                                        )}
                                        {candidate.evaluation.flags.isContractor && (
                                            <div className="flex items-center gap-2 text-amber-300 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                Contract/Freelance Pattern
                                            </div>
                                        )}
                                        {candidate.evaluation.flags.flagReason && (
                                            <p className="text-xs text-rose-400/80 mt-2 pl-3 border-l-2 border-rose-500/30">
                                                {candidate.evaluation.flags.flagReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Legacy Analysis Fallback (if new fields missing) */}
                            {(!candidate.evaluation?.evidenceGrid) && (
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-indigo-400" />
                                        Key Insights
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Strengths</h4>
                                            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                                {candidate.evaluation?.strengths.map((s, i) => <li key={i}>{s}</li>) || <li>No strengths listed</li>}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Gaps</h4>
                                            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                                {candidate.evaluation?.gaps.map((s, i) => <li key={i}>{s}</li>) || <li>No gaps listed</li>}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Resume Preview */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 rounded-xl p-6 border border-white/5 sticky top-6">
                            <h3 className="text-lg font-bold text-white mb-4">Resume Preview</h3>
                            <div className="text-sm text-slate-400 whitespace-pre-wrap max-h-[600px] overflow-y-auto font-mono p-4 bg-slate-900/50 rounded-lg border border-white/5">
                                {candidate.rawResume ? candidate.rawResume.slice(0, 3000) + (candidate.rawResume.length > 3000 ? '...' : '') : 'No resume content available.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/5 bg-slate-900/80 backdrop-blur-xl flex justify-end gap-4 absolute bottom-0 w-full z-10">
                <button onClick={onClose} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-medium">
                    Close
                </button>
                <button
                    onClick={() => setShowMessageGenerator(true)}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all"
                >
                    Proceed to Interview
                </button>
            </div>

            <AnimatePresence>
                {showMessageGenerator && (
                    <MessageGenerator
                        candidate={candidate}
                        onClose={() => setShowMessageGenerator(false)}
                        onSent={() => {
                            setShowMessageGenerator(false);
                            onClose(); // Close the detail view after sending
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
