import { create } from 'zustand';

// Define the shape of the data for a single cycle
export interface CycleState {
  // Prime
  prime: string;

  // Learn
  learn_rating: number | null; // User's 1-10 rating

  // Improve
  improve: string;

  // Commit
  commit: string;

  // --- Internal State ---
  // Tracks which step the user is on
  currentStep: 'prime' | 'learn' | 'improve' | 'commit' | 'visualize';

  // Tracks if data is being saved to the backend
  isSaving: boolean;
}

// Define the actions that can modify the state
export interface CycleActions {
  setPrime: (prime: string) => void;
  setLearnRating: (rating: number) => void;
  setImprove: (improve: string) => void;
  setCommit: (commit: string) => void;

  // Navigation/Saving actions
  setCurrentStep: (step: CycleState['currentStep']) => void;
  setIsSaving: (saving: boolean) => void;

  // Reset the store for the next cycle
  resetCycle: () => void;
}

// Define the initial state
const initialState: CycleState = {
  prime: '',
  learn_rating: null,
  improve: '',
  commit: '',
  currentStep: 'prime',
  isSaving: false,
};

// Create the hook
export const useAireStore = create<CycleState & CycleActions>((set) => ({
  ...initialState,

  // Actions
  setPrime: (prime) => set({ prime }),
  setLearnRating: (rating) => set({ learn_rating: rating }),
  setImprove: (improve) => set({ improve }),
  setCommit: (commit) => set({ commit }),

  setCurrentStep: (step) => set({ currentStep: step }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  resetCycle: () => set(initialState),
}));