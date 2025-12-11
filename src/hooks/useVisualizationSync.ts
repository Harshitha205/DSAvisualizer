import { useCallback, useEffect } from "react";
import { useVisualizationStore } from "@/stores/visualizationStore";
import { useAnimationEngine } from "@/stores/animationEngine";
import { ArrayElement } from "@/lib/animationTypes";

// ============================================
// SHARED STATE SYNC HOOK
// Ensures 2D and 3D views use the same data
// ============================================

/**
 * Hook that syncs the animation engine display array with the visualization store.
 * This allows both 2D and 3D views to render the same state.
 */
export function useSharedVisualizationState() {
    const visualizationStore = useVisualizationStore();
    const animationEngine = useAnimationEngine();

    // Get the current array - prioritize animation engine when it has data
    const array = animationEngine.displayArray.length > 0
        ? animationEngine.displayArray
        : visualizationStore.array;

    // Sync animation engine array to visualization store
    useEffect(() => {
        if (animationEngine.displayArray.length > 0) {
            // Update visualization store with animation engine state
            // This keeps the bar colors/states in sync
            const syncedArray = animationEngine.displayArray.map((el) => ({
                value: el.value,
                state: el.state,
                swapPhase: "idle" as const,
            }));

            // Only update if different to prevent infinite loops
            const currentStr = JSON.stringify(visualizationStore.array.map(e => ({ v: e.value, s: e.state })));
            const newStr = JSON.stringify(syncedArray.map(e => ({ v: e.value, s: e.state })));

            if (currentStr !== newStr) {
                useVisualizationStore.setState({ array: syncedArray });
            }
        }
    }, [animationEngine.displayArray]);

    return {
        array,
        mode: visualizationStore.mode,
        algorithm: visualizationStore.currentAlgorithm,
        isRunning: visualizationStore.isRunning || animationEngine.playbackState === "playing",
        isPaused: visualizationStore.isPaused || animationEngine.playbackState === "paused",
        isSorted: visualizationStore.isSorted || animationEngine.playbackState === "complete",
    };
}

// ============================================
// UNIFIED VISUALIZATION CONTROLLER
// Controls both real-time and step-based modes
// ============================================

export type VisualizationControlMode = "realtime" | "stepbased";

interface UnifiedController {
    // Mode
    controlMode: VisualizationControlMode;
    setControlMode: (mode: VisualizationControlMode) => void;

    // Shared data
    array: ArrayElement[];
    algorithm: string;

    // Playback status
    isPlaying: boolean;
    isPaused: boolean;
    isComplete: boolean;

    // Actions
    start: () => Promise<void>;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    nextStep: () => void;
    previousStep: () => void;

    // Stats
    comparisons: number;
    swaps: number;
    progress: number;
}

export function useUnifiedVisualizationController(): UnifiedController {
    const visualizationStore = useVisualizationStore();
    const animationEngine = useAnimationEngine();

    // Determine effective array based on mode
    const array = animationEngine.displayArray.length > 0
        ? animationEngine.displayArray
        : visualizationStore.array.map(el => ({
            value: el.value,
            state: el.state,
        }));

    // Start visualization
    const start = useCallback(async () => {
        const { currentAlgorithm, array: storeArray } = visualizationStore;

        // Generate steps for step-based mode
        animationEngine.generateSteps(
            currentAlgorithm,
            storeArray.map(el => el.value)
        );

        // Start playback
        animationEngine.play();
    }, [visualizationStore, animationEngine]);

    // Pause
    const pause = useCallback(() => {
        animationEngine.pause();
        visualizationStore.setIsPaused(true);
    }, [animationEngine, visualizationStore]);

    // Resume
    const resume = useCallback(() => {
        animationEngine.play();
        visualizationStore.setIsPaused(false);
    }, [animationEngine, visualizationStore]);

    // Reset
    const reset = useCallback(() => {
        animationEngine.reset();
        visualizationStore.resetArray();
    }, [animationEngine, visualizationStore]);

    // Step controls
    const nextStep = useCallback(() => {
        if (animationEngine.canGoNext()) {
            animationEngine.nextStep();
        }
    }, [animationEngine]);

    const previousStep = useCallback(() => {
        if (animationEngine.canGoPrevious()) {
            animationEngine.previousStep();
        }
    }, [animationEngine]);

    // Get current step stats
    const currentStep = animationEngine.getCurrentStep();

    return {
        controlMode: "stepbased",
        setControlMode: () => { },

        array,
        algorithm: visualizationStore.currentAlgorithm,

        isPlaying: animationEngine.playbackState === "playing",
        isPaused: animationEngine.playbackState === "paused",
        isComplete: animationEngine.playbackState === "complete",

        start,
        pause,
        resume,
        reset,
        nextStep,
        previousStep,

        comparisons: currentStep?.stats.comparisons ?? visualizationStore.comparisons,
        swaps: currentStep?.stats.swaps ?? visualizationStore.swaps,
        progress: animationEngine.getProgress(),
    };
}

// ============================================
// VIEW MODE SYNC
// Persists view mode preference
// ============================================

const VIEW_MODE_KEY = "dsa-visualizer-view-mode";

export function useViewModePersistence() {
    const { mode, setMode } = useVisualizationStore();

    // Load saved preference on mount
    useEffect(() => {
        const saved = localStorage.getItem(VIEW_MODE_KEY);
        if (saved === "2d" || saved === "3d") {
            setMode(saved);
        }
    }, [setMode]);

    // Save preference when changed
    const setModeWithPersist = useCallback((newMode: "2d" | "3d") => {
        setMode(newMode);
        localStorage.setItem(VIEW_MODE_KEY, newMode);
    }, [setMode]);

    return {
        mode,
        setMode: setModeWithPersist,
        is2D: mode === "2d",
        is3D: mode === "3d",
    };
}

// ============================================
// RESPONSIVE VIEW MODE
// Auto-switch to 2D on mobile
// ============================================

export function useResponsiveViewMode() {
    const { mode, setMode } = useVisualizationStore();

    useEffect(() => {
        const checkScreenSize = () => {
            // Auto-switch to 2D on small screens for performance
            if (window.innerWidth < 768 && mode === "3d") {
                setMode("2d");
            }
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);
        return () => window.removeEventListener("resize", checkScreenSize);
    }, [mode, setMode]);

    return mode;
}

// ============================================
// KEYBOARD SHORTCUTS FOR VIEW MODE
// ============================================

export function useViewModeKeyboard() {
    const { setMode } = useVisualizationStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Toggle view mode with 'V' key
            if (e.key === "v" || e.key === "V") {
                const currentMode = useVisualizationStore.getState().mode;
                setMode(currentMode === "2d" ? "3d" : "2d");
            }

            // Direct switch with number keys
            if (e.key === "2") {
                setMode("2d");
            }
            if (e.key === "3") {
                setMode("3d");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setMode]);
}

// ============================================
// COMBINED HOOK FOR FULL SYNC
// ============================================

export function useVisualizationSync() {
    const sharedState = useSharedVisualizationState();
    const controller = useUnifiedVisualizationController();
    const viewMode = useViewModePersistence();

    // Enable keyboard shortcuts
    useViewModeKeyboard();

    // Auto-switch to 2D on mobile
    useResponsiveViewMode();

    return {
        ...sharedState,
        ...controller,
        viewMode: viewMode.mode,
        setViewMode: viewMode.setMode,
        is2D: viewMode.is2D,
        is3D: viewMode.is3D,
    };
}
