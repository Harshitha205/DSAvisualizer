// ============================================
// ANIMATION ENGINE - Type Definitions
// ============================================

export type StepType =
    | "compare"
    | "swap"
    | "set"
    | "mark_sorted"
    | "mark_pivot"
    | "mark_default"
    | "complete";

export type ElementState = "default" | "comparing" | "swapping" | "sorted" | "pivot";

// Single array element snapshot
export interface ArrayElement {
    value: number;
    state: ElementState;
}

// Animation step representing a single action
export interface AnimationStep {
    id: number;
    type: StepType;
    indices: number[];           // Indices involved in this step
    description: string;         // Human-readable description
    arraySnapshot: ArrayElement[]; // Full array state at this step
    highlightIndices: number[];  // Indices to highlight
    stats: {
        comparisons: number;
        swaps: number;
    };
}

// Animation event for real-time tracking
export interface AnimationEvent {
    type: StepType;
    indices: number[];
    timestamp: number;
}

// Playback state
export type PlaybackState = "idle" | "playing" | "paused" | "complete";

// Animation engine state
export interface AnimationEngineState {
    // Step data
    steps: AnimationStep[];
    currentStepIndex: number;

    // Playback
    playbackState: PlaybackState;
    speed: number;              // Interval in ms (lower = faster)
    isGenerating: boolean;

    // Current display state
    displayArray: ArrayElement[];

    // Stats
    totalComparisons: number;
    totalSwaps: number;

    // Events log
    events: AnimationEvent[];
}

// Animation engine actions
export interface AnimationEngineActions {
    // Step generation
    generateSteps: (algorithm: string, array: number[]) => void;
    clearSteps: () => void;

    // Playback controls
    play: () => void;
    pause: () => void;
    reset: () => void;

    // Step navigation
    nextStep: () => void;
    previousStep: () => void;
    goToStep: (index: number) => void;

    // Settings
    setSpeed: (speed: number) => void;

    // State getters
    getCurrentStep: () => AnimationStep | null;
    getProgress: () => number;
    canGoNext: () => boolean;
    canGoPrevious: () => boolean;
}

export type AnimationEngine = AnimationEngineState & AnimationEngineActions;
