"use client";

import React, { memo, useId } from "react";
import { motion } from "framer-motion";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    Volume2,
    VolumeX,
    ChevronLeft,
    ChevronRight,
    Keyboard,
} from "lucide-react";
import { useAnimationEngine } from "@/stores/animationEngine";
import { useKeyboardShortcuts, AccessibleButton, SrOnly, LiveRegion } from "@/lib/accessibility";

// ============================================
// ACCESSIBLE PLAYBACK CONTROLS
// ============================================

export const AccessiblePlaybackControls = memo(function AccessiblePlaybackControls() {
    const {
        playbackState,
        currentStepIndex,
        steps,
        play,
        pause,
        nextStep,
        previousStep,
        reset,
        canGoNext,
        canGoPrevious,
    } = useAnimationEngine();

    const isPlaying = playbackState === "playing";
    const currentStep = steps[currentStepIndex];

    return (
        <div
            role="toolbar"
            aria-label="Animation playback controls"
            className="flex items-center gap-2"
        >
            {/* Reset Button */}
            <AccessibleButton
                onClick={reset}
                shortcut="r"
                shortcutLabel="R"
                aria-label="Reset animation"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors disabled:opacity-50"
            >
                <RotateCcw className="w-5 h-5" />
            </AccessibleButton>

            {/* Previous Step */}
            <AccessibleButton
                onClick={previousStep}
                disabled={!canGoPrevious()}
                shortcut="ArrowLeft"
                shortcutLabel="← Arrow"
                aria-label="Previous step"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-5 h-5" />
            </AccessibleButton>

            {/* Play/Pause Button */}
            <AccessibleButton
                onClick={isPlaying ? pause : play}
                shortcut="Space"
                shortcutLabel="Space"
                aria-label={isPlaying ? "Pause animation" : "Play animation"}
                aria-pressed={isPlaying}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
                {isPlaying ? (
                    <Pause className="w-6 h-6" />
                ) : (
                    <Play className="w-6 h-6" />
                )}
            </AccessibleButton>

            {/* Next Step */}
            <AccessibleButton
                onClick={nextStep}
                disabled={!canGoNext()}
                shortcut="ArrowRight"
                shortcutLabel="→ Arrow"
                aria-label="Next step"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="w-5 h-5" />
            </AccessibleButton>

            {/* Skip to End */}
            <AccessibleButton
                onClick={() => useAnimationEngine.getState().goToStep(steps.length - 1)}
                disabled={currentStepIndex >= steps.length - 1}
                shortcut="End"
                shortcutLabel="End"
                aria-label="Skip to end"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors disabled:opacity-50"
            >
                <SkipForward className="w-5 h-5" />
            </AccessibleButton>

            {/* Live region for step announcements */}
            <LiveRegion
                message={currentStep ? `Step ${currentStepIndex + 1}: ${currentStep.description}` : ""}
            />
        </div>
    );
});

// ============================================
// ACCESSIBLE PROGRESS BAR
// ============================================

interface AccessibleProgressBarProps {
    className?: string;
}

export const AccessibleProgressBar = memo(function AccessibleProgressBar({
    className = "",
}: AccessibleProgressBarProps) {
    const { currentStepIndex, steps, goToStep } = useAnimationEngine();
    const progressId = useId();

    const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;
    const currentStep = steps[currentStepIndex];

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Progress label */}
            <div className="flex justify-between text-xs text-slate-400">
                <span id={`${progressId}-label`}>Progress</span>
                <span aria-hidden="true">
                    {currentStepIndex + 1} / {steps.length}
                </span>
            </div>

            {/* Progress bar */}
            <div
                role="progressbar"
                aria-labelledby={`${progressId}-label`}
                aria-valuenow={currentStepIndex + 1}
                aria-valuemin={1}
                aria-valuemax={steps.length}
                aria-valuetext={`Step ${currentStepIndex + 1} of ${steps.length}: ${currentStep?.description || "Ready"}`}
                className="relative h-2 rounded-full bg-slate-800 overflow-hidden cursor-pointer"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    const targetStep = Math.floor(percent * steps.length);
                    goToStep(Math.max(0, Math.min(steps.length - 1, targetStep)));
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                        goToStep(Math.min(steps.length - 1, currentStepIndex + 1));
                    } else if (e.key === "ArrowLeft") {
                        goToStep(Math.max(0, currentStepIndex - 1));
                    }
                }}
            >
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            {/* Step description */}
            <div
                className="text-xs text-slate-500 truncate"
                aria-live="polite"
            >
                {currentStep?.description || "Ready to start"}
            </div>
        </div>
    );
});

// ============================================
// ACCESSIBLE STATISTICS DISPLAY
// ============================================

export const AccessibleStatsDisplay = memo(function AccessibleStatsDisplay() {
    const { currentStepIndex, steps } = useAnimationEngine();
    const currentStep = steps[currentStepIndex];
    const stats = currentStep?.stats || { comparisons: 0, swaps: 0 };

    return (
        <div
            role="region"
            aria-label="Sorting statistics"
            className="grid grid-cols-2 gap-4"
        >
            <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Comparisons</div>
                <div
                    className="text-2xl font-bold text-amber-400 tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {stats.comparisons}
                    <SrOnly>comparisons made</SrOnly>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50">
                <div className="text-xs text-slate-500 mb-1">Swaps</div>
                <div
                    className="text-2xl font-bold text-rose-400 tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {stats.swaps}
                    <SrOnly>swaps performed</SrOnly>
                </div>
            </div>
        </div>
    );
});

// ============================================
// ACCESSIBLE ARRAY VISUALIZATION (2D)
// ============================================

interface AccessibleArrayVisualizationProps {
    className?: string;
}

export const AccessibleArrayVisualization = memo(function AccessibleArrayVisualization({
    className = "",
}: AccessibleArrayVisualizationProps) {
    const { displayArray } = useAnimationEngine();
    const maxValue = Math.max(...displayArray.map(el => el.value), 100);

    const stateDescriptions: Record<string, string> = {
        default: "",
        comparing: "being compared",
        swapping: "being swapped",
        sorted: "sorted",
        pivot: "pivot element",
    };

    return (
        <div
            role="img"
            aria-label={`Visualization of ${displayArray.length} array elements`}
            className={`relative ${className}`}
        >
            {/* Visual bars (decorative for screen readers) */}
            <div
                className="flex items-end justify-center h-64 gap-1"
                aria-hidden="true"
            >
                {displayArray.map((element, index) => {
                    const heightPercent = (element.value / maxValue) * 100;
                    const colors: Record<string, string> = {
                        default: "bg-purple-500",
                        comparing: "bg-amber-500",
                        swapping: "bg-rose-500",
                        sorted: "bg-emerald-500",
                        pivot: "bg-cyan-500",
                    };

                    return (
                        <motion.div
                            key={index}
                            className={`${colors[element.state]} rounded-t transition-colors`}
                            style={{ width: `${90 / displayArray.length}%` }}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.2 }}
                        />
                    );
                })}
            </div>

            {/* Screen reader description */}
            <div className="sr-only">
                <h3>Array contents:</h3>
                <ul>
                    {displayArray.map((element, index) => (
                        <li key={index}>
                            Position {index + 1}: value {element.value}
                            {stateDescriptions[element.state] && `, ${stateDescriptions[element.state]}`}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

// ============================================
// KEYBOARD SHORTCUTS BUTTON
// ============================================

export function KeyboardShortcutsButton() {
    const { setShowHelp } = useKeyboardShortcuts();

    return (
        <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
            aria-label="Show keyboard shortcuts (Shift + ?)"
        >
            <Keyboard className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Shortcuts</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-slate-700 rounded">?</kbd>
        </button>
    );
}

// ============================================
// ACCESSIBLE ALGORITHM SELECTOR
// ============================================

interface AccessibleAlgorithmSelectorProps {
    algorithms: { id: string; name: string; description: string }[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const AccessibleAlgorithmSelector = memo(function AccessibleAlgorithmSelector({
    algorithms,
    selectedId,
    onSelect,
}: AccessibleAlgorithmSelectorProps) {
    const labelId = useId();

    return (
        <div role="group" aria-labelledby={labelId}>
            <label id={labelId} className="block text-sm text-slate-400 mb-2">
                Select Algorithm
            </label>
            <div
                role="radiogroup"
                aria-labelledby={labelId}
                className="grid grid-cols-2 gap-2"
            >
                {algorithms.map((algo) => (
                    <button
                        key={algo.id}
                        role="radio"
                        aria-checked={selectedId === algo.id}
                        onClick={() => onSelect(algo.id)}
                        className={`p-3 rounded-xl text-left transition-all ${selectedId === algo.id
                                ? "bg-purple-500/20 border-2 border-purple-500 text-white"
                                : "bg-slate-800/50 border-2 border-transparent text-slate-400 hover:bg-slate-700/50"
                            }`}
                    >
                        <div className="font-medium text-sm">{algo.name}</div>
                        <div className="text-xs opacity-70 mt-0.5">{algo.description}</div>
                    </button>
                ))}
            </div>
        </div>
    );
});

// ============================================
// ACCESSIBLE SPEED CONTROL
// ============================================

export const AccessibleSpeedControl = memo(function AccessibleSpeedControl() {
    const { speed, setSpeed } = useAnimationEngine();
    const sliderId = useId();

    // Convert speed (ms) to multiplier for display
    const speedMultiplier = 500 / speed;

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label
                    id={sliderId}
                    className="text-sm text-slate-400"
                >
                    Animation Speed
                </label>
                <span className="text-sm text-purple-400 font-mono">
                    {speedMultiplier.toFixed(1)}x
                </span>
            </div>

            <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                aria-labelledby={sliderId}
                aria-valuetext={`${speedMultiplier.toFixed(1)} times speed`}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-gradient-to-r
                    [&::-webkit-slider-thumb]:from-purple-500
                    [&::-webkit-slider-thumb]:to-cyan-500
                    [&::-webkit-slider-thumb]:cursor-pointer
                "
            />

            <div className="flex justify-between text-xs text-slate-600">
                <span>Slower</span>
                <span>Faster</span>
            </div>
        </div>
    );
});
