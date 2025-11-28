import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, Candidate, CandidateStatus, EnhancedIntake, SearchStrategy } from '../types';

type Phase = 'upload-job' | 'analyze-job' | 'upload-candidates' | 'results';

interface AppState {
  // Current phase
  phase: Phase;
  setPhase: (phase: Phase) => void;

  // Current job being worked on
  currentJob: Job | null;
  setCurrentJob: (job: Job | null) => void;
  updateCurrentJob: (updates: Partial<Job>) => void;

  // Enhanced intake (structured form from JD)
  enhancedIntake: EnhancedIntake | null;
  setEnhancedIntake: (intake: EnhancedIntake | null) => void;
  updateEnhancedIntake: (updates: Partial<EnhancedIntake>) => void;

  // Search strategy (LinkedIn sourcing strategy)
  searchStrategy: SearchStrategy | null;
  setSearchStrategy: (strategy: SearchStrategy | null) => void;
  isGeneratingStrategy: boolean;
  setGeneratingStrategy: (value: boolean) => void;

  // Candidates for current job
  candidates: Candidate[];
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  toggleStar: (id: string) => void;
  markReachedOut: (id: string) => void;
  updateCandidateStatus: (id: string, status: CandidateStatus) => void;
  reorderCandidates: (orderedIds: string[]) => void;

  // Evaluation state
  isEvaluatingAll: boolean;
  setEvaluatingAll: (value: boolean) => void;

  // Reset everything
  reset: () => void;
}

const initialState = {
  phase: 'upload-job' as Phase,
  currentJob: null as Job | null,
  enhancedIntake: null as EnhancedIntake | null,
  searchStrategy: null as SearchStrategy | null,
  isGeneratingStrategy: false,
  candidates: [] as Candidate[],
  isEvaluatingAll: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setPhase: (phase) => set({ phase }),

      setCurrentJob: (job) => set({ currentJob: job }),

      updateCurrentJob: (updates) =>
        set((state) => ({
          currentJob: state.currentJob
            ? { ...state.currentJob, ...updates, updatedAt: new Date() }
            : null,
        })),

      // Enhanced intake setters
      setEnhancedIntake: (intake) => set({ enhancedIntake: intake }),

      updateEnhancedIntake: (updates) =>
        set((state) => ({
          enhancedIntake: state.enhancedIntake
            ? { ...state.enhancedIntake, ...updates }
            : null,
        })),

      // Search strategy setters
      setSearchStrategy: (strategy) => set({ searchStrategy: strategy }),

      setGeneratingStrategy: (isGeneratingStrategy) => set({ isGeneratingStrategy }),

      addCandidate: (candidate) =>
        set((state) => ({
          candidates: [...state.candidates, candidate],
        })),

      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
        })),

      removeCandidate: (id) =>
        set((state) => ({
          candidates: state.candidates.filter((c) => c.id !== id),
        })),

      toggleStar: (id) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, isStarred: !c.isStarred } : c
          ),
        })),

      markReachedOut: (id) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, hasReachedOut: true, updatedAt: new Date() } : c
          ),
        })),

      updateCandidateStatus: (id, status) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, status, updatedAt: new Date() } : c
          ),
        })),

      reorderCandidates: (orderedIds) =>
        set((state) => {
          const candidateMap = new Map(state.candidates.map((c) => [c.id, c]));
          const reordered = orderedIds
            .map((id) => candidateMap.get(id))
            .filter((c): c is Candidate => c !== undefined);
          // Add any candidates not in orderedIds at the end
          const remaining = state.candidates.filter((c) => !orderedIds.includes(c.id));
          return { candidates: [...reordered, ...remaining] };
        }),

      setEvaluatingAll: (isEvaluatingAll) => set({ isEvaluatingAll }),

      reset: () => set(initialState),
    }),
    {
      name: 'recruiter-ai-storage',
      partialize: (state) => ({
        phase: state.phase,
        currentJob: state.currentJob,
        enhancedIntake: state.enhancedIntake,
        searchStrategy: state.searchStrategy,
        candidates: state.candidates,
      }),
    }
  )
);
