import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Candidate,
  SearchStrategy,
  Job,
  EnhancedIntake,
  RoleCalibration,
  MultiLLMAnalysisState,
  LLMProvider,
  Phase,
  CandidateStatus
} from '../types';

interface AppState {
  // Core Data
  candidates: Candidate[];
  searchStrategy: SearchStrategy | null; // User snippet called this sourcingStrategy, but types has SearchStrategy
  sourcingStrategy: SearchStrategy | null; // Alias for compatibility if needed
  currentJob: Job | null;
  enhancedIntake: EnhancedIntake | null;
  roleCalibration: RoleCalibration | null;
  multiLLMAnalysis: MultiLLMAnalysisState | null;

  // UI State
  isAnalyzing: boolean;
  isGeneratingStrategy: boolean;
  isEvaluatingAll: boolean;
  selectedLLM: LLMProvider;
  phase: Phase;

  // Actions
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  toggleStar: (id: string) => void;
  markReachedOut: (id: string) => void;
  updateCandidateStatus: (id: string, status: CandidateStatus) => void;
  reorderCandidates: (orderedIds: string[]) => void;

  setSearchStrategy: (strategy: SearchStrategy | null) => void;
  setGeneratingStrategy: (value: boolean) => void;

  setCurrentJob: (job: Job | null) => void;
  updateCurrentJob: (updates: Partial<Job>) => void;
  setEnhancedIntake: (intake: EnhancedIntake | null) => void;
  setRoleCalibration: (calibration: RoleCalibration | null) => void;
  setMultiLLMAnalysis: (analysis: MultiLLMAnalysisState | null) => void;

  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setEvaluatingAll: (value: boolean) => void;
  setSelectedLLM: (llm: LLMProvider) => void;
  setPhase: (phase: Phase) => void;

  reset: () => void;
  resetAll: () => void; // User requested this name
}

const initialState = {
  candidates: [],
  searchStrategy: null,
  sourcingStrategy: null,
  currentJob: null,
  enhancedIntake: null,
  roleCalibration: null,
  multiLLMAnalysis: null,
  isAnalyzing: false,
  isGeneratingStrategy: false,
  isEvaluatingAll: false,
  selectedLLM: 'anthropic' as LLMProvider,
  phase: 'upload-job' as Phase,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      addCandidate: (candidate) =>
        set((state) => ({ candidates: [...state.candidates, candidate] })),

      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, ...updates } : c
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
            c.id === id ? { ...c, hasReachedOut: true } : c
          ),
        })),

      updateCandidateStatus: (id, status) =>
        set((state) => ({
          candidates: state.candidates.map((c) =>
            c.id === id ? { ...c, status } : c
          ),
        })),

      reorderCandidates: (orderedIds) =>
        set((state) => {
          const candidateMap = new Map(state.candidates.map(c => [c.id, c]));
          const newCandidates = orderedIds
            .map(id => candidateMap.get(id))
            .filter((c): c is Candidate => !!c);

          // Append any candidates that weren't in the ordered list (safety check)
          state.candidates.forEach(c => {
            if (!newCandidates.find(nc => nc.id === c.id)) {
              newCandidates.push(c);
            }
          });

          return { candidates: newCandidates };
        }),

      setSearchStrategy: (strategy) => set({ searchStrategy: strategy, sourcingStrategy: strategy }),
      setGeneratingStrategy: (value) => set({ isGeneratingStrategy: value }),

      setCurrentJob: (job) => set({ currentJob: job }),
      updateCurrentJob: (updates) =>
        set((state) => ({
          currentJob: state.currentJob ? { ...state.currentJob, ...updates } : null
        })),
      setEnhancedIntake: (intake) => set({ enhancedIntake: intake }),
      setRoleCalibration: (calibration) => set({ roleCalibration: calibration }),
      setMultiLLMAnalysis: (analysis) => set({ multiLLMAnalysis: analysis }),

      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setEvaluatingAll: (value) => set({ isEvaluatingAll: value }),
      setSelectedLLM: (llm) => set({ selectedLLM: llm }),
      setPhase: (phase) => set({ phase }),

      reset: () => set(initialState),
      resetAll: () => set(initialState),
    }),
    {
      name: 'project-lotus-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        candidates: state.candidates,
        searchStrategy: state.searchStrategy,
        sourcingStrategy: state.sourcingStrategy,
        currentJob: state.currentJob,
        enhancedIntake: state.enhancedIntake,
        roleCalibration: state.roleCalibration,
        phase: state.phase, // Persist phase too? Maybe.
        selectedLLM: state.selectedLLM
      }),
    }
  )
);
