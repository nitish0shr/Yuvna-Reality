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

  // Career journey for timeline visualization
  careerJourney?: Array<{
    company: string;
    role: string;
    startYear: number;
    endYear: number | 'Present';
    type: 'Growth' | 'Pivot' | 'Tenure';
  }>;
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
// ROLE CALIBRATION - Market sense and difficulty assessment
// ============================================
export type RoleDifficulty = 'easy' | 'moderate' | 'hard' | 'very_hard';

export interface RoleCalibration {
  difficulty: RoleDifficulty;
  difficultyScore: number; // 1-10
  difficultyRating?: number; // Alias for difficultyScore (for UI compatibility)
  marketSupply?: string; // "abundant" | "moderate" | "limited" | "scarce"
  calibrationNotes: string[];
  marketInsights: {
    salaryAssessment: string | null; // e.g., "Below market for this experience level"
    skillDemand: string; // e.g., "High demand skills, competitive market"
    locationImpact: string; // e.g., "Remote option significantly increases candidate pool"
    experienceMatch: string; // e.g., "Experience requirements align with title level"
  };
  redFlags: string[]; // e.g., ["Senior expectations with junior salary range"]
  suggestions: string[]; // e.g., ["Consider raising salary range by 15-20%"]
  timeToFill?: string; // Alias for timeToFillEstimate
  timeToFillEstimate: string; // e.g., "4-6 weeks with current requirements"
}

// ============================================
// EMPLOYER BRANDING - Why candidates should care
// ============================================
export interface EmployerBranding {
  valueProposition: string; // Main pitch for why this role is compelling
  sellingPoints: string[]; // 3-5 key reasons to join
  differentiators: string[]; // What makes this role/company unique
  targetPersonaAppeal: {
    technicalAppeal: string[]; // For engineering roles
    careerAppeal: string[]; // Growth opportunities
    cultureAppeal: string[]; // Work environment
  };
  suggestedOutreachTone: 'technical' | 'career-growth' | 'mission-driven' | 'culture-focused';
}

// ============================================
// IDEAL CANDIDATE PERSONA - Who we're looking for
// ============================================
export interface IdealCandidatePersona {
  // Background profile
  backgroundProfile: {
    typicalTitles: string[]; // Current/recent titles they'd hold
    typicalCompanies: string[]; // Types of companies they'd come from
    careerStage: string; // e.g., "Mid-career professional seeking senior IC role"
    industryBackground: string[]; // Industries they'd have experience in
  };

  // Career motivations - what would attract them
  careerMotivations: {
    primaryDrivers: string[]; // e.g., "Technical challenge", "Career growth", "Impact"
    dealMakers: string[]; // What would make them say yes
    dealBreakers: string[]; // What would make them decline
  };

  // Skills & experience profile
  skillsProfile: {
    coreCompetencies: string[]; // Must-have technical skills
    adjacentSkills: string[]; // Related skills they'd likely have
    experiencePatterns: string[]; // e.g., "Built systems from scratch", "Led small teams"
  };

  // Behavioral indicators
  behavioralIndicators: {
    linkedInSignals: string[]; // What to look for on their profile
    resumePatterns: string[]; // What their resume would show
    redFlags: string[]; // Warning signs this isn't the right persona
  };

  // Outreach personalization
  outreachHooks: string[]; // Conversation starters that would resonate
}

// ============================================
// SOURCING RED FLAGS - Patterns to watch during sourcing
// ============================================
export interface SourcingRedFlags {
  patternsToAvoid: string[]; // e.g., "Candidates with only agency/consulting background"
  warningSignals: string[]; // e.g., "Short tenures under 1 year at multiple companies"
  dealBreakerIndicators: string[]; // e.g., "No hands-on experience in last 3 years"
  industryMismatches: string[]; // Industries that might not transfer well
}

// ============================================
// RESUME QUALITY - Parsing confidence and completeness
// ============================================
export interface ResumeQuality {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  completeness: {
    hasName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasLocation: boolean;
    hasCurrentTitle: boolean;
    hasWorkHistory: boolean;
    hasDates: boolean;
    hasSkills: boolean;
  };
  missingFields: string[];
  warnings: string[]; // e.g., "Dates are inconsistent", "PDF contains artifacts"
  parseConfidence: number; // How confident we are in the parsing accuracy
}

// ============================================
// EMPLOYMENT GAP - Gap detection in career history
// ============================================
export interface EmploymentGap {
  startDate: string;
  endDate: string;
  durationMonths: number;
  significance: 'minor' | 'notable' | 'significant'; // <3mo, 3-6mo, >6mo
  potentialReasons?: string; // Inferred if possible
}

// ============================================
// CANDIDATE COMPARISON - Side-by-side comparison
// ============================================
export interface CandidateComparison {
  candidates: string[]; // Candidate IDs being compared
  comparisonData: {
    candidateId: string;
    name: string;
    score: number;
    recommendation: string;
    keyStrengths: string[];
    keyGaps: string[];
    yearsExperience: number | null;
    currentCompany: string | null;
    locationMatch: boolean;
    salaryFit: 'unknown' | 'likely_fit' | 'likely_high' | 'likely_low';
    sponsorshipStatus: 'not_needed' | 'needed' | 'unknown';
  }[];
  winner: string | null; // Best candidate ID
  analysis: string; // Summary comparison
}

// ============================================
// CONSTRAINT MATCH - Explicit constraint checking
// ============================================
export interface ConstraintMatch {
  location: {
    status: 'match' | 'partial' | 'mismatch' | 'unknown';
    candidateLocation: string | null;
    jobLocation: string | null;
    notes: string;
  };
  workMode: {
    status: 'match' | 'partial' | 'mismatch' | 'unknown';
    candidatePreference: string | null;
    jobRequirement: string;
    notes: string;
  };
  sponsorship: {
    status: 'match' | 'mismatch' | 'unknown';
    candidateNeeds: boolean | null;
    companyOffers: boolean | null;
    notes: string;
  };
  salary: {
    status: 'match' | 'partial' | 'mismatch' | 'unknown';
    candidateExpectation: number | null;
    jobRange: { min: number | null; max: number | null };
    notes: string;
  };
  experience: {
    status: 'match' | 'partial' | 'mismatch';
    candidateYears: number | null;
    requiredYears: number;
    notes: string;
  };
}

// ============================================
// EVALUATION CONFIDENCE - How certain is the AI
// ============================================
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface EvaluationConfidence {
  overall: ConfidenceLevel;
  score: number; // 0-100
  factors: {
    resumeQuality: ConfidenceLevel;
    skillMatchClarity: ConfidenceLevel;
    experienceVerifiability: ConfidenceLevel;
    dataCompleteness: ConfidenceLevel;
  };
  caveats: string[]; // e.g., "Limited work history details"
}

// ============================================
// CAREER TIMELINE - Enhanced timeline with gaps
// ============================================
export interface CareerTimelineEntry {
  company: string;
  role: string;
  startYear: number;
  startMonth?: number;
  endYear: number | 'Present';
  endMonth?: number;
  type: 'Growth' | 'Pivot' | 'Tenure' | 'Gap';
  durationMonths: number;
  isCurrentRole: boolean;
}

export interface CareerTimeline {
  entries: CareerTimelineEntry[];
  gaps: EmploymentGap[];
  totalYearsExperience: number;
  averageTenure: number; // In months
  longestTenure: number; // In months
  isJobHopper: boolean;
  careerProgression: 'upward' | 'lateral' | 'mixed' | 'unclear';
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

// ============================================
// LLM & AI TYPES
// ============================================
export type LLMProvider = 'openai' | 'anthropic' | 'gemini';

export interface MultiLLMResult<T> {
  provider: LLMProvider;
  result: T | null;
  error: string | null;
}

export interface MultiLLMJobAnalysis {
  combinedJob: Partial<Job>;
  providerResults: MultiLLMResult<Partial<Job>>[];
  confidence: {
    title: number;
    skills: number;
    overall: number;
  };
}

export type MultiLLMAnalysisState = MultiLLMJobAnalysis;

// ============================================
// APP PHASE
// ============================================
export type Phase = 'upload-job' | 'analyze-job' | 'upload-candidates' | 'results';
