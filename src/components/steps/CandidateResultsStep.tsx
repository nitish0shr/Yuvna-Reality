import { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ArrowLeft, Search, Star, Briefcase, Building2, AlertTriangle, XCircle, RefreshCw, Mail, Plus, Sparkles, ThumbsUp, ThumbsDown, ArrowRight, Crown, Zap, GripVertical, X, Copy, Check, ExternalLink } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { useStore } from '../../store/useStore';
import type { Candidate, Job } from '../../types';

// Glowing Score Ring Component
function ScoreRing({ score, size = 64, showLabel = true }: { score: number; size?: number; showLabel?: boolean }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColors = () => {
    if (score >= 95) return {
      stroke: 'url(#unicorn-gradient)',
      glow: 'score-glow-cyan',
      text: 'text-cyan-400',
      bg: 'from-cyan-500/20 to-purple-500/20'
    };
    if (score >= 85) return {
      stroke: '#10b981',
      glow: 'score-glow-emerald',
      text: 'text-emerald-400',
      bg: 'from-emerald-500/20 to-emerald-500/10'
    };
    if (score >= 70) return {
      stroke: '#f59e0b',
      glow: 'score-glow-amber',
      text: 'text-amber-400',
      bg: 'from-amber-500/20 to-amber-500/10'
    };
    return {
      stroke: '#ef4444',
      glow: 'score-glow-red',
      text: 'text-red-400',
      bg: 'from-red-500/20 to-red-500/10'
    };
  };

  const colors = getColors();

  return (
    <div className={`relative ${colors.glow} rounded-full`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="unicorn-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={5}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={5}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {showLabel && (
        <div className={`absolute inset-0 flex items-center justify-center font-bold ${colors.text}`} style={{ fontSize: size * 0.32 }}>
          {score}
        </div>
      )}
    </div>
  );
}

// Staircase Candidate Card
function StaircaseCard({
  candidate,
  rank,
  isSelected,
  onClick,
  onDragEnd,
}: {
  candidate: Candidate;
  rank: number;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd?: () => void;
}) {
  const score = candidate.evaluation?.score ?? candidate.matchScore ?? 0;
  const isUnicorn = score >= 95;

  // Visual sizing based on rank
  const getScaleAndOpacity = () => {
    if (rank === 1) return { scale: 1, opacity: 1, brightness: 1.2 };
    if (rank === 2) return { scale: 0.98, opacity: 0.95, brightness: 1.1 };
    if (rank === 3) return { scale: 0.96, opacity: 0.9, brightness: 1 };
    if (rank <= 5) return { scale: 0.94, opacity: 0.85, brightness: 0.95 };
    return { scale: 0.92, opacity: 0.8, brightness: 0.9 };
  };

  const visual = getScaleAndOpacity();

  return (
    <Reorder.Item
      value={candidate}
      id={candidate.id}
      onDragEnd={onDragEnd}
    >
      <motion.div
        layout
        initial={{ opacity: 0, x: -50 }}
        animate={{
          opacity: visual.opacity,
          x: 0,
          scale: visual.scale,
        }}
        whileHover={{
          scale: visual.scale * 1.03,
          x: 12,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        onClick={onClick}
        className={`staircase-item relative rounded-2xl cursor-pointer overflow-hidden
          ${isSelected
            ? 'glass-card border-2 border-cyan-400/50'
            : 'glass-card border border-white/10 hover:border-cyan-500/30'
          }
          ${isUnicorn ? 'ring-2 ring-purple-500/30' : ''}
        `}
        style={{
          marginLeft: `${Math.max(0, (rank - 1) * 8)}px`,
        }}
      >
        {/* Unicorn shimmer effect */}
        {isUnicorn && (
          <div className="absolute inset-0 shimmer pointer-events-none" />
        )}

        <div className="flex items-center gap-4 p-4">
          {/* Drag handle */}
          <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400">
            <GripVertical size={18} />
          </div>

          {/* Rank badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
            ${rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900' :
              rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
              rank === 3 ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white' :
              'bg-slate-800 text-slate-400'
            }`}
          >
            {rank <= 3 ? <Crown size={14} /> : rank}
          </div>

          {/* Score Ring */}
          <ScoreRing score={score} size={52} />

          {/* Candidate Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">
                {candidate.name}
              </span>
              {isUnicorn && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border border-cyan-500/30">
                  <Sparkles size={10} />
                  Unicorn
                </span>
              )}
              {candidate.isStarred && (
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
              )}
            </div>
            <p className="text-sm text-slate-400 truncate">
              {candidate.currentJobTitle || 'No title'}
              {candidate.currentCompany && (
                <span className="text-slate-500"> at {candidate.currentCompany}</span>
              )}
            </p>
          </div>

          {/* Visual Tags - Petals */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {/* Golden Petals for strengths */}
            {candidate.evaluation?.strengths && candidate.evaluation.strengths.length > 0 && (
              <div className="flex -space-x-1">
                {candidate.evaluation.strengths.slice(0, 3).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full petal-gold" title="Strength" />
                ))}
              </div>
            )}

            {/* Frosted tags for gaps */}
            {candidate.evaluation?.gaps && candidate.evaluation.gaps.length > 0 && (
              <div className="flex -space-x-1">
                {candidate.evaluation.gaps.slice(0, 2).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full petal-frost" title="Gap" />
                ))}
              </div>
            )}

            {/* Crimson leaves for red flags */}
            {candidate.evaluation?.redFlags && candidate.evaluation.redFlags.length > 0 && (
              <div className="flex -space-x-1">
                {candidate.evaluation.redFlags.map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full petal-crimson" title="Red Flag" />
                ))}
              </div>
            )}
          </div>

          {/* Hiring Priority */}
          {candidate.evaluation?.fitSnapshot?.hiringPriority && (
            <span className={`hidden sm:flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium flex-shrink-0
              ${candidate.evaluation.fitSnapshot.hiringPriority === 'Top pick'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : candidate.evaluation.fitSnapshot.hiringPriority === 'Consider'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {candidate.evaluation.fitSnapshot.hiringPriority === 'Top pick' && <Zap size={12} />}
              {candidate.evaluation.fitSnapshot.hiringPriority}
            </span>
          )}
        </div>
      </motion.div>
    </Reorder.Item>
  );
}

// Expanded Candidate Detail Panel ("Writing Room")
// Generate screening email for candidate
function generateScreeningEmail(candidate: Candidate, job: Job): { subject: string; body: string } {
  const firstName = candidate.name.split(' ')[0];
  const evaluation = candidate.evaluation;

  // Build personalized hook from evaluation
  const experienceHighlight = evaluation?.experienceHighlights?.[0];
  const strengthHook = experienceHighlight
    ? `your experience as ${experienceHighlight.role} at ${experienceHighlight.company}`
    : candidate.currentJobTitle && candidate.currentCompany
      ? `your background as ${candidate.currentJobTitle} at ${candidate.currentCompany}`
      : 'your background';

  // Generate screening questions from gaps
  const screeningQuestions: string[] = [];

  if (evaluation?.gaps && evaluation.gaps.length > 0) {
    // Convert gap to a probing question
    const gap = evaluation.gaps[0];
    if (gap.toLowerCase().includes('typescript')) {
      screeningQuestions.push('What\'s your comfort level with TypeScript? Any recent projects using it?');
    } else if (gap.toLowerCase().includes('backend') || gap.toLowerCase().includes('full-stack')) {
      screeningQuestions.push('Can you share a bit about your backend/API experience?');
    } else {
      screeningQuestions.push(`Quick question about ${gap.split('-')[0].trim().toLowerCase()} - any relevant experience you can share?`);
    }
  }

  if (evaluation?.interviewPointers && evaluation.interviewPointers.length > 0) {
    screeningQuestions.push(evaluation.interviewPointers[0].question);
  }

  // Add role-specific questions
  if (job.mustHaveSkills.length > 0 && screeningQuestions.length < 3) {
    screeningQuestions.push(`What's your experience level with ${job.mustHaveSkills[0]}? (years, project examples)`);
  }

  if (screeningQuestions.length < 3) {
    screeningQuestions.push('What\'s your timeline for making a move, and what does your ideal next role look like?');
  }

  const subject = `Quick follow-up on your ${job.title} application - ${job.company}`;

  const body = `Hi ${firstName}!

Thanks so much for applying to the ${job.title} role at ${job.company} - we really appreciate you taking the time!

We've received a ton of applications (it's been a bit overwhelming, honestly!) but ${strengthHook} caught our attention, and we don't want to miss out on connecting with you.

Before we set up a call with the hiring manager, could you help us with a few quick details? This should only take about 10 minutes, and it'll help us fast-track your application:

${screeningQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Once we have your responses, we can move things forward quickly on our end.

Looking forward to hearing from you!

Best,
[Your Name]
${job.company} Recruiting Team`;

  return { subject, body };
}

function CandidateDetailPanel({
  candidate,
  job,
  onClose,
  onStar,
}: {
  candidate: Candidate;
  job: Job;
  onClose: () => void;
  onStar: () => void;
}) {
  const { play } = useSound();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const score = candidate.evaluation?.score ?? candidate.matchScore ?? 0;
  const evaluation = candidate.evaluation;
  const isUnicorn = score >= 95;

  // Generate email content
  const emailContent = generateScreeningEmail(candidate, job);

  const handleCopyEmail = () => {
    const fullEmail = `Subject: ${emailContent.subject}\n\n${emailContent.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    play('copy_success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(emailContent.subject)}&body=${encodeURIComponent(emailContent.body)}`;
    window.open(gmailUrl, '_blank');
    play('email_ready');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-card rounded-3xl overflow-hidden h-full"
    >
      {/* Header */}
      <div className="relative p-6 border-b border-white/10">
        {/* Unicorn glow */}
        {isUnicorn && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
        )}

        <div className="relative flex items-start gap-5">
          <ScoreRing score={score} size={80} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white truncate">
                {candidate.name}
              </h2>
              {isUnicorn && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 border border-cyan-500/30">
                  <Sparkles size={14} />
                  Unicorn Candidate
                </span>
              )}
            </div>

            {/* Enhanced Summary with precise experience */}
            <div className="space-y-2">
              {evaluation?.experienceHighlights && evaluation.experienceHighlights.length > 0 ? (
                <div className="text-slate-300 text-sm">
                  <span className="text-cyan-400 font-medium">{evaluation.experienceHighlights[0].role}</span>
                  {' '}at{' '}
                  <span className="text-white font-medium">{evaluation.experienceHighlights[0].company}</span>
                  {evaluation.experienceHighlights[0].duration && (
                    <span className="text-slate-500"> ({evaluation.experienceHighlights[0].duration})</span>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 flex items-center gap-2">
                  {candidate.currentJobTitle && candidate.currentCompany ? (
                    <>
                      <span className="text-cyan-400">{candidate.currentJobTitle}</span>
                      <span className="text-slate-600">at</span>
                      <Building2 size={14} className="text-slate-500" />
                      <span className="text-white">{candidate.currentCompany}</span>
                    </>
                  ) : (
                    <span className="text-slate-500 italic">Experience details pending</span>
                  )}
                </p>
              )}

              {/* AI Summary - Evidence-based */}
              {evaluation?.summary && (
                <p className="text-slate-400 text-sm leading-relaxed">
                  {evaluation.summary}
                </p>
              )}

              {/* Recommendation badge */}
              {evaluation?.recommendation && (
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider
                    ${evaluation.recommendation === 'Strong Yes' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      evaluation.recommendation === 'Yes' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      evaluation.recommendation === 'Maybe' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      evaluation.recommendation === 'Lean No' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {evaluation.recommendation}
                  </span>
                  {evaluation.fitSnapshot?.hiringPriority && (
                    <span className="text-xs text-slate-500">
                      • {evaluation.fitSnapshot.hiringPriority}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="relative flex items-center gap-3 mt-5">
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25"
          >
            <Mail size={16} />
            Draft Screening Email
          </button>
          <button
            onClick={onStar}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all glass
              ${candidate.isStarred
                ? 'text-yellow-400 border border-yellow-500/30'
                : 'text-slate-300 border border-white/10 hover:border-white/20'
              }`}
          >
            <Star size={16} fill={candidate.isStarred ? 'currentColor' : 'none'} />
            {candidate.isStarred ? 'Starred' : 'Star'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5 max-h-[calc(100vh-24rem)] overflow-y-auto">
        {/* Pattern Alert - Job Hopper / Contractor Warning */}
        {evaluation?.flags?.isJobHopper && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10"
          >
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(251,191,36,0.03)_10px,rgba(251,191,36,0.03)_20px)]" />
            <div className="relative p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-amber-300 mb-1 flex items-center gap-2">
                  Pattern Alert: Short Stints
                </h4>
                <p className="text-sm text-slate-300">
                  {evaluation.flags.flagReason || 'Multiple short-term positions detected in recent history.'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Probe on retention and role transitions during screening.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {evaluation?.flags?.isContractor && !evaluation?.flags?.isJobHopper && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-cyan-500/10"
          >
            <div className="relative p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Briefcase size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-300 mb-1">
                  Contractor Profile
                </h4>
                <p className="text-sm text-slate-300">
                  {evaluation.flags.flagReason || 'Background shows consulting/contract work pattern.'}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Explore interest in full-time opportunities.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Strengths & Gaps */}
        {evaluation && (
          <div className="grid grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-emerald-400">
                <ThumbsUp size={14} />
                Strengths
              </h3>
              {evaluation.strengths && evaluation.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.strengths.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className="w-2 h-2 rounded-full petal-gold mt-1.5 flex-shrink-0" />
                      <span className="text-slate-300">{s}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No strengths identified</p>
              )}
            </div>

            {/* Gaps */}
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-amber-400">
                <ThumbsDown size={14} />
                Gaps
              </h3>
              {evaluation.gaps && evaluation.gaps.length > 0 ? (
                <ul className="space-y-2">
                  {evaluation.gaps.map((g, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <AlertTriangle size={12} className="text-amber-500 mt-1 flex-shrink-0" />
                      <span className="text-slate-300">{g}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No gaps identified</p>
              )}
            </div>
          </div>
        )}

        {/* Red Flags */}
        {evaluation?.redFlags && evaluation.redFlags.length > 0 && (
          <div className="glass rounded-2xl p-4 border border-red-500/20">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-red-400">
              <XCircle size={14} />
              Red Flags
            </h3>
            <ul className="space-y-2">
              {evaluation.redFlags.map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <div className="w-2 h-2 rounded-full petal-crimson mt-1.5 flex-shrink-0" />
                  <span className="text-red-300">{r}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Next Step */}
        {evaluation?.risksNextSteps?.recommendedNextStep && (
          <div className="glass rounded-2xl p-4 border border-blue-500/20">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-blue-400">
              <ArrowRight size={14} />
              Recommended Next Step
            </h3>
            <p className="text-sm text-slate-300">
              {evaluation.risksNextSteps.recommendedNextStep}
            </p>
          </div>
        )}

      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowEmailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass-card rounded-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Mail size={20} className="text-cyan-400" />
                    Screening Email for {candidate.name}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Copy or open directly in Gmail
                  </p>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Email Preview */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Subject Line */}
                <div className="glass rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                    Subject Line
                  </label>
                  <p className="text-white font-medium">
                    {emailContent.subject}
                  </p>
                </div>

                {/* Email Body */}
                <div className="glass rounded-xl p-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                    Email Body
                  </label>
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {emailContent.body}
                  </pre>
                </div>
              </div>

              {/* Modal Footer - Actions */}
              <div className="p-5 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyEmail}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold glass text-white hover:bg-white/10 transition-all border border-white/10"
                  >
                    {copied ? (
                      <>
                        <Check size={16} className="text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Email
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleOpenInGmail}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <ExternalLink size={16} />
                    Open in Gmail
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CandidateResultsStep() {
  const { play } = useSound();
  const { currentJob, candidates, toggleStar, setPhase, reset, reorderCandidates } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const unicornPlayedRef = useRef<Set<string>>(new Set());

  const filteredCandidates = useMemo(() => {
    let result = candidates;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(query) ||
        (c.currentJobTitle?.toLowerCase() || '').includes(query) ||
        (c.currentCompany?.toLowerCase() || '').includes(query)
      );
    }

    if (filter !== 'all') {
      result = result.filter((c) => {
        const score = c.evaluation?.score ?? c.matchScore ?? 0;
        if (filter === 'high') return score >= 85;
        if (filter === 'medium') return score >= 70 && score < 85;
        return score < 70;
      });
    }

    return [...result].sort((a, b) => {
      const aScore = a.evaluation?.score ?? a.matchScore ?? 0;
      const bScore = b.evaluation?.score ?? b.matchScore ?? 0;
      return bScore - aScore;
    });
  }, [candidates, searchQuery, filter]);

  const selectedCandidate = useMemo(() => {
    if (selectedId) {
      return filteredCandidates.find(c => c.id === selectedId) || null;
    }
    return null;
  }, [filteredCandidates, selectedId]);

  const stats = useMemo(() => {
    const high = candidates.filter((c) => (c.evaluation?.score ?? c.matchScore ?? 0) >= 85).length;
    const medium = candidates.filter((c) => {
      const s = c.evaluation?.score ?? c.matchScore ?? 0;
      return s >= 70 && s < 85;
    }).length;
    const low = candidates.filter((c) => (c.evaluation?.score ?? c.matchScore ?? 0) < 70).length;
    const unicorns = candidates.filter((c) => (c.evaluation?.score ?? c.matchScore ?? 0) >= 95).length;
    return { high, medium, low, unicorns };
  }, [candidates]);

  const handleReorder = useCallback((newOrder: Candidate[]) => {
    if (reorderCandidates) {
      reorderCandidates(newOrder.map(c => c.id));
    }
  }, [reorderCandidates]);

  if (!currentJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">No job loaded</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPhase('upload-candidates')}
                className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={20} className="text-slate-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  The Staircase
                </h1>
                <p className="text-sm text-slate-400">
                  {currentJob.title} · {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} ranked
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPhase('upload-candidates')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass text-slate-300 hover:bg-white/10"
              >
                <Plus size={14} />
                Add More
              </button>
              <button
                onClick={() => reset()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass text-slate-300 hover:bg-white/10"
              >
                <RefreshCw size={14} />
                New Role
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {stats.unicorns > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-purple-500/30"
              >
                <Sparkles size={16} className="text-purple-400" />
                <span className="text-lg font-bold text-purple-400">{stats.unicorns}</span>
                <span className="text-xs text-slate-400">Unicorn{stats.unicorns !== 1 ? 's' : ''}</span>
              </motion.button>
            )}
            {[
              { key: 'high', label: 'Top Tier', count: stats.high, color: 'text-emerald-400', border: 'border-emerald-500/30' },
              { key: 'medium', label: 'Consider', count: stats.medium, color: 'text-amber-400', border: 'border-amber-500/30' },
              { key: 'low', label: 'Below Bar', count: stats.low, color: 'text-red-400', border: 'border-red-500/30' },
            ].map((stat) => (
              <button
                key={stat.key}
                onClick={() => setFilter(filter === stat.key as typeof filter ? 'all' : stat.key as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl glass transition-all
                  ${filter === stat.key ? `border-2 ${stat.border}` : 'border border-white/10'}`}
              >
                <span className={`text-lg font-bold ${stat.color}`}>{stat.count}</span>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </button>
            ))}
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-6 h-full">
            {/* Left: Staircase List */}
            <div className="lg:col-span-3 space-y-2">
              {/* Search */}
              <div className="glass-card rounded-2xl mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidates..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent outline-none text-sm text-white placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Staircase */}
              <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-2">
                {filteredCandidates.length > 0 ? (
                  <Reorder.Group
                    axis="y"
                    values={filteredCandidates}
                    onReorder={handleReorder}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {filteredCandidates.map((candidate, index) => (
                        <StaircaseCard
                          key={candidate.id}
                          candidate={candidate}
                          rank={index + 1}
                          isSelected={selectedId === candidate.id}
                          onClick={() => {
                            const isNewSelection = selectedId !== candidate.id;
                            setSelectedId(selectedId === candidate.id ? null : candidate.id);
                            if (isNewSelection) {
                              play('candidate_select');
                              // Play unicorn sound for 95+ score candidates (only once per session)
                              const score = candidate.evaluation?.score ?? candidate.matchScore ?? 0;
                              if (score >= 95 && !unicornPlayedRef.current.has(candidate.id)) {
                                unicornPlayedRef.current.add(candidate.id);
                                setTimeout(() => play('unicorn_found'), 200);
                              }
                            }
                          }}
                        />
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                ) : (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <Briefcase size={48} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400">
                      {candidates.length === 0 ? 'No candidates uploaded yet' : 'No candidates match your search'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Detail Panel */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedCandidate && currentJob ? (
                  <CandidateDetailPanel
                    key={selectedCandidate.id}
                    candidate={selectedCandidate}
                    job={currentJob}
                    onClose={() => setSelectedId(null)}
                    onStar={() => {
                      toggleStar(selectedCandidate.id);
                      play(selectedCandidate.isStarred ? 'action_negative' : 'action_positive');
                    }}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Briefcase size={64} className="mx-auto mb-6 text-slate-600" />
                    </motion.div>
                    <p className="text-slate-400 text-lg mb-2">Select a candidate</p>
                    <p className="text-slate-500 text-sm">
                      Click on any candidate to view their full profile and send outreach
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
