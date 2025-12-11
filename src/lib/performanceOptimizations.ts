/**
 * Performance Optimization Patterns for DSA Visualizer
 * 
 * This file provides optimized patterns for:
 * 1. Zustand store slicing with shallow comparison
 * 2. Memoized component patterns
 * 3. Animation state management
 * 4. Selective re-rendering
 */

import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { subscribeWithSelector } from "zustand/middleware";
import React, { memo, useCallback, useMemo, useRef, useEffect } from "react";

// ============================================
// 1. OPTIMIZED ZUSTAND STORE PATTERN
// Use subscribeWithSelector for fine-grained updates
// ============================================

export interface ArrayElement {
    value: number;
    state: "default" | "comparing" | "swapping" | "sorted" | "pivot";
}

interface OptimizedVisualizationState {
    // Core data
    array: ArrayElement[];

    // Animation state (separate from core data)
    animationState: {
        isPlaying: boolean;
        currentStep: number;
        totalSteps: number;
        speed: number;
    };

    // UI state (separate subscription)
    uiState: {
        mode: "2d" | "3d";
        showStats: boolean;
        showPseudocode: boolean;
    };

    // Statistics
    stats: {
        comparisons: number;
        swaps: number;
        accessCount: number;
    };

    // Actions
    setArray: (array: ArrayElement[]) => void;
    updateElement: (index: number, element: Partial<ArrayElement>) => void;
    batchUpdateElements: (updates: { index: number; element: Partial<ArrayElement> }[]) => void;
    setAnimationState: (state: Partial<OptimizedVisualizationState["animationState"]>) => void;
    setUIState: (state: Partial<OptimizedVisualizationState["uiState"]>) => void;
    incrementStat: (stat: keyof OptimizedVisualizationState["stats"]) => void;
}

export const useOptimizedStore = create<OptimizedVisualizationState>()(
    subscribeWithSelector((set, get) => ({
        array: [],

        animationState: {
            isPlaying: false,
            currentStep: 0,
            totalSteps: 0,
            speed: 500,
        },

        uiState: {
            mode: "3d",
            showStats: true,
            showPseudocode: true,
        },

        stats: {
            comparisons: 0,
            swaps: 0,
            accessCount: 0,
        },

        // Efficient array setter
        setArray: (array) => set({ array }),

        // Update single element without recreating array
        updateElement: (index, element) => set((state) => {
            const newArray = [...state.array];
            newArray[index] = { ...newArray[index], ...element };
            return { array: newArray };
        }),

        // Batch updates for multiple elements (more efficient)
        batchUpdateElements: (updates) => set((state) => {
            const newArray = [...state.array];
            for (const { index, element } of updates) {
                newArray[index] = { ...newArray[index], ...element };
            }
            return { array: newArray };
        }),

        setAnimationState: (animState) => set((state) => ({
            animationState: { ...state.animationState, ...animState },
        })),

        setUIState: (uiState) => set((state) => ({
            uiState: { ...state.uiState, ...uiState },
        })),

        incrementStat: (stat) => set((state) => ({
            stats: { ...state.stats, [stat]: state.stats[stat] + 1 },
        })),
    }))
);

// ============================================
// 2. SHALLOW SELECTOR HOOKS
// Subscribe to specific slices to prevent unnecessary re-renders
// ============================================

/**
 * Get only array length - component won't re-render when values change
 */
export function useArrayLength() {
    return useOptimizedStore((state) => state.array.length);
}

/**
 * Get only animation playing state
 */
export function useIsPlaying() {
    return useOptimizedStore((state) => state.animationState.isPlaying);
}

/**
 * Get animation state with shallow comparison
 */
export function useAnimationState() {
    return useOptimizedStore(
        (state) => state.animationState,
        shallow
    );
}

/**
 * Get stats with shallow comparison
 */
export function useStats() {
    return useOptimizedStore(
        (state) => state.stats,
        shallow
    );
}

/**
 * Get single element by index - only re-renders when this specific element changes
 */
export function useElement(index: number) {
    return useOptimizedStore(
        (state) => state.array[index],
        (a, b) => a?.value === b?.value && a?.state === b?.state
    );
}

/**
 * Get element value only
 */
export function useElementValue(index: number) {
    return useOptimizedStore((state) => state.array[index]?.value);
}

/**
 * Get element state only
 */
export function useElementState(index: number) {
    return useOptimizedStore((state) => state.array[index]?.state);
}

/**
 * Get array values only (not states)
 */
export function useArrayValues() {
    return useOptimizedStore(
        (state) => state.array.map((el) => el.value),
        shallow
    );
}

/**
 * Get only indices with specific state
 */
export function useIndicesWithState(targetState: ArrayElement["state"]) {
    return useOptimizedStore(
        (state) => state.array
            .map((el, i) => (el.state === targetState ? i : -1))
            .filter((i) => i >= 0),
        shallow
    );
}

// ============================================
// 3. MEMOIZED COMPONENT PATTERNS
// ============================================

/**
 * Memoized single bar component
 * Only re-renders when its specific props change
 */
interface MemoizedBarProps {
    value: number;
    state: ArrayElement["state"];
    index: number;
    maxValue: number;
    totalBars: number;
}

export const MemoizedBar = memo(function MemoizedBar({
    value,
    state,
    index,
    maxValue,
    totalBars,
}: MemoizedBarProps) {
    const heightPercent = (value / maxValue) * 100;

    const colors: Record<ArrayElement["state"], string> = {
        default: "bg-purple-500",
        comparing: "bg-amber-500",
        swapping: "bg-rose-500",
        sorted: "bg-emerald-500",
        pivot: "bg-cyan-500",
    };

    return (
        <div
            className= {`${colors[state]} transition-all duration-200 rounded-t`
}
            style = {{
    height: `${heightPercent}%`,
    width: `${90 / totalBars}%`,
}}
        />
    );
}, (prev, next) => {
    // Custom comparison - only re-render if these change
    return (
        prev.value === next.value &&
        prev.state === next.state &&
        prev.maxValue === next.maxValue &&
        prev.totalBars === next.totalBars
    );
});

/**
 * Container that subscribes to single element
 */
export const OptimizedBarContainer = memo(function OptimizedBarContainer({
    index,
    maxValue,
    totalBars,
}: {
    index: number;
    maxValue: number;
    totalBars: number;
}) {
    const element = useElement(index);

    if (!element) return null;

    return (
        <MemoizedBar
            value= { element.value }
    state = { element.state }
    index = { index }
    maxValue = { maxValue }
    totalBars = { totalBars }
        />
    );
});

/**
 * Optimized array visualization
 * Uses individual subscriptions per bar
 */
export const OptimizedArrayVisualization = memo(function OptimizedArrayVisualization() {
    const length = useArrayLength();
    const values = useArrayValues();
    const maxValue = useMemo(() => Math.max(...values, 100), [values]);

    // Create stable array of indices
    const indices = useMemo(() =>
        Array.from({ length }, (_, i) => i),
        [length]
    );

    return (
        <div className= "flex items-end justify-center h-64 gap-1" >
        {
            indices.map((index) => (
                <OptimizedBarContainer
                    key= { index }
                    index = { index }
                    maxValue = { maxValue }
                    totalBars = { length }
                />
            ))}
</div>
    );
});

// ============================================
// 4. ANIMATION STATE MANAGER
// Manages animation outside of React render cycle
// ============================================

class AnimationStateManager {
    private subscribers = new Set<(state: ArrayElement[]) => void>();
    private animationFrame: number | null = null;
    private state: ArrayElement[] = [];
    private pendingUpdates: Map<number, Partial<ArrayElement>> = new Map();

    subscribe(callback: (state: ArrayElement[]) => void) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    setState(newState: ArrayElement[]) {
        this.state = newState;
        this.flush();
    }

    updateElement(index: number, update: Partial<ArrayElement>) {
        this.pendingUpdates.set(index, {
            ...this.pendingUpdates.get(index),
            ...update,
        });
        this.scheduleFlush();
    }

    private scheduleFlush() {
        if (this.animationFrame) return;
        this.animationFrame = requestAnimationFrame(() => {
            this.flush();
            this.animationFrame = null;
        });
    }

    private flush() {
        if (this.pendingUpdates.size > 0) {
            const newState = [...this.state];
            this.pendingUpdates.forEach((update, index) => {
                newState[index] = { ...newState[index], ...update };
            });
            this.state = newState;
            this.pendingUpdates.clear();
        }

        this.subscribers.forEach((callback) => callback(this.state));
    }

    getState() {
        return this.state;
    }
}

export const animationStateManager = new AnimationStateManager();

/**
 * Hook to use animation state manager
 */
export function useAnimationStateManager() {
    const [state, setState] = React.useState<ArrayElement[]>([]);

    useEffect(() => {
        return animationStateManager.subscribe(setState);
    }, []);

    return state;
}

// ============================================
// 5. PERFORMANCE MONITORING HOOK
// ============================================

export function useRenderCount(componentName: string) {
    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current++;
        if (process.env.NODE_ENV === "development") {
            console.log(`[Render] ${componentName}: ${renderCount.current}`);
        }
    });

    return renderCount.current;
}

// ============================================
// 6. DEBOUNCED UPDATE HOOK
// ============================================

export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
    callback: T,
    delay: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout>();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]) as T;
}

// ============================================
// 7. BATCH UPDATE UTILITY
// ============================================

export function createBatchUpdater<T>(
    updateFn: (updates: T[]) => void,
    delay: number = 16 // ~1 frame
) {
    let pending: T[] = [];
    let scheduled = false;

    return (update: T) => {
        pending.push(update);

        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(() => {
                const updates = pending;
                pending = [];
                scheduled = false;
                updateFn(updates);
            });
        }
    };
}

// ============================================
// 8. STABLE CALLBACK REF
// ============================================

export function useEventCallback<T extends (...args: unknown[]) => unknown>(
    callback: T
): T {
    const callbackRef = useRef<T>(callback);

    useEffect(() => {
        callbackRef.current = callback;
    });

    return useCallback((...args: Parameters<T>) => {
        return callbackRef.current(...args);
    }, []) as T;
}
