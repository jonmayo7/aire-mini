import { create } from 'zustand';
// Import the persist middleware
import { persist } from 'zustand/middleware';

// Define the shape of the data for a single cycle
export interface CycleState {
  prime: string;
  learn_rating: number | null; // User's 1-10 rating
  improve: string;
  commit: string;
  currentStep: 'prime' | 'improve' | 'commit' | 'visualize'; // Removed 'learn' step
  isSaving: boolean;
}

// Define the actions that can modify the state
export interface CycleActions {
  setPrime: (prime: string) => void;
  setLearnRating: (rating: number | null) => void; // Allow null for reset
  setImprove: (improve: string) => void;
  setCommit: (commit: string) => void;
  setCurrentStep: (step: CycleState['currentStep']) => void;
  setIsSaving: (saving: boolean) => void;
  resetCycle: () => void;
}

// Define the initial state (remains the same)
const initialState: CycleState = {
  prime: '',
  learn_rating: null,
  improve: '',
  commit: '',
  currentStep: 'prime', // Start at prime
  isSaving: false,
};

// Create the hook, wrapped with persist middleware
export const useAireStore = create<CycleState & CycleActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Actions (remain mostly the same)
      setPrime: (prime) => set({ prime }),
      // Allow setting learn_rating back to null during reset
      setLearnRating: (rating) => set({ learn_rating: rating }),
      setImprove: (improve) => set({ improve }),
      setCommit: (commit) => set({ commit }),

      setCurrentStep: (step) => set({ currentStep: step }),
      setIsSaving: (saving) => set({ isSaving: saving }),

      // Reset now needs to clear persisted state correctly
      // We only reset the fields that are *not* persisted automatically on load
      resetCycle: () => set({
        prime: '', // Explicitly clear persisted fields too
        learn_rating: null,
        improve: '',
        commit: '',
        currentStep: 'prime', // Reset step
        isSaving: false, // Reset saving state
      }),
    }),
    {
      // --- Configuration for persist middleware ---
      name: 'aire-cycle-storage', // Unique name for localStorage key
      // Specify which parts of the state to persist
      partialize: (state) => ({
        prime: state.prime,
        learn_rating: state.learn_rating,
        improve: state.improve,
        commit: state.commit,
      }),
      // --- End Configuration ---
    }
  )
);