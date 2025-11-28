// ============================================
// JOB ENTITY - Core job posting structure
// ============================================
export type JobStatus = 'draft' | 'open' | 'on_hold' | 'closed';

export type WorkMode = 'on-site' | 'hybrid' | 'remote';

export interface Job {
  id: string;
  title: string;
  company: string;
  department: string | null;
  location: string | null;
  workMode: WorkMode;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  salaryMin: number | null;
  salaryMax: number | null;
  hiringManager: string | null;
  status: JobStatus;

  // Job description
  rawDescription: string;

  // Requirements (structured)
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  dealBreakers: string[];
  areasToAssess: string[];
  certifications: string[]; // Required certifications from JD

  // Legacy/compatibility
  requiresSponsorship: boolean | null;
  minYearsExperience: number;
  notes: string;

  // Enhanced JD extraction fields
  hiringManagerTitle: string | null; // Who does this role report to
  executiveSummary: string | null; // ELI5 summary of what this person will do

  // Intake completeness tracking
  intakeCompleteness: number; // 0-100

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CANDIDATE ENTITY - Resume and profile data
// ============================================
export type CandidateStatus = 'new' | 'contacted' | 'interviewing' | 'rejected' | 'hired';

export interface Candidate {
  id: string;
  jobId: string;

  // Basic info
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;

  // Current position
  currentJobTitle: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;

  // Resume data
  rawResume: string;
  fileName: string;
  resumeFileUrl: string | null;

  // Processing status
  status: CandidateStatus;
  isProcessing: boolean;
  processingError: string | null;

  // Match data (populated after evaluation)
  matchScore: number | null;
  matchLabel: 'high' | 'medium' | 'low' | null;
  evaluation: CandidateEvaluation | null;
  isEvaluating: boolean;

  // Outreach
  outreachEmail: string | null;
  outreachDraft: EmailDraft | null;
  hasReachedOut: boolean;

  // UI state
  isStarred: boolean;
  manualRank: number | null;

  // Legacy
  requiresSponsorship: boolean | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MATCH BREAKDOWN - Per-requirement matching
// ============================================
export interface RequirementMatch {
  requirement: string;
  status: 'met' | 'partially_met' | 'not_met';
  explanation: string;
  evidence: string | null;
}

export interface JobCandidateMatch {
  id: string;
  jobId: string;
  candidateId: string;

  // Overall score
  matchScore: number;
  matchLabel: 'high' | 'medium' | 'low';

  // Per-requirement breakdown
  mustHaveMatches: RequirementMatch[];
  niceToHaveMatches: RequirementMatch[];

  // Deal breakers
  dealBreakerTriggered: boolean;
  dealBreakerReasons: string[];

  // Summary lists
  strengths: string[];
  risks: string[];
  areasToAssess: string[];

  // Timestamps
  createdAt: Date;
}

// ============================================
// EVALUATION - AI-generated analysis
// ============================================
export interface ScoreBreakdown {
  mustHaveSkills: { score: number; max: number; details: string };
  niceToHaveSkills: { score: number; max: number; details: string };
  experienceDepth: { score: number; max: number; details: string };
  constraintMatch: { score: number; max: number; details: string };
  redFlags: { score: number; max: number; details: string };
  dealBreakers: { score: number; max: number; details: string };
  culturalSignals: { score: number; max: number; details: string };
}

export interface EvidenceItem {
  requirement: string;
  evidence: string;
  fit: 'match' | 'partial' | 'gap' | 'blocker';
}

export interface ScreeningNotes {
  overview: string;
  matchesWell: string[];
  gapsAndLimitations: string[];
  risksAndConcerns: string;
  positioningToHiringManager: string;
}

export interface FitSnapshot {
  oneLineVerdict: string;
  matchLevel: 'High' | 'Medium' | 'Low';
  riskLevel: 'Low' | 'Medium' | 'High';
  hiringPriority: 'Top pick' | 'Consider' | 'Backup' | 'Pass';
}

export interface RisksNextSteps {
  riskSummary: string;
  recommendedNextStep: string;
}

export interface ExperienceHighlight {
  role: string;
  company: string;
  duration: string;
  highlights: string[];
  relevantSkills: string[];
}

export interface InterviewPointer {
  area: string;
  question: string;
  reason: string;
}

// ============================================
// SCREENING SCRIPT - Recruiter call guide
// ============================================
export interface ScreeningScript {
  theHook: string; // Personalized opening for the recruiter
  verificationQuestions: string[]; // Questions to verify skills without clear evidence
  gapProbes: string[]; // Questions to explore gaps
  logisticsCheck: string; // Question about location/salary/visa constraints
}

// ============================================
// CANDIDATE PROFILE - Extracted from resume
// ============================================
export interface CandidateProfile {
  fullName: string;
  firstName: string;
  lastName: string;
  currentTitle: string;
  currentEmployer: string;
  location: string;
  labels: string[]; // e.g., ['Contract Candidate', 'Frequent Job Changes Noted']
}

// ============================================
// REQUIREMENTS MATCH - Per-skill evaluation
// ============================================
export interface SkillMatchDetail {
  skill: string;
  status: 'Met' | 'Partially Met' | 'Not Met';
  evidence: string;
}

export interface RequirementsMatch {
  mustHaveMatchPercent: number;
  niceToHaveMatchPercent: number;
  mustHaveDetails: SkillMatchDetail[];
  niceToHaveDetails: SkillMatchDetail[];
}

// ============================================
// EXPERIENCE RELEVANCE - Last 7-8 years focus
// ============================================
export interface ExperienceRelevance {
  yearsRelevant: string;
  relevantRoles: string[];
  relevantProjects: string[];
  gaps: string[];
}

// ============================================
// RECRUITER RECOMMENDATION - Final call
// ============================================
export interface RecruiterRecommendation {
  action: 'Move to phone screen' | 'Keep warm in pipeline' | 'Reject';
  reasoning: string;
  fitScoreSummary: string;
}

// ============================================
// PATTERN FLAGS - Behavioral pattern detection
// ============================================
export interface PatternFlags {
  isJobHopper: boolean;
  isContractor: boolean;
  flagReason: string | null; // e.g., "4 jobs in 5 years, avg tenure 1.1 yrs"
}

export interface CandidateEvaluation {
  score: number;
  recommendation: 'Strong Yes' | 'Yes' | 'Maybe' | 'Lean No' | 'No';
  summary: string;

  // Candidate profile extracted from resume (Section 1)
  candidateProfile?: CandidateProfile;

  // Pattern detection (PRISHA)
  flags?: PatternFlags;

  // Requirements matching (Sections 2-3)
  requirementsMatch?: RequirementsMatch;

  // Experience relevance - last 7-8 years (Section 4)
  experienceRelevance?: ExperienceRelevance;

  // Lists (Sections 5-8)
  strengths: string[];
  gaps: string[];
  weaknesses?: string[];
  redFlags: string[];
  dealBreakers: string[];

  // Score breakdown
  scoreBreakdown: ScoreBreakdown;

  // Enhanced fields
  fitSnapshot: FitSnapshot;
  screeningNotes: ScreeningNotes;
  evidenceGrid: EvidenceItem[];
  risksNextSteps: RisksNextSteps;

  // Recruiter recommendation (Section 11)
  recruiterRecommendation?: RecruiterRecommendation;

  // Experience and interview guidance
  experienceHighlights: ExperienceHighlight[];
  interviewPointers: InterviewPointer[];

  // Personalized screening script for recruiters
  screeningScript?: ScreeningScript;
}

// ============================================
// EMAIL DRAFT - Generated outreach
// ============================================
export interface EmailDraft {
  id: string;
  jobId: string;
  candidateId: string;
  subject: string;
  body: string;
  tone: 'casual' | 'professional' | 'excited';
  personalizationPoints: string[];
  createdAt: Date;
}

export interface PersonalizedMessage {
  subject: string;
  body: string;
  tone: 'excited' | 'curious' | 'cautious' | 'decline';
  screeningQuestions: string[];
}

// ============================================
// APP STATE & NAVIGATION
// ============================================
export type AppView =
  | 'jobs-dashboard'
  | 'job-intake'
  | 'job-candidates'
  | 'candidate-detail';

export interface NavigationState {
  view: AppView;
  selectedJobId: string | null;
  selectedCandidateId: string | null;
}

export interface AppState {
  // Navigation
  navigation: NavigationState;

  // Data
  jobs: Job[];
  candidates: Candidate[];

  // UI state
  isDarkMode: boolean;
  isLoading: boolean;
  isEvaluatingAll: boolean;

  // Legacy compatibility
  phase: 'create-job' | 'drop-candidates' | 'reveal';
  currentJob: Job | null;

  // Navigation actions
  navigateTo: (view: AppView, jobId?: string, candidateId?: string) => void;

  // Job actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  setCurrentJob: (job: Job | null) => void;

  // Candidate actions
  addCandidate: (candidate: Candidate) => void;
  addCandidates: (candidates: Candidate[]) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  reorderCandidates: (candidates: Candidate[]) => void;
  toggleStar: (id: string) => void;
  markReachedOut: (id: string) => void;
  updateCandidateStatus: (id: string, status: CandidateStatus) => void;

  // UI actions
  setDarkMode: (isDark: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setEvaluatingAll: (isEvaluating: boolean) => void;
  setPhase: (phase: 'create-job' | 'drop-candidates' | 'reveal') => void;

  // Utility
  reset: () => void;
  getJobById: (id: string) => Job | undefined;
  getCandidatesForJob: (jobId: string) => Candidate[];
}

// ============================================
// FILTER & SEARCH
// ============================================
export interface JobFilters {
  search: string;
  status: JobStatus | 'all';
  department: string | 'all';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export interface CandidateFilters {
  search: string;
  matchLevel: 'all' | 'high' | 'medium' | 'low';
  status: CandidateStatus | 'all';
  location: string | 'all';
}

export type CandidateSortBy = 'match_score' | 'name' | 'years_experience' | 'created_at';
export type SortOrder = 'asc' | 'desc';

// ============================================
// ENHANCED INTAKE - Structured job intake form
// ============================================
export type SeniorityLevel = 'Junior' | 'Mid' | 'Senior' | 'Staff' | 'Principal' | 'Director' | 'VP' | 'C-Level';

export interface DomainContext {
  industry: string; // e.g., "Financial Services", "Healthcare", "Technology"
  productType: string; // e.g., "B2B SaaS", "Consumer Mobile", "Enterprise Platform"
  teamSize: string | null; // e.g., "5-10 engineers", "Large org (100+)"
  reportingTo: string | null; // e.g., "VP of Engineering", "CTO"
}

export interface EnhancedIntake {
  // Titles
  primaryTitle: string;
  alternateTitles: string[];
  seniorityLevel: SeniorityLevel;

  // Location & Work Model
  locations: string[];
  workModel: 'onsite' | 'hybrid' | 'remote' | 'flexible';
  willingToRelocate: boolean | null;

  // Skills (mirrors Job but can be refined)
  mustHaveSkills: string[];
  niceToHaveSkills: string[];

  // Domain context
  domainContext: DomainContext;

  // Target companies (inferred from JD or added by recruiter)
  targetCompanies: string[];
  competitorCompanies: string[];

  // Experience range
  yearsOfExperienceMin: number;
  yearsOfExperienceMax: number;

  // Compensation (if known)
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;

  // Additional context
  keyResponsibilities: string[];
  hiringUrgency: 'Immediate' | 'Within 30 days' | 'Within 90 days' | 'Evergreen' | null;
}

// ============================================
// SEARCH STRATEGY - LinkedIn sourcing strategy
// ============================================
export interface TargetCompanyTier {
  company: string;
  reason: string;
}

export interface SearchStrategy {
  // Target companies by tier
  targetCompanies: {
    tier1: TargetCompanyTier[]; // Best fit - prioritize these
    tier2: TargetCompanyTier[]; // Good fit - secondary priority
    tier3: TargetCompanyTier[]; // Worth exploring
  };

  // Titles to search for
  recommendedTitles: string[];

  // Experience band
  yearsOfExperience: {
    min: number;
    max: number;
  };

  // Locations to target
  locations: string[];

  // Keywords for search
  mustHaveKeywords: string[];
  niceToHaveKeywords: string[];
  excludeKeywords: string[];

  // Ready-to-use Boolean search strings for LinkedIn
  booleanSearchStrings: {
    query: string;
    description: string; // e.g., "Broad search for senior engineers"
  }[];

  // Search tips
  searchTips: string[];

  // Generated timestamp
  generatedAt: Date;
}
