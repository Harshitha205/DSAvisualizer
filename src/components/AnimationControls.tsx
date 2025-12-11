"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Gauge,
    Activity,
    ArrowLeftRight,
    Clock,
} from "lucide-react";
import {
    useAnimationControls,
    useAnimationStats,
    useAnimationPlayback,
    useAnimationArray,
} from "@/hooks/useAnimationEngine";

// ============================================
// PLAYBACK CONTROLS COMPONENT
// ============================================

export function PlaybackControls() {
    const {
        play,
        pause,
        reset,
        nextStep,
        previousStep,
        togglePlayPause,
        skipToEnd,
        canGoNext,
        canGoPrevious,
        isPlaying,
        isPaused,
        isComplete,
    } = useAnimationControls();

    const { hasData } = useAnimationArray();

    return (
        <div className="flex items-center justify-center gap-2">
            {/* Skip to Start */}
            <ControlButton
                onClick={reset}
                disabled={!hasData}
                tooltip="Reset (R)"
            >
                <SkipBack className="w-4 h-4" />
            </ControlButton>

            {/* Previous Step */}
            <ControlButton
                onClick={previousStep}
                disabled={!canGoPrevious}
                tooltip="Previous Step (←)"
            >
                <ChevronLeft className="w-5 h-5" />
            </ControlButton>

            {/* Play/Pause */}
            <motion.button
                onClick={togglePlayPause}
                disabled={!hasData || isComplete}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${!hasData || isComplete
                        ? "bg-slate-800/50 cursor-not-allowed opacity-50"
                        : "bg-gradient-to-br from-purple-600 to-cyan-600 hover:shadow-lg hover:shadow-purple-500/30"
                    }`}
                whileHover={hasData && !isComplete ? { scale: 1.05 } : {}}
                whileTap={hasData && !isComplete ? { scale: 0.95 } : {}}
            >
                {isPlaying ? (
                    <Pause className="w-6 h-6 text-white" />
                ) : (
                    <Play className="w-6 h-6 text-white ml-0.5" />
                )}
            </motion.button>

            {/* Next Step */}
            <ControlButton
                onClick={nextStep}
                disabled={!canGoNext}
                tooltip="Next Step (→)"
            >
                <ChevronRight className="w-5 h-5" />
            </ControlButton>

            {/* Skip to End */}
            <ControlButton
                onClick={skipToEnd}
                disabled={!canGoNext}
                tooltip="Skip to End"
            >
                <SkipForward className="w-4 h-4" />
            </ControlButton>
        </div>
    );
}

// ============================================
// CONTROL BUTTON COMPONENT
// ============================================

function ControlButton({
    onClick,
    disabled,
    children,
    tooltip,
}: {
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
    tooltip?: string;
}) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            title={tooltip}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${disabled
                    ? "bg-slate-800/30 text-slate-600 cursor-not-allowed"
                    : "bg-slate-800/50 text-slate-300 hover:bg-purple-500/20 hover:text-white border border-transparent hover:border-purple-500/30"
                }`}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
        >
            {children}
        </motion.button>
    );
}

// ============================================
// SPEED SLIDER COMPONENT
// ============================================

export function SpeedSlider() {
    const { speed, setSpeed } = useAnimationControls();

    // Speed presets (in ms - lower is faster)
    const presets = [
        { label: "0.25x", value: 2000 },
        { label: "0.5x", value: 1000 },
        { label: "1x", value: 500 },
        { label: "2x", value: 250 },
        { label: "4x", value: 100 },
    ];

    const currentPreset = presets.find(p => p.value === speed);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-400 font-medium">Speed</span>
                </div>
                <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg">
                    {currentPreset?.label || `${speed}ms`}
                </span>
            </div>

            {/* Preset buttons */}
            <div className="flex gap-1">
                {presets.map((preset) => (
                    <button
                        key={preset.value}
                        onClick={() => setSpeed(preset.value)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${speed === preset.value
                                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                                : "bg-slate-800/50 text-slate-400 hover:bg-purple-500/20 hover:text-white"
                            }`}
                    >
                        {preset.label}
                    </button>
                ))}
            </div>

            {/* Custom slider */}
            <div className="relative h-2 rounded-full bg-slate-800/50">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
                    style={{ width: `${((2000 - speed) / 1900) * 100}%` }}
                />
                <input
                    type="range"
                    min={100}
                    max={2000}
                    step={50}
                    value={2100 - speed}
                    onChange={(e) => setSpeed(2100 - Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    );
}

// ============================================
// PROGRESS BAR COMPONENT
// ============================================

export function ProgressBar() {
    const { progress, currentStepIndex, totalSteps, stepDescription } = useAnimationStats();
    const { goToStep } = useAnimationControls();

    return (
        <div className="space-y-2">
            {/* Progress text */}
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="text-purple-400 font-mono">
                    {currentStepIndex} / {totalSteps}
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="relative h-2 rounded-full bg-slate-800/50 cursor-pointer overflow-hidden"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = x / rect.width;
                    const stepIndex = Math.floor(percent * totalSteps);
                    goToStep(Math.min(stepIndex, totalSteps - 1));
                }}
            >
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-violet-500 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            {/* Step description */}
            <p className="text-xs text-slate-500 truncate" title={stepDescription}>
                {stepDescription}
            </p>
        </div>
    );
}

// ============================================
// STATS DISPLAY COMPONENT
// ============================================

export function StatsDisplay() {
    const { currentComparisons, currentSwaps, stepType } = useAnimationStats();

    return (
        <div className="grid grid-cols-2 gap-3">
            <StatCard
                icon={Activity}
                label="Comparisons"
                value={currentComparisons}
                color="text-amber-400"
                bgColor="from-amber-500/10 to-orange-500/5"
                isActive={stepType === "compare"}
            />
            <StatCard
                icon={ArrowLeftRight}
                label="Swaps"
                value={currentSwaps}
                color="text-rose-400"
                bgColor="from-rose-500/10 to-pink-500/5"
                isActive={stepType === "swap"}
            />
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    color,
    bgColor,
    isActive,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
    bgColor: string;
    isActive: boolean;
}) {
    return (
        <motion.div
            className={`relative p-4 rounded-2xl overflow-hidden transition-all ${isActive ? "ring-2 ring-purple-500/50" : ""
                }`}
            style={{
                background: `linear-gradient(145deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))`,
                border: "1px solid rgba(255,255,255,0.04)",
            }}
            animate={isActive ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-50`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <motion.span
                        key={value}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-2xl font-bold ${color} tabular-nums`}
                    >
                        {value}
                    </motion.span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {label}
                </span>
            </div>
        </motion.div>
    );
}

// ============================================
// STEP INFO COMPONENT
// ============================================

export function StepInfo() {
    const { stepType, stepDescription, highlightIndices } = useAnimationStats();
    const { currentStep, totalSteps } = useAnimationPlayback();

    const stepTypeColors: Record<string, string> = {
        compare: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        swap: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        mark_sorted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        mark_pivot: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        complete: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        default: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    };

    const typeColor = stepTypeColors[stepType || "default"] || stepTypeColors.default;

    return (
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Current Step</span>
                </div>
                <span className="text-xs font-mono text-slate-500">
                    {currentStep} / {totalSteps}
                </span>
            </div>

            {stepType && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${typeColor}`}>
                    {stepType.replace("_", " ").toUpperCase()}
                </div>
            )}

            <p className="text-sm text-slate-400">{stepDescription}</p>

            {highlightIndices.length > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Indices:</span>
                    <div className="flex gap-1">
                        {highlightIndices.map((idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono"
                            >
                                {idx}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// FULL ANIMATION CONTROL PANEL
// ============================================

export function AnimationControlPanel() {
    return (
        <div className="space-y-6">
            {/* Playback Controls */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/10">
                <PlaybackControls />
            </div>

            {/* Progress */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/10">
                <ProgressBar />
            </div>

            {/* Speed Control */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/10">
                <SpeedSlider />
            </div>

            {/* Stats */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border border-purple-500/10">
                <StatsDisplay />
            </div>

            {/* Step Info */}
            <StepInfo />
        </div>
    );
}
