import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Upload, FileText, X, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSound } from '../../context/SoundContext';
import { useStore } from '../../store/useStore';
import { parseFile, extractNameFromResume, extractCurrentJobTitle, extractCurrentCompany, extractSponsorshipNeed, generateId } from '../../utils/fileParser';
import { evaluateCandidate, getDemoEvaluation, isAPIConfigured } from '../../utils/ai';
import type { Candidate } from '../../types';

interface UploadedFile {
  id: string;
  name: string;
  status: 'parsing' | 'evaluating' | 'done' | 'error';
  error?: string;
  position: { x: number; y: number };
  delay: number;
}

// Lotus Flower SVG Component
function LotusFlower({ status, progress = 0 }: { status: string; progress?: number }) {
  const isLoading = status === 'parsing' || status === 'evaluating';
  const isDone = status === 'done';

  return (
    <div className="relative w-20 h-20">
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-500
        ${isDone ? 'bg-emerald-400/40' : isLoading ? 'bg-cyan-400/30' : 'bg-red-400/30'}`}
      />

      {/* Progress ring */}
      {isLoading && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="3"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(6, 182, 212, 0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.5 }}
            style={{
              strokeDasharray: '226',
              strokeDashoffset: '0',
            }}
          />
        </svg>
      )}

      {/* Lotus SVG */}
      <svg viewBox="0 0 80 80" className="w-full h-full">
        {/* Center */}
        <circle
          cx="40"
          cy="42"
          r="8"
          className={`transition-all duration-500 ${isDone ? 'fill-emerald-400' : isLoading ? 'fill-cyan-400' : 'fill-red-400'}`}
        />

        {/* Petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.ellipse
            key={angle}
            cx="40"
            cy="28"
            rx="6"
            ry="14"
            className={`transition-all duration-500 ${isDone ? 'fill-emerald-300/80' : isLoading ? 'fill-cyan-300/80' : 'fill-red-300/80'}`}
            style={{
              transformOrigin: '40px 42px',
              transform: `rotate(${angle}deg)`,
            }}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: [0.9, 1, 0.9],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Inner glow */}
        <circle
          cx="40"
          cy="42"
          r="4"
          className="fill-white/60"
        />
      </svg>

      {/* Status indicator */}
      {isDone && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <CheckCircle size={14} className="text-white" />
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <X size={14} className="text-white" />
        </motion.div>
      )}
    </div>
  );
}

// Floating Lotus Card
function FloatingLotus({ file, onRemove }: { file: UploadedFile; onRemove: () => void }) {
  const { isDark } = useTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (file.status === 'parsing' || file.status === 'evaluating') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
    if (file.status === 'done') {
      setProgress(100);
    }
  }, [file.status]);

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        scale: 0,
        y: 50,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0,
        transition: { duration: 0.2 }
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: file.delay,
      }}
      className="lotus relative flex flex-col items-center"
      style={{
        animationDelay: `${file.delay * 1000}ms`,
      }}
    >
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 3 + Math.random(),
          repeat: Infinity,
          ease: 'easeInOut',
          delay: file.delay,
        }}
        className="relative cursor-pointer group"
        onClick={onRemove}
      >
        <LotusFlower status={file.status} progress={progress} />

        {/* Remove button on hover */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600">
            <X size={12} className="text-white" />
          </button>
        </div>
      </motion.div>

      {/* File name */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: file.delay + 0.2 }}
        className={`mt-3 text-xs font-medium text-center max-w-[100px] truncate
          ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
      >
        {file.name.replace(/\.[^/.]+$/, '')}
      </motion.p>

      {/* Status text */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: file.delay + 0.3 }}
        className={`text-[10px] mt-1 px-2 py-0.5 rounded-full
          ${file.status === 'done'
            ? 'bg-emerald-500/20 text-emerald-400'
            : file.status === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-cyan-500/20 text-cyan-400'
          }`}
      >
        {file.status === 'parsing' ? 'Reading...' :
         file.status === 'evaluating' ? 'AI Scoring...' :
         file.status === 'done' ? 'Ready' : 'Error'}
      </motion.span>
    </motion.div>
  );
}

// Ripple animation component
function Ripples({ isActive }: { isActive: boolean }) {
  return (
    <div className="ripple-container">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="ripple"
          style={{
            left: '50%',
            top: '50%',
            width: '100px',
            height: '100px',
            marginLeft: '-50px',
            marginTop: '-50px',
          }}
          animate={{
            scale: isActive ? [0, 4] : [0, 3],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: isActive ? 2 : 4,
            repeat: Infinity,
            delay: i * (isActive ? 0.5 : 1.2),
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// Bot Theater - "Glass Box" loading animation that masks latency
const BOT_THEATER_STEPS = [
  { icon: '📄', text: 'Extracting resume text...', duration: 800 },
  { icon: '🔍', text: 'Analyzing tenure patterns...', duration: 1200 },
  { icon: '🎯', text: 'Matching against job requirements...', duration: 1000 },
  { icon: '⚖️', text: 'Calculating skill fit scores...', duration: 900 },
  { icon: '✨', text: 'Generating insights...', duration: 800 },
];

function BotTheater({ isActive, candidateName }: { isActive: boolean; candidateName?: string }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      return;
    }

    const step = BOT_THEATER_STEPS[currentStep];
    if (!step) return;

    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % BOT_THEATER_STEPS.length);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const step = BOT_THEATER_STEPS[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-card rounded-2xl p-5 w-72"
    >
      <div className="flex items-center gap-4">
        <motion.div
          key={currentStep}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-3xl"
        >
          {step.icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          {candidateName && (
            <p className="text-xs text-cyan-400 font-medium mb-1 truncate">
              {candidateName}
            </p>
          )}
          <motion.p
            key={step.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-slate-300"
          >
            {step.text}
          </motion.p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {BOT_THEATER_STEPS.map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentStep ? 'bg-cyan-400' : i < currentStep ? 'bg-cyan-400/40' : 'bg-slate-600'
            }`}
            animate={i === currentStep ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function CandidateUploadStep() {
  const { play } = useSound();
  const { currentJob, candidates, addCandidate, updateCandidate, setPhase, isEvaluatingAll, setEvaluatingAll } = useStore();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevAllEvaluatedRef = useRef(false);

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const total = candidates.length;
    const evaluated = candidates.filter((c) => c.evaluation).length;
    const evaluating = candidates.filter((c) => c.isEvaluating).length;
    const percentage = total > 0 ? Math.round((evaluated / total) * 100) : 0;
    return { total, evaluated, evaluating, percentage };
  }, [candidates]);

  // Play sound when all candidates become ready
  const allEvaluated = progressStats.evaluated === progressStats.total && progressStats.total > 0;
  useEffect(() => {
    if (allEvaluated && !prevAllEvaluatedRef.current && progressStats.total > 0) {
      play('all_candidates_ready');
    }
    prevAllEvaluatedRef.current = allEvaluated;
  }, [allEvaluated, progressStats.total, play]);

  // Auto-evaluate candidates when they're added
  useEffect(() => {
    const evaluateAll = async () => {
      if (!currentJob || isEvaluatingAll) return;

      const unevaluated = candidates.filter((c) => !c.evaluation && !c.isEvaluating);
      if (unevaluated.length === 0) return;

      setEvaluatingAll(true);

      for (const candidate of unevaluated) {
        updateCandidate(candidate.id, { isEvaluating: true });

        setUploadedFiles((prev) =>
          prev.map((f) => (f.name === candidate.fileName ? { ...f, status: 'evaluating' } : f))
        );

        try {
          let evaluation;
          if (isAPIConfigured()) {
            evaluation = await evaluateCandidate(candidate, currentJob);
          } else {
            await new Promise((r) => setTimeout(r, 800));
            evaluation = getDemoEvaluation(candidate.name, currentJob);
          }

          const score = evaluation.score;
          const matchLabel = score >= 85 ? 'high' : score >= 70 ? 'medium' : 'low';

          updateCandidate(candidate.id, {
            evaluation,
            isEvaluating: false,
            matchScore: score,
            matchLabel,
          });

          setUploadedFiles((prev) =>
            prev.map((f) => (f.name === candidate.fileName ? { ...f, status: 'done' } : f))
          );
        } catch (error) {
          console.error('Error evaluating candidate:', error);
          const fallbackEval = getDemoEvaluation(candidate.name, currentJob);
          updateCandidate(candidate.id, {
            isEvaluating: false,
            evaluation: fallbackEval,
            matchScore: fallbackEval.score,
            matchLabel: fallbackEval.score >= 85 ? 'high' : fallbackEval.score >= 70 ? 'medium' : 'low',
          });

          setUploadedFiles((prev) =>
            prev.map((f) => (f.name === candidate.fileName ? { ...f, status: 'done' } : f))
          );
        }
      }

      setEvaluatingAll(false);
    };

    evaluateAll();
  }, [candidates, currentJob, isEvaluatingAll]);

  const processFiles = useCallback(async (files: File[]) => {
    if (!currentJob || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = generateId();

      setUploadedFiles((prev) => [
        ...prev,
        {
          id: fileId,
          name: file.name,
          status: 'parsing',
          position: {
            x: Math.random() * 60 + 20,
            y: Math.random() * 60 + 20
          },
          delay: i * 0.15,
        },
      ]);

      try {
        const content = await parseFile(file);
        const name = extractNameFromResume(content, file.name);
        const currentJobTitle = extractCurrentJobTitle(content);
        const currentCompany = extractCurrentCompany(content);
        const requiresSponsorship = extractSponsorshipNeed(content);

        const candidate: Candidate = {
          id: generateId(),
          jobId: currentJob.id,
          name,
          email: null,
          phone: null,
          location: null,
          currentJobTitle,
          currentCompany,
          yearsExperience: null,
          rawResume: content,
          fileName: file.name,
          resumeFileUrl: null,
          status: 'new',
          isProcessing: false,
          processingError: null,
          matchScore: null,
          matchLabel: null,
          evaluation: null,
          isEvaluating: false,
          outreachEmail: null,
          outreachDraft: null,
          hasReachedOut: false,
          isStarred: false,
          manualRank: null,
          requiresSponsorship,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addCandidate(candidate);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: 'error', error: 'Failed to parse file' }
              : f
          )
        );
      }
    }
  }, [currentJob, addCandidate]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      play('resume_drop');
      processFiles(files);
    }
  }, [processFiles, play]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      play('resume_drop');
      processFiles(files);
    }
    if (e.target) e.target.value = '';
  }, [processFiles, play]);

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  if (!currentJob) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Please upload a job description first</p>
      </div>
    );
  }

  const hasValidCandidates = candidates.length > 0;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Ripples */}
      <Ripples isActive={isDragging} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPhase('analyze-job')}
              className="p-2 rounded-xl glass hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Drop Resumes Here
              </h1>
              <p className="text-sm text-slate-400">
                {currentJob.title} {currentJob.company && `at ${currentJob.company}`}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          {candidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl px-5 py-3"
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{progressStats.total}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Uploaded</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{progressStats.evaluated}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Scored</p>
                </div>
                {progressStats.evaluating > 0 && (
                  <>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="text-purple-400 animate-spin" />
                      <span className="text-sm text-purple-400">{progressStats.evaluating}</span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Bot Theater - Glass Box Loading Animation */}
          <AnimatePresence>
            <BotTheater
              isActive={progressStats.evaluating > 0}
              candidateName={candidates.find((c) => c.isEvaluating)?.name}
            />
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Drop Zone */}
      <div className="flex-1 relative z-10 px-6 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`h-full min-h-[400px] rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden
            ${isDragging
              ? 'glass-card border-2 border-cyan-400/50 shadow-[0_0_60px_rgba(6,182,212,0.2)]'
              : 'glass-card border border-white/10 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]'
            }`}
        >
          {/* Empty state */}
          {uploadedFiles.length === 0 && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
            >
              <motion.div
                animate={{
                  y: isDragging ? -20 : [0, -10, 0],
                  scale: isDragging ? 1.2 : 1,
                }}
                transition={isDragging ? { duration: 0.2 } : {
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-2xl glass-card flex items-center justify-center mb-6">
                  {isDragging ? (
                    <FileText size={40} className="text-cyan-400" />
                  ) : (
                    <Upload size={40} className="text-cyan-400" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl blur-xl bg-cyan-400/20" />
              </motion.div>

              <h2 className="text-xl font-bold text-white mb-2">
                {isDragging ? 'Drop them here!' : 'Drop Resumes'}
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                Drag & drop multiple files or click to browse
              </p>
              <div className="flex items-center gap-2">
                {['PDF', 'DOCX', 'TXT'].map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium glass text-slate-300"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Floating Lotus Grid */}
          {uploadedFiles.length > 0 && (
            <div className="absolute inset-0 p-8">
              <div className="flex flex-wrap gap-6 justify-center items-start content-start h-full overflow-y-auto py-4">
                <AnimatePresence>
                  {uploadedFiles.map((file) => (
                    <FloatingLotus
                      key={file.id}
                      file={file}
                      onRemove={() => removeFile(file.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Add more hint when files exist */}
          {uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-500 text-sm"
            >
              <Upload size={14} />
              Drop more resumes to add
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Sticky Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="sticky bottom-0 left-0 right-0 z-40 p-4 glass border-t border-white/10"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {hasValidCandidates ? (
              allEvaluated ? (
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-400" />
                  <span className="text-emerald-400">All {progressStats.total} candidates ready!</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                  AI scoring candidates... ({progressStats.evaluated}/{progressStats.total})
                </span>
              )
            ) : (
              'Drop resumes above to begin'
            )}
          </div>
          <button
            onClick={() => setPhase('results')}
            disabled={!hasValidCandidates}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
              ${hasValidCandidates
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
          >
            {allEvaluated ? 'Show Me Who Fits' : 'View Results'}
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
