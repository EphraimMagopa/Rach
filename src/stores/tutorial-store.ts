import { create } from 'zustand';

export type TutorialStep =
  | 'welcome'
  | 'create-track'
  | 'add-clip'
  | 'draw-notes'
  | 'play-transport'
  | 'open-mixer'
  | 'adjust-volume'
  | 'add-effect'
  | 'use-ai'
  | 'complete';

export const TUTORIAL_STEPS: TutorialStep[] = [
  'welcome',
  'create-track',
  'add-clip',
  'draw-notes',
  'play-transport',
  'open-mixer',
  'adjust-volume',
  'add-effect',
  'use-ai',
  'complete',
];

const STORAGE_KEY = 'rach-tutorial-completed';

function loadCompletedState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

interface TutorialState {
  isActive: boolean;
  currentStep: TutorialStep;
  completedSteps: Set<TutorialStep>;
  hasCompletedTutorial: boolean;

  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeCurrentStep: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  isActive: false,
  currentStep: 'welcome',
  completedSteps: new Set<TutorialStep>(),
  hasCompletedTutorial: loadCompletedState(),

  startTutorial: () =>
    set({
      isActive: true,
      currentStep: 'welcome',
      completedSteps: new Set(),
    }),

  nextStep: () => {
    const { currentStep, completedSteps } = get();
    const idx = TUTORIAL_STEPS.indexOf(currentStep);
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);

    if (idx >= TUTORIAL_STEPS.length - 1) {
      // Tutorial finished
      try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
      set({
        isActive: false,
        currentStep: 'complete',
        completedSteps: newCompleted,
        hasCompletedTutorial: true,
      });
    } else {
      set({
        currentStep: TUTORIAL_STEPS[idx + 1],
        completedSteps: newCompleted,
      });
    }
  },

  skipTutorial: () => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
    set({
      isActive: false,
      hasCompletedTutorial: true,
    });
  },

  completeCurrentStep: () => {
    const { currentStep } = get();
    get().nextStep();
    // Also mark current as completed (nextStep handles this but being explicit)
    set((state) => {
      const newCompleted = new Set(state.completedSteps);
      newCompleted.add(currentStep);
      return { completedSteps: newCompleted };
    });
  },
}));
