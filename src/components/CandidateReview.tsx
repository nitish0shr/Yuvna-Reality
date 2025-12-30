import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Star,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Loader2,
  Trash2,
  Eye,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { LLMBadge } from './LLMSelector';
import type { Candidate, CandidateEvaluation } from '../types';

interface CandidateReviewProps {
  onNext: () => void;
}

type TabType = 'shortlisted' | 'potential' | 'rejected';

interface ScreeningChecklist {
  skillsMatch: boolean;
  experienceLevel: boolean;
  locationFit: boolean;
  salaryExpectation: boolean;
  availability: boolean;
  [key: string]: boolean;
}

export default function CandidateReview({ onNext }: CandidateReviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('shortlisted');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const {
    candidates,
    addCandidate,
    updateCandidate,
    removeCandidate,
    toggleStar,
    currentJob,
    selectedLLM: _selectedLLM
  } = useStore();

  // Filter candidates by category based on match score
  const shortlistedCandidates = candidates.filter(c => c.matchScore !== null && c.matchScore >= 70);
  const potentialCandidates = candidates.filter(c => c.matchScore !== null && c.matchScore >= 40 && c.matchScore < 70);
  const rejectedCandidates = candidates.filter(c => c.matchScore !== null && c.matchScore < 40);
  const pendingCandidates = candidates.filter(c => c.matchScore === null && !c.isEvaluating);

  const getTabCandidates = () => {
    switch (activeTab) {
      case 'shortlisted': return shortlistedCandidates;
      case 'potential': return potentialCandidates;
      case 'rejected': return rejectedCandidates;
      default: return shortlistedCandidates;
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf' || f.name.endsWith('.pdf') || f.name.endsWith('.txt') || f.name.endsWith('.docx')
    );

    if (files.length > 0) {
      await processFiles(files);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = ((i + 1) / files.length) * 100;
      setProcessingProgress(progress);

      // Create candidate entry
      const newCandidate: Candidate = {
        id: `candidate-${Date.now()}-${i}`,
        jobId: currentJob?.id || '',
        name: file.name.replace(/\.(pdf|txt|docx)$/i, '').replace(/[-_]/g, ' '),
        email: null,
        phone: null,
        location: null,
        currentJobTitle: null,
        currentCompany: null,
        yearsExperience: null,
        rawResume: '',
        fileName: file.name,
        resumeFileUrl: null,
        status: 'new',
        isProcessing: true,
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
        requiresSponsorship: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addCandidate(newCandidate);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update with mock data (in real app, would parse resume and run evaluation)
      updateCandidate(newCandidate.id, {
        isProcessing: false,
        name: generateMockName(),
        currentJobTitle: generateMockTitle(),
        currentCompany: generateMockCompany(),
        location: generateMockLocation(),
        yearsExperience: Math.floor(Math.random() * 15) + 2,
        matchScore: Math.floor(Math.random() * 60) + 30,
        matchLabel: Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        evaluation: generateMockEvaluation()
      });
    }

    setIsProcessing(false);
    setProcessingProgress(0);
  };

  const tabs = [
    { id: 'shortlisted' as TabType, label: 'Shortlisted', count: shortlistedCandidates.length, color: 'emerald' },
    { id: 'potential' as TabType, label: 'Potential', count: potentialCandidates.length, color: 'amber' },
    { id: 'rejected' as TabType, label: 'Rejected', count: rejectedCandidates.length, color: 'red' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Review Candidates</h2>
          <p className="text-slate-400 mt-1">Upload resumes and review AI-evaluated candidates</p>
        </div>
        <div className="flex items-center gap-3">
          <LLMBadge />
          <button
            onClick={onNext}
            disabled={shortlistedCandidates.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
          >
            View Dashboard
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Upload Candidates (Resumes)</h3>
            <p className="text-sm text-slate-400">Drag & drop or click to upload up to 20 resumes at once</p>
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.docx"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {isProcessing ? (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-400 mx-auto animate-spin" />
              <div>
                <p className="text-white font-medium">Processing resumes...</p>
                <p className="text-sm text-slate-400">{Math.round(processingProgress)}% complete</p>
              </div>
              <div className="w-64 mx-auto h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {isDragging ? 'Drop files here' : 'Drop resumes here or click to browse'}
                </p>
                <p className="text-sm text-slate-500">PDF, TXT, or DOCX (max 20 files)</p>
              </div>
            </div>
          )}
        </div>

        {/* Pending candidates indicator */}
        {pendingCandidates.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{pendingCandidates.length} candidates awaiting evaluation</span>
          </div>
        )}
      </div>

      {/* Candidates Tabs & List */}
      {candidates.length > 0 && (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-white/10">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? `text-${tab.color}-400 border-b-2 border-${tab.color}-400 bg-${tab.color}-500/5`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              >
                {tab.id === 'shortlisted' && <CheckCircle2 className="w-4 h-4" />}
                {tab.id === 'potential' && <AlertCircle className="w-4 h-4" />}
                {tab.id === 'rejected' && <XCircle className="w-4 h-4" />}
                {tab.label}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${activeTab === tab.id
                    ? `bg-${tab.color}-500/20 text-${tab.color}-400`
                    : 'bg-slate-800 text-slate-500'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Candidate List */}
          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {getTabCandidates().length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No candidates in this category yet</p>
                </div>
              ) : (
                getTabCandidates().map(candidate => (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar & Score */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-lg font-semibold text-white">
                          {candidate.name.charAt(0)}
                        </div>
                        <div className={`
                          absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${(candidate.matchScore || 0) >= 70
                            ? 'bg-emerald-500 text-white'
                            : (candidate.matchScore || 0) >= 40
                              ? 'bg-amber-500 text-white'
                              : 'bg-red-500 text-white'
                          }
                        `}>
                          {candidate.matchScore || '?'}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-white truncate">{candidate.name}</h4>
                          {candidate.isStarred && (
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                          {candidate.currentJobTitle && (
                            <span className="flex items-center gap-1 truncate">
                              <Briefcase className="w-3 h-3" />
                              {candidate.currentJobTitle}
                            </span>
                          )}
                          {candidate.currentCompany && (
                            <span className="truncate">@ {candidate.currentCompany}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          {candidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {candidate.location}
                            </span>
                          )}
                          {candidate.yearsExperience && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {candidate.yearsExperience} yrs exp
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(candidate.id);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${candidate.isStarred ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(candidate);
                          }}
                          className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCandidate(candidate.id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {candidates.length === 0 && !isProcessing && (
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No candidates yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Upload resumes above to start reviewing candidates. The AI will automatically
            evaluate each candidate against the job requirements.
          </p>
        </div>
      )}

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Candidate Detail Modal with Screening Notes
function CandidateDetailModal({
  candidate,
  onClose
}: {
  candidate: Candidate;
  onClose: () => void;
}) {
  const [checklist, setChecklist] = useState<ScreeningChecklist>({
    skillsMatch: false,
    experienceLevel: false,
    locationFit: false,
    salaryExpectation: false,
    availability: false
  });

  const evaluation = candidate.evaluation;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-semibold text-white">
                  {candidate.name.charAt(0)}
                </div>
                <div className={`
                  absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${(candidate.matchScore || 0) >= 70
                    ? 'bg-emerald-500 text-white'
                    : (candidate.matchScore || 0) >= 40
                      ? 'bg-amber-500 text-white'
                      : 'bg-red-500 text-white'
                  }
                `}>
                  {candidate.matchScore || '?'}
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{candidate.name}</h2>
                <p className="text-slate-400">
                  {candidate.currentJobTitle} @ {candidate.currentCompany}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  {candidate.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {candidate.location}
                    </span>
                  )}
                  {candidate.yearsExperience && (
                    <span>{candidate.yearsExperience} years experience</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Screening Checklist */}
          <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              Screening Checklist
            </h3>
            <div className="space-y-2">
              {Object.entries(checklist).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setChecklist(prev => ({ ...prev, [key]: !prev[key] }))}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                    ${value ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800 border border-transparent hover:border-slate-700'}
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded flex items-center justify-center
                    ${value ? 'bg-emerald-500 text-white' : 'bg-slate-700'}
                  `}>
                    {value && <Check className="w-3 h-3" />}
                  </div>
                  <span className={`text-sm ${value ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {formatChecklistLabel(key)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Evaluation */}
          {evaluation && (
            <>
              {/* Fit Snapshot */}
              <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Assessment
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {evaluation.fitSnapshot?.oneLineVerdict || evaluation.summary}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${evaluation.fitSnapshot?.matchLevel === 'High'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : evaluation.fitSnapshot?.matchLevel === 'Medium'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }
                  `}>
                    {evaluation.fitSnapshot?.matchLevel || 'Unknown'} Match
                  </span>
                  <span className="text-xs text-slate-500">
                    {evaluation.recommendation}
                  </span>
                </div>
              </div>

              {/* Strengths */}
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-emerald-400 mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {evaluation.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {evaluation.gaps && evaluation.gaps.length > 0 && (
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-400 mb-3">Gaps & Considerations</h3>
                  <ul className="space-y-2">
                    {evaluation.gaps.map((gap, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interview Questions */}
              {evaluation.interviewPointers && evaluation.interviewPointers.length > 0 && (
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Suggested Questions
                  </h3>
                  <ul className="space-y-3">
                    {evaluation.interviewPointers.map((pointer, i) => (
                      <li key={i} className="text-sm">
                        <p className="text-white">{pointer.question}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Area: {pointer.area} - {pointer.reason}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper functions
function formatChecklistLabel(key: string): string {
  const labels: Record<string, string> = {
    skillsMatch: 'Skills match job requirements',
    experienceLevel: 'Experience level appropriate',
    locationFit: 'Location/remote work compatible',
    salaryExpectation: 'Salary expectation discussed',
    availability: 'Availability confirmed'
  };
  return labels[key] || key;
}

// Mock data generators
function generateMockName(): string {
  const firstNames = ['Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley', 'Robert'];
  const lastNames = ['Chen', 'Williams', 'Garcia', 'Johnson', 'Brown', 'Miller', 'Davis', 'Wilson'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateMockTitle(): string {
  const titles = ['Senior Software Engineer', 'Full Stack Developer', 'Engineering Manager', 'Tech Lead', 'Staff Engineer', 'Principal Engineer', 'Frontend Developer', 'Backend Engineer'];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateMockCompany(): string {
  const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Netflix', 'Stripe', 'Airbnb', 'Uber', 'Salesforce'];
  return companies[Math.floor(Math.random() * companies.length)];
}

function generateMockLocation(): string {
  const locations = ['San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Boston, MA', 'Remote', 'Chicago, IL', 'Denver, CO'];
  return locations[Math.floor(Math.random() * locations.length)];
}

function generateMockEvaluation(): CandidateEvaluation {
  return {
    score: Math.floor(Math.random() * 40) + 50,
    recommendation: Math.random() > 0.5 ? 'Yes' : 'Maybe',
    summary: 'Candidate shows strong technical skills and relevant experience.',
    strengths: [
      'Strong background in relevant technologies',
      'Leadership experience at scale',
      'Good communication skills evident from resume'
    ],
    gaps: [
      'Limited experience with specific tech stack',
      'No direct industry experience'
    ],
    redFlags: [],
    dealBreakers: [],
    scoreBreakdown: {
      mustHaveSkills: { score: 35, max: 40, details: 'Meets most requirements' },
      niceToHaveSkills: { score: 12, max: 15, details: 'Some nice-to-haves present' },
      experienceDepth: { score: 15, max: 20, details: 'Good experience depth' },
      constraintMatch: { score: 8, max: 10, details: 'Location and availability match' },
      redFlags: { score: 8, max: 10, details: 'No major red flags' },
      dealBreakers: { score: 5, max: 5, details: 'No deal breakers' },
      culturalSignals: { score: 0, max: 0, details: 'N/A' }
    },
    fitSnapshot: {
      oneLineVerdict: 'Strong candidate with relevant experience, worth interviewing.',
      matchLevel: Math.random() > 0.5 ? 'High' : 'Medium',
      riskLevel: 'Low',
      hiringPriority: Math.random() > 0.5 ? 'Top pick' : 'Consider'
    },
    screeningNotes: {
      overview: 'Solid background with transferable skills.',
      matchesWell: ['Technical skills', 'Years of experience', 'Team leadership'],
      gapsAndLimitations: ['Industry-specific knowledge'],
      risksAndConcerns: 'Minimal concerns identified.',
      positioningToHiringManager: 'Present as a strong technical candidate with growth potential.'
    },
    evidenceGrid: [],
    risksNextSteps: {
      riskSummary: 'Low risk candidate overall.',
      recommendedNextStep: 'Move to phone screen'
    },
    experienceHighlights: [],
    interviewPointers: [
      {
        area: 'Technical depth',
        question: 'Describe your most challenging technical project.',
        reason: 'To assess problem-solving approach'
      },
      {
        area: 'Leadership',
        question: 'How do you handle technical disagreements in your team?',
        reason: 'To understand collaboration style'
      }
    ]
  };
}
