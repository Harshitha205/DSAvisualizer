import { create } from "zustand";

// ============================================
// TYPES
// ============================================

export type AlgorithmType = "bubble" | "selection" | "insertion" | "merge" | "quick" | "heap";
export type VisualizationMode = "2d" | "3d";
export type ElementState = "default" | "comparing" | "swapping" | "sorted" | "pivot";

// Swap animation phases
export type SwapPhase = "idle" | "lift" | "slide" | "settle";

interface ArrayElement {
    value: number;
    state: ElementState;
    // Swap animation properties
    swapTargetIndex?: number;  // Target index to swap with
    swapPhase?: SwapPhase;     // Current phase of swap animation
}

interface SwapAnimation {
    indexA: number;
    indexB: number;
    phase: SwapPhase;
    startTime: number;
}

interface VisualizationState {
    // Array data
    array: ArrayElement[];
    originalArray: number[];

    // Visualization settings
    arraySize: number;
    speed: number;
    mode: VisualizationMode;

    // Algorithm state
    currentAlgorithm: AlgorithmType;
    isRunning: boolean;
    isPaused: boolean;
    isSorted: boolean;

    // Active swap animation
    activeSwap: SwapAnimation | null;

    // Stats
    comparisons: number;
    swaps: number;

    // Actions
    setArray: (arr: number[]) => void;
    generateNewArray: () => void;
    setArraySize: (size: number) => void;
    setSpeed: (speed: number) => void;
    setMode: (mode: VisualizationMode) => void;
    setAlgorithm: (algo: AlgorithmType) => void;
    setIsRunning: (running: boolean) => void;
    setIsPaused: (paused: boolean) => void;
    setIsSorted: (sorted: boolean) => void;
    updateElement: (index: number, element: Partial<ArrayElement>) => void;
    swapElements: (i: number, j: number) => void;

    // Animated swap actions
    startSwapAnimation: (indexA: number, indexB: number) => void;
    setSwapPhase: (phase: SwapPhase) => void;
    completeSwapAnimation: () => void;

    incrementComparisons: () => void;
    incrementSwaps: () => void;
    resetStats: () => void;
    resetArray: () => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateRandomArray = (size: number): number[] => {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
};

// ============================================
// ANIMATED SWAP FUNCTION
// This is the main reusable swap animation function
// ============================================

export async function animatedSwap(
    indexA: number,
    indexB: number,
    store: VisualizationState
): Promise<void> {
    const { speed } = store;

    // Calculate phase durations based on speed
    // Total animation = lift (25%) + slide (50%) + settle (25%)
    const liftDuration = Math.max(speed * 0.25, 80);
    const slideDuration = Math.max(speed * 0.5, 150);
    const settleDuration = Math.max(speed * 0.25, 80);

    // Phase 1: LIFT - Both bars rise up
    store.startSwapAnimation(indexA, indexB);
    store.setSwapPhase("lift");
    await delay(liftDuration);

    // Phase 2: SLIDE - Bars move horizontally to each other's position
    store.setSwapPhase("slide");
    await delay(slideDuration);

    // Phase 3: SETTLE - Bars drop down and complete swap
    store.setSwapPhase("settle");

    // Actually swap the values in the array
    store.swapElements(indexA, indexB);
    store.incrementSwaps();

    await delay(settleDuration);

    // Complete animation
    store.completeSwapAnimation();
}

// Helper delay function
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useVisualizationStore = create<VisualizationState>((set, get) => ({
    // Initial state
    array: [],
    originalArray: [],
    arraySize: 20,
    speed: 500,
    mode: "3d",
    currentAlgorithm: "bubble",
    isRunning: false,
    isPaused: false,
    isSorted: false,
    activeSwap: null,
    comparisons: 0,
    swaps: 0,

    // Actions
    setArray: (arr) => set({
        array: arr.map(value => ({
            value,
            state: "default" as const,
            swapPhase: "idle" as const,
        })),
        originalArray: [...arr],
        isSorted: false,
    }),

    generateNewArray: () => {
        const { arraySize } = get();
        const newArray = generateRandomArray(arraySize);
        set({
            array: newArray.map(value => ({
                value,
                state: "default" as const,
                swapPhase: "idle" as const,
            })),
            originalArray: [...newArray],
            isSorted: false,
            comparisons: 0,
            swaps: 0,
            activeSwap: null,
        });
    },

    setArraySize: (size) => {
        set({ arraySize: size });
        get().generateNewArray();
    },

    setSpeed: (speed) => set({ speed }),

    setMode: (mode) => set({ mode }),

    setAlgorithm: (algo) => set({ currentAlgorithm: algo }),

    setIsRunning: (running) => set({ isRunning: running }),

    setIsPaused: (paused) => set({ isPaused: paused }),

    setIsSorted: (sorted) => set({ isSorted: sorted }),

    updateElement: (index, element) => set((state) => ({
        array: state.array.map((el, i) => i === index ? { ...el, ...element } : el),
    })),

    // Instant swap (without animation)
    swapElements: (i, j) => set((state) => {
        const newArray = [...state.array];
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        return { array: newArray };
    }),

    // Start animated swap
    startSwapAnimation: (indexA, indexB) => set((state) => ({
        activeSwap: {
            indexA,
            indexB,
            phase: "idle",
            startTime: Date.now(),
        },
        array: state.array.map((el, i) => {
            if (i === indexA) {
                return {
                    ...el,
                    state: "swapping" as const,
                    swapTargetIndex: indexB,
                    swapPhase: "idle" as const,
                };
            }
            if (i === indexB) {
                return {
                    ...el,
                    state: "swapping" as const,
                    swapTargetIndex: indexA,
                    swapPhase: "idle" as const,
                };
            }
            return el;
        }),
    })),

    // Update swap phase
    setSwapPhase: (phase) => set((state) => {
        if (!state.activeSwap) return state;

        return {
            activeSwap: { ...state.activeSwap, phase },
            array: state.array.map((el, i) => {
                if (i === state.activeSwap!.indexA || i === state.activeSwap!.indexB) {
                    return { ...el, swapPhase: phase };
                }
                return el;
            }),
        };
    }),

    // Complete swap animation
    completeSwapAnimation: () => set((state) => ({
        activeSwap: null,
        array: state.array.map((el) => {
            if (el.state === "swapping") {
                return {
                    ...el,
                    state: "default" as const,
                    swapTargetIndex: undefined,
                    swapPhase: "idle" as const,
                };
            }
            return el;
        }),
    })),

    incrementComparisons: () => set((state) => ({ comparisons: state.comparisons + 1 })),

    incrementSwaps: () => set((state) => ({ swaps: state.swaps + 1 })),

    resetStats: () => set({ comparisons: 0, swaps: 0 }),

    resetArray: () => {
        const { originalArray } = get();
        set({
            array: originalArray.map(value => ({
                value,
                state: "default" as const,
                swapPhase: "idle" as const,
            })),
            isSorted: false,
            isRunning: false,
            isPaused: false,
            comparisons: 0,
            swaps: 0,
            activeSwap: null,
        });
    },
}));

// ============================================
// EXPORT HELPER FOR USING ANIMATED SWAP
// ============================================

export function useAnimatedSwap() {
    const store = useVisualizationStore.getState();

    return async (indexA: number, indexB: number) => {
        await animatedSwap(indexA, indexB, store);
    };
}
