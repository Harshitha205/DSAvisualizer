import { create } from "zustand";
import {
    AnimationEngine,
    AnimationStep,
    AnimationEvent,
    ArrayElement,
    PlaybackState,
    StepType,
} from "@/lib/animationTypes";

// ============================================
// ANIMATION ENGINE STORE
// Central store for step-based animation control
// ============================================

export const useAnimationEngine = create<AnimationEngine>((set, get) => ({
    // ========== INITIAL STATE ==========
    steps: [],
    currentStepIndex: -1,
    playbackState: "idle",
    speed: 500,
    isGenerating: false,
    displayArray: [],
    totalComparisons: 0,
    totalSwaps: 0,
    events: [],

    // ========== STEP GENERATION ==========

    generateSteps: (algorithm: string, array: number[]) => {
        set({ isGenerating: true, playbackState: "idle" });

        // Generate steps based on algorithm
        const steps = generateAlgorithmSteps(algorithm, [...array]);

        // Initialize display with first state
        const initialArray = array.map(value => ({
            value,
            state: "default" as const
        }));

        set({
            steps,
            currentStepIndex: -1,
            displayArray: initialArray,
            totalComparisons: steps.length > 0 ? steps[steps.length - 1].stats.comparisons : 0,
            totalSwaps: steps.length > 0 ? steps[steps.length - 1].stats.swaps : 0,
            isGenerating: false,
            playbackState: "idle",
            events: [],
        });
    },

    clearSteps: () => {
        set({
            steps: [],
            currentStepIndex: -1,
            displayArray: [],
            playbackState: "idle",
            events: [],
            totalComparisons: 0,
            totalSwaps: 0,
        });
    },

    // ========== PLAYBACK CONTROLS ==========

    play: () => {
        const { playbackState, steps, currentStepIndex } = get();

        if (steps.length === 0) return;
        if (currentStepIndex >= steps.length - 1) {
            // Reset if at end
            set({ currentStepIndex: -1 });
        }

        set({ playbackState: "playing" });
    },

    pause: () => {
        set({ playbackState: "paused" });
    },

    reset: () => {
        const { steps } = get();

        if (steps.length === 0) return;

        // Reset to initial state
        const initialArray = steps[0]?.arraySnapshot.map(el => ({
            ...el,
            state: "default" as const,
        })) || [];

        set({
            currentStepIndex: -1,
            displayArray: initialArray.map(el => ({ ...el, state: "default" as const })),
            playbackState: "idle",
            events: [],
        });
    },

    // ========== STEP NAVIGATION ==========

    nextStep: () => {
        const { steps, currentStepIndex, playbackState } = get();

        if (currentStepIndex >= steps.length - 1) {
            set({ playbackState: "complete" });
            return;
        }

        const nextIndex = currentStepIndex + 1;
        const nextStep = steps[nextIndex];

        // Log event
        const event: AnimationEvent = {
            type: nextStep.type,
            indices: nextStep.indices,
            timestamp: Date.now(),
        };

        set({
            currentStepIndex: nextIndex,
            displayArray: nextStep.arraySnapshot,
            events: [...get().events, event],
        });

        // Check if complete
        if (nextIndex >= steps.length - 1) {
            set({ playbackState: "complete" });
        }
    },

    previousStep: () => {
        const { steps, currentStepIndex } = get();

        if (currentStepIndex <= 0) {
            // Go to initial state
            const initialArray = steps[0]?.arraySnapshot.map(el => ({
                value: el.value,
                state: "default" as const,
            })) || [];

            set({
                currentStepIndex: -1,
                displayArray: initialArray,
                playbackState: "paused",
            });
            return;
        }

        const prevIndex = currentStepIndex - 1;
        const prevStep = steps[prevIndex];

        set({
            currentStepIndex: prevIndex,
            displayArray: prevStep.arraySnapshot,
            playbackState: "paused",
        });
    },

    goToStep: (index: number) => {
        const { steps } = get();

        if (index < 0 || index >= steps.length) return;

        const step = steps[index];

        set({
            currentStepIndex: index,
            displayArray: step.arraySnapshot,
            playbackState: "paused",
        });
    },

    // ========== SETTINGS ==========

    setSpeed: (speed: number) => {
        set({ speed: Math.max(10, Math.min(2000, speed)) });
    },

    // ========== STATE GETTERS ==========

    getCurrentStep: () => {
        const { steps, currentStepIndex } = get();
        if (currentStepIndex < 0 || currentStepIndex >= steps.length) return null;
        return steps[currentStepIndex];
    },

    getProgress: () => {
        const { steps, currentStepIndex } = get();
        if (steps.length === 0) return 0;
        return ((currentStepIndex + 1) / steps.length) * 100;
    },

    canGoNext: () => {
        const { steps, currentStepIndex } = get();
        return currentStepIndex < steps.length - 1;
    },

    canGoPrevious: () => {
        const { currentStepIndex } = get();
        return currentStepIndex >= 0;
    },
}));

// ============================================
// STEP GENERATION FUNCTIONS
// ============================================

function generateAlgorithmSteps(algorithm: string, array: number[]): AnimationStep[] {
    switch (algorithm) {
        case "bubble":
            return generateBubbleSortSteps(array);
        case "selection":
            return generateSelectionSortSteps(array);
        case "insertion":
            return generateInsertionSortSteps(array);
        case "quick":
            return generateQuickSortSteps(array);
        default:
            return generateBubbleSortSteps(array);
    }
}

// Helper to create array snapshot
function createSnapshot(arr: number[], states: Map<number, ArrayElement["state"]>): ArrayElement[] {
    return arr.map((value, index) => ({
        value,
        state: states.get(index) || "default",
    }));
}

// ============================================
// BUBBLE SORT STEP GENERATOR
// ============================================

function generateBubbleSortSteps(arr: number[]): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const array = [...arr];
    const n = array.length;
    let stepId = 0;
    let comparisons = 0;
    let swaps = 0;
    const sorted = new Set<number>();

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Comparison step
            comparisons++;
            const compareStates = new Map<number, ArrayElement["state"]>();
            compareStates.set(j, "comparing");
            compareStates.set(j + 1, "comparing");
            sorted.forEach(idx => compareStates.set(idx, "sorted"));

            steps.push({
                id: stepId++,
                type: "compare",
                indices: [j, j + 1],
                description: `Comparing ${array[j]} and ${array[j + 1]}`,
                arraySnapshot: createSnapshot(array, compareStates),
                highlightIndices: [j, j + 1],
                stats: { comparisons, swaps },
            });

            if (array[j] > array[j + 1]) {
                // Swap step
                swaps++;
                [array[j], array[j + 1]] = [array[j + 1], array[j]];

                const swapStates = new Map<number, ArrayElement["state"]>();
                swapStates.set(j, "swapping");
                swapStates.set(j + 1, "swapping");
                sorted.forEach(idx => swapStates.set(idx, "sorted"));

                steps.push({
                    id: stepId++,
                    type: "swap",
                    indices: [j, j + 1],
                    description: `Swapping ${array[j + 1]} and ${array[j]}`,
                    arraySnapshot: createSnapshot(array, swapStates),
                    highlightIndices: [j, j + 1],
                    stats: { comparisons, swaps },
                });
            }
        }

        // Mark as sorted
        sorted.add(n - 1 - i);
        const sortedStates = new Map<number, ArrayElement["state"]>();
        sorted.forEach(idx => sortedStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "mark_sorted",
            indices: [n - 1 - i],
            description: `Element ${array[n - 1 - i]} is now in its sorted position`,
            arraySnapshot: createSnapshot(array, sortedStates),
            highlightIndices: [n - 1 - i],
            stats: { comparisons, swaps },
        });
    }

    // Mark first element
    sorted.add(0);
    const finalStates = new Map<number, ArrayElement["state"]>();
    sorted.forEach(idx => finalStates.set(idx, "sorted"));

    steps.push({
        id: stepId++,
        type: "complete",
        indices: [],
        description: "Array is now fully sorted!",
        arraySnapshot: createSnapshot(array, finalStates),
        highlightIndices: [],
        stats: { comparisons, swaps },
    });

    return steps;
}

// ============================================
// SELECTION SORT STEP GENERATOR
// ============================================

function generateSelectionSortSteps(arr: number[]): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const array = [...arr];
    const n = array.length;
    let stepId = 0;
    let comparisons = 0;
    let swaps = 0;
    const sorted = new Set<number>();

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;

        // Mark current position
        const startStates = new Map<number, ArrayElement["state"]>();
        startStates.set(i, "comparing");
        sorted.forEach(idx => startStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "compare",
            indices: [i],
            description: `Finding minimum element from index ${i}`,
            arraySnapshot: createSnapshot(array, startStates),
            highlightIndices: [i],
            stats: { comparisons, swaps },
        });

        for (let j = i + 1; j < n; j++) {
            comparisons++;

            const compareStates = new Map<number, ArrayElement["state"]>();
            compareStates.set(i, "comparing");
            compareStates.set(j, "comparing");
            if (minIdx !== i && minIdx !== j) {
                compareStates.set(minIdx, "pivot");
            }
            sorted.forEach(idx => compareStates.set(idx, "sorted"));

            steps.push({
                id: stepId++,
                type: "compare",
                indices: [j, minIdx],
                description: `Comparing ${array[j]} with current minimum ${array[minIdx]}`,
                arraySnapshot: createSnapshot(array, compareStates),
                highlightIndices: [j, minIdx],
                stats: { comparisons, swaps },
            });

            if (array[j] < array[minIdx]) {
                minIdx = j;

                const pivotStates = new Map<number, ArrayElement["state"]>();
                pivotStates.set(minIdx, "pivot");
                pivotStates.set(i, "comparing");
                sorted.forEach(idx => pivotStates.set(idx, "sorted"));

                steps.push({
                    id: stepId++,
                    type: "mark_pivot",
                    indices: [minIdx],
                    description: `New minimum found: ${array[minIdx]} at index ${minIdx}`,
                    arraySnapshot: createSnapshot(array, pivotStates),
                    highlightIndices: [minIdx],
                    stats: { comparisons, swaps },
                });
            }
        }

        if (minIdx !== i) {
            swaps++;
            [array[i], array[minIdx]] = [array[minIdx], array[i]];

            const swapStates = new Map<number, ArrayElement["state"]>();
            swapStates.set(i, "swapping");
            swapStates.set(minIdx, "swapping");
            sorted.forEach(idx => swapStates.set(idx, "sorted"));

            steps.push({
                id: stepId++,
                type: "swap",
                indices: [i, minIdx],
                description: `Swapping ${array[minIdx]} and ${array[i]}`,
                arraySnapshot: createSnapshot(array, swapStates),
                highlightIndices: [i, minIdx],
                stats: { comparisons, swaps },
            });
        }

        sorted.add(i);
        const sortedStates = new Map<number, ArrayElement["state"]>();
        sorted.forEach(idx => sortedStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "mark_sorted",
            indices: [i],
            description: `Element ${array[i]} is now in its sorted position`,
            arraySnapshot: createSnapshot(array, sortedStates),
            highlightIndices: [i],
            stats: { comparisons, swaps },
        });
    }

    sorted.add(n - 1);
    const finalStates = new Map<number, ArrayElement["state"]>();
    sorted.forEach(idx => finalStates.set(idx, "sorted"));

    steps.push({
        id: stepId++,
        type: "complete",
        indices: [],
        description: "Array is now fully sorted!",
        arraySnapshot: createSnapshot(array, finalStates),
        highlightIndices: [],
        stats: { comparisons, swaps },
    });

    return steps;
}

// ============================================
// INSERTION SORT STEP GENERATOR
// ============================================

function generateInsertionSortSteps(arr: number[]): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const array = [...arr];
    const n = array.length;
    let stepId = 0;
    let comparisons = 0;
    let swaps = 0;
    const sorted = new Set<number>([0]);

    // Initial state
    const initStates = new Map<number, ArrayElement["state"]>();
    initStates.set(0, "sorted");

    steps.push({
        id: stepId++,
        type: "mark_sorted",
        indices: [0],
        description: `First element ${array[0]} is trivially sorted`,
        arraySnapshot: createSnapshot(array, initStates),
        highlightIndices: [0],
        stats: { comparisons, swaps },
    });

    for (let i = 1; i < n; i++) {
        const key = array[i];

        // Mark current element as pivot
        const pivotStates = new Map<number, ArrayElement["state"]>();
        pivotStates.set(i, "pivot");
        sorted.forEach(idx => pivotStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "mark_pivot",
            indices: [i],
            description: `Inserting ${key} into sorted portion`,
            arraySnapshot: createSnapshot(array, pivotStates),
            highlightIndices: [i],
            stats: { comparisons, swaps },
        });

        let j = i - 1;

        while (j >= 0) {
            comparisons++;

            const compareStates = new Map<number, ArrayElement["state"]>();
            compareStates.set(j + 1, "pivot");
            compareStates.set(j, "comparing");
            for (let k = 0; k < j; k++) {
                if (sorted.has(k)) compareStates.set(k, "sorted");
            }

            steps.push({
                id: stepId++,
                type: "compare",
                indices: [j, j + 1],
                description: `Comparing ${array[j]} with ${array[j + 1]}`,
                arraySnapshot: createSnapshot(array, compareStates),
                highlightIndices: [j, j + 1],
                stats: { comparisons, swaps },
            });

            if (array[j] > array[j + 1]) {
                swaps++;
                [array[j], array[j + 1]] = [array[j + 1], array[j]];

                const swapStates = new Map<number, ArrayElement["state"]>();
                swapStates.set(j, "swapping");
                swapStates.set(j + 1, "swapping");

                steps.push({
                    id: stepId++,
                    type: "swap",
                    indices: [j, j + 1],
                    description: `Shifting ${array[j + 1]} to the right`,
                    arraySnapshot: createSnapshot(array, swapStates),
                    highlightIndices: [j, j + 1],
                    stats: { comparisons, swaps },
                });

                j--;
            } else {
                break;
            }
        }

        // Mark all elements up to i as sorted
        for (let k = 0; k <= i; k++) {
            sorted.add(k);
        }

        const sortedStates = new Map<number, ArrayElement["state"]>();
        sorted.forEach(idx => sortedStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "mark_sorted",
            indices: Array.from({ length: i + 1 }, (_, k) => k),
            description: `Element ${key} inserted at correct position`,
            arraySnapshot: createSnapshot(array, sortedStates),
            highlightIndices: [j + 1],
            stats: { comparisons, swaps },
        });
    }

    const finalStates = new Map<number, ArrayElement["state"]>();
    for (let i = 0; i < n; i++) finalStates.set(i, "sorted");

    steps.push({
        id: stepId++,
        type: "complete",
        indices: [],
        description: "Array is now fully sorted!",
        arraySnapshot: createSnapshot(array, finalStates),
        highlightIndices: [],
        stats: { comparisons, swaps },
    });

    return steps;
}

// ============================================
// QUICK SORT STEP GENERATOR
// ============================================

function generateQuickSortSteps(arr: number[]): AnimationStep[] {
    const steps: AnimationStep[] = [];
    const array = [...arr];
    let stepId = 0;
    let comparisons = 0;
    let swaps = 0;
    const sorted = new Set<number>();

    function quickSortRecursive(low: number, high: number) {
        if (low < high) {
            const pivotIndex = partition(low, high);
            quickSortRecursive(low, pivotIndex - 1);
            quickSortRecursive(pivotIndex + 1, high);
        } else if (low === high) {
            sorted.add(low);
        }
    }

    function partition(low: number, high: number): number {
        const pivot = array[high];

        // Mark pivot
        const pivotStates = new Map<number, ArrayElement["state"]>();
        pivotStates.set(high, "pivot");
        sorted.forEach(idx => pivotStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "mark_pivot",
            indices: [high],
            description: `Pivot element: ${pivot} at index ${high}`,
            arraySnapshot: createSnapshot(array, pivotStates),
            highlightIndices: [high],
            stats: { comparisons, swaps },
        });

        let i = low - 1;

        for (let j = low; j < high; j++) {
            comparisons++;

            const compareStates = new Map<number, ArrayElement["state"]>();
            compareStates.set(j, "comparing");
            compareStates.set(high, "pivot");
            if (i >= low) compareStates.set(i, "comparing");
            sorted.forEach(idx => compareStates.set(idx, "sorted"));

            steps.push({
                id: stepId++,
                type: "compare",
                indices: [j, high],
                description: `Comparing ${array[j]} with pivot ${pivot}`,
                arraySnapshot: createSnapshot(array, compareStates),
                highlightIndices: [j, high],
                stats: { comparisons, swaps },
            });

            if (array[j] <= pivot) {
                i++;
                if (i !== j) {
                    swaps++;
                    [array[i], array[j]] = [array[j], array[i]];

                    const swapStates = new Map<number, ArrayElement["state"]>();
                    swapStates.set(i, "swapping");
                    swapStates.set(j, "swapping");
                    swapStates.set(high, "pivot");
                    sorted.forEach(idx => swapStates.set(idx, "sorted"));

                    steps.push({
                        id: stepId++,
                        type: "swap",
                        indices: [i, j],
                        description: `Swapping ${array[j]} and ${array[i]}`,
                        arraySnapshot: createSnapshot(array, swapStates),
                        highlightIndices: [i, j],
                        stats: { comparisons, swaps },
                    });
                }
            }
        }

        // Swap pivot to correct position
        if (i + 1 !== high) {
            swaps++;
            [array[i + 1], array[high]] = [array[high], array[i + 1]];

            const swapStates = new Map<number, ArrayElement["state"]>();
            swapStates.set(i + 1, "swapping");
            swapStates.set(high, "swapping");
            sorted.forEach(idx => swapStates.set(idx, "sorted"));

            steps.push({
                id: stepId++,
                type: "swap",
                indices: [i + 1, high],
                description: `Moving pivot ${array[high]} to correct position`,
                arraySnapshot: createSnapshot(array, swapStates),
                highlightIndices: [i + 1, high],
                stats: { comparisons, swaps },
            });
        }

        sorted.add(i + 1);
        const sortedStates = new Map<number, ArrayElement["state"]>();
        sorted.forEach(idx => sortedStates.set(idx, "sorted"));

        steps.push({
            id: stepId++,
            type: "mark_sorted",
            indices: [i + 1],
            description: `Pivot ${array[i + 1]} is now in its final position`,
            arraySnapshot: createSnapshot(array, sortedStates),
            highlightIndices: [i + 1],
            stats: { comparisons, swaps },
        });

        return i + 1;
    }

    quickSortRecursive(0, array.length - 1);

    // Final complete step
    const finalStates = new Map<number, ArrayElement["state"]>();
    for (let i = 0; i < array.length; i++) finalStates.set(i, "sorted");

    steps.push({
        id: stepId++,
        type: "complete",
        indices: [],
        description: "Array is now fully sorted!",
        arraySnapshot: createSnapshot(array, finalStates),
        highlightIndices: [],
        stats: { comparisons, swaps },
    });

    return steps;
}
