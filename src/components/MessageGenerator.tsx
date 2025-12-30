import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, RefreshCw, Check, X, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import { generateOutreachEmail } from '../utils/ai';
import type { Candidate } from '../types';

interface MessageGeneratorProps {
    candidate: Candidate;
    onClose: () => void;
    onSent: () => void;
}

export default function MessageGenerator({ candidate, onClose, onSent }: MessageGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(true);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(false);

    const currentJob = useStore(state => state.currentJob);

    // AI Generation
    useEffect(() => {
        const generate = async () => {
            if (!currentJob) return;

            setIsGenerating(true);
            try {
                const draft = await generateOutreachEmail(candidate, currentJob);

                // Parse subject and body if possible, or just dump it
                // The prompt returns "Subject: ... \n\n Body..."
                const lines = draft.split('\n');
                const subjectLine = lines.find(l => l.startsWith('Subject:'))?.replace('Subject:', '').trim() || `Interview Request: ${candidate.name}`;
                const bodyText = draft.replace(/Subject:.*\n/, '').trim();

                setSubject(subjectLine);

                // Typewriter effect for body
                let i = 0;
                const interval = setInterval(() => {
                    setMessage(bodyText.slice(0, i));
                    i += 5; // Faster typing
                    if (i > bodyText.length) {
                        clearInterval(interval);
                        setIsGenerating(false);
                    }
                }, 5);

                return () => clearInterval(interval);

            } catch (error) {
                console.error("Failed to generate message:", error);
                setMessage("Error generating draft. Please try again.");
                setIsGenerating(false);
            }
        };

        generate();
    }, [candidate, currentJob]);

    const handleSend = () => {
        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setSent(true);
            setTimeout(onSent, 2000);
        }, 1500);
    };

    if (sent) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
            >
                <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl flex flex-col items-center text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                        <Check className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Transmission Sent</h3>
                    <p className="text-slate-400">Candidate has been notified via secure channel.</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4"
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-indigo-500/20">
                            <MessageSquare className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Compose Transmission</h3>
                            <p className="text-xs text-slate-400">AI Drafter v2.0 • Secure Line</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-1 flex-1 flex flex-col h-full">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Message Body</label>
                            {isGenerating && (
                                <span className="text-xs text-indigo-400 flex items-center gap-1 animate-pulse">
                                    <Sparkles className="w-3 h-3" /> Generating draft...
                                </span>
                            )}
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-64 bg-slate-800/50 border border-white/10 rounded-lg p-4 text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-between items-center">
                    <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
                        disabled={isGenerating}
                    >
                        <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm font-medium">
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isGenerating || isSending}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <>Sending...</>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Transmission
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
