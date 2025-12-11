import { useEffect, useRef, useCallback } from "react";
import { useAnimationEngine } from "@/stores/animationEngine";

// ============================================
// useAnimationPlayback Hook
// Handles automatic playback based on speed
// ============================================

export function useAnimationPlayback() {
    const {
        playbackState,
        speed,
        nextStep,
        canGoNext,
        currentStepIndex,
        steps,
    } = useAnimationEngine();

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-advance effect
    useEffect(() => {
        if (playbackState === "playing" && canGoNext()) {
            intervalRef.current = setInterval(() => {
                const state = useAnimationEngine.getState();
                if (state.canGoNext()) {
                    state.nextStep();
                } else {
                    // Stop when complete
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                }
            }, speed);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [playbackState, speed, canGoNext]);

    return {
        isPlaying: playbackState === "playing",
        isPaused: playbackState === "paused",
        isComplete: playbackState === "complete",
        isIdle: playbackState === "idle",
        currentStep: currentStepIndex + 1,
        totalSteps: steps.length,
    };
}

// ============================================
// useAnimationControls Hook
// Provides control functions with proper state
// ============================================

export function useAnimationControls() {
    const {
        play,
        pause,
        reset,
        nextStep,
        previousStep,
        goToStep,
        setSpeed,
        canGoNext,
        canGoPrevious,
        playbackState,
        speed,
    } = useAnimationEngine();

    const togglePlayPause = useCallback(() => {
        if (playbackState === "playing") {
            pause();
        } else {
            play();
        }
    }, [playbackState, play, pause]);

    const skipToStart = useCallback(() => {
        reset();
    }, [reset]);

    const skipToEnd = useCallback(() => {
        const state = useAnimationEngine.getState();
        if (state.steps.length > 0) {
            goToStep(state.steps.length - 1);
        }
    }, [goToStep]);

    return {
        // Actions
        play,
        pause,
        reset,
        nextStep,
        previousStep,
        goToStep,
        setSpeed,
        togglePlayPause,
        skipToStart,
        skipToEnd,

        // State
        canGoNext: canGoNext(),
        canGoPrevious: canGoPrevious(),
        isPlaying: playbackState === "playing",
        isPaused: playbackState === "paused",
        isComplete: playbackState === "complete",
        speed,
    };
}

// ============================================
// useAnimationStats Hook
// Provides current statistics
// ============================================

export function useAnimationStats() {
    const {
        getCurrentStep,
        totalComparisons,
        totalSwaps,
        getProgress,
        steps,
        currentStepIndex,
    } = useAnimationEngine();

    const currentStep = getCurrentStep();

    return {
        // Current step stats
        currentComparisons: currentStep?.stats.comparisons ?? 0,
        currentSwaps: currentStep?.stats.swaps ?? 0,

        // Total stats (final values)
        totalComparisons,
        totalSwaps,

        // Progress
        progress: getProgress(),
        currentStepIndex: currentStepIndex + 1,
        totalSteps: steps.length,

        // Step info
        stepType: currentStep?.type ?? null,
        stepDescription: currentStep?.description ?? "Ready to start",
        highlightIndices: currentStep?.highlightIndices ?? [],
    };
}

// ============================================
// useAnimationArray Hook
// Provides the current array state for visualization
// ============================================

export function useAnimationArray() {
    const { displayArray, currentStepIndex } = useAnimationEngine();

    return {
        array: displayArray,
        hasData: displayArray.length > 0,
        stepIndex: currentStepIndex,
    };
}

// ============================================
// useAnimationGenerator Hook
// Handles step generation with algorithm selection
// ============================================

export function useAnimationGenerator() {
    const { generateSteps, clearSteps, isGenerating, steps } = useAnimationEngine();

    const generate = useCallback((algorithm: string, array: number[]) => {
        generateSteps(algorithm, array);
    }, [generateSteps]);

    return {
        generate,
        clear: clearSteps,
        isGenerating,
        hasSteps: steps.length > 0,
        stepCount: steps.length,
    };
}

// ============================================
// useStepHistory Hook
// Provides access to step history and events
// ============================================

export function useStepHistory() {
    const { steps, events, currentStepIndex } = useAnimationEngine();

    // Get last N events
    const getRecentEvents = useCallback((count: number = 5) => {
        return events.slice(-count);
    }, [events]);

    // Get steps in a range
    const getStepsInRange = useCallback((start: number, end: number) => {
        return steps.slice(start, end + 1);
    }, [steps]);

    // Get all comparison steps
    const getComparisonSteps = useCallback(() => {
        return steps.filter(s => s.type === "compare");
    }, [steps]);

    // Get all swap steps
    const getSwapSteps = useCallback(() => {
        return steps.filter(s => s.type === "swap");
    }, [steps]);

    return {
        allSteps: steps,
        allEvents: events,
        currentIndex: currentStepIndex,
        getRecentEvents,
        getStepsInRange,
        getComparisonSteps,
        getSwapSteps,
        totalSteps: steps.length,
        totalEvents: events.length,
    };
}

// ============================================
// useKeyboardControls Hook
// Adds keyboard shortcuts for animation control
// ============================================

export function useKeyboardControls() {
    const { togglePlayPause, nextStep, previousStep, reset } = useAnimationControls();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (e.key) {
                case " ": // Spacebar - toggle play/pause
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case "ArrowRight": // Next step
                    e.preventDefault();
                    nextStep();
                    break;
                case "ArrowLeft": // Previous step
                    e.preventDefault();
                    previousStep();
                    break;
                case "r": // Reset
                case "R":
                    e.preventDefault();
                    reset();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [togglePlayPause, nextStep, previousStep, reset]);
}

// ============================================
// Combined Hook for Full Animation Control
// ============================================

export function useAnimationEngine_Full() {
    const playback = useAnimationPlayback();
    const controls = useAnimationControls();
    const stats = useAnimationStats();
    const array = useAnimationArray();
    const generator = useAnimationGenerator();
    const history = useStepHistory();

    // Enable keyboard controls
    useKeyboardControls();

    return {
        // Playback state
        ...playback,

        // Controls
        controls,

        // Statistics
        stats,

        // Array data
        array: array.array,
        hasData: array.hasData,

        // Generator
        generate: generator.generate,
        clear: generator.clear,
        isGenerating: generator.isGenerating,
        hasSteps: generator.hasSteps,

        // History
        history,
    };
}
