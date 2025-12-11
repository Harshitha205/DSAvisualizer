"use client";

import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    ArrowLeftRight,
    CheckCircle2,
    TrendingUp,
    Clock,
    Zap,
    BarChart3,
    Timer,
} from "lucide-react";
import { useAnimationEngine } from "@/stores/animationEngine";

// ============================================
// STATISTICS HOOK
// ============================================

export function useStatistics() {
    const { displayArray, getCurrentStep, steps, currentStepIndex } = useAnimationEngine();

    const currentStep = getCurrentStep();

    // Count sorted elements
    const sortedCount = useMemo(() => {
        return displayArray.filter(el => el.state === "sorted").length;
    }, [displayArray]);

    // Calculate progress percentage
    const progressPercent = useMemo(() => {
        if (steps.length === 0) return 0;
        return ((currentStepIndex + 1) / steps.length) * 100;
    }, [steps.length, currentStepIndex]);

    // Estimated time remaining (based on remaining steps and speed)
    const { speed } = useAnimationEngine();
    const estimatedTimeRemaining = useMemo(() => {
        if (currentStepIndex >= steps.length - 1) return 0;
        const remainingSteps = steps.length - currentStepIndex - 1;
        return Math.round((remainingSteps * speed) / 1000); // seconds
    }, [steps.length, currentStepIndex, speed]);

    return {
        comparisons: currentStep?.stats.comparisons ?? 0,
        swaps: currentStep?.stats.swaps ?? 0,
        sortedCount,
        totalElements: displayArray.length,
        progressPercent,
        estimatedTimeRemaining,
        currentStepType: currentStep?.type ?? null,
        isComplete: currentStep?.type === "complete",
    };
}

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================

function AnimatedCounter({
    value,
    duration = 300,
}: {
    value: number;
    duration?: number;
}) {
    const [displayValue, setDisplayValue] = useState(value);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (value !== displayValue) {
            setIsAnimating(true);
            setDisplayValue(value);
            const timer = setTimeout(() => setIsAnimating(false), duration);
            return () => clearTimeout(timer);
        }
    }, [value, displayValue, duration]);

    return (
        <motion.span
            key={value}
            initial={{ scale: 1.3, opacity: 0, y: -10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={isAnimating ? "text-white" : ""}
        >
            {displayValue}
        </motion.span>
    );
}

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    total?: number;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    isActive?: boolean;
    showProgress?: boolean;
}

function StatCard({
    icon: Icon,
    label,
    value,
    total,
    color,
    gradientFrom,
    gradientTo,
    isActive,
    showProgress,
}: StatCardProps) {
    const progressPercent = total ? (value / total) * 100 : 0;

    return (
        <motion.div
            className={`relative p-4 rounded-2xl overflow-hidden transition-all duration-300 ${isActive ? "ring-2 ring-offset-2 ring-offset-slate-950" : ""
                }`}
            style={{
                background: `linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))`,
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: isActive
                    ? `0 0 20px ${gradientFrom}40, inset 0 1px 0 rgba(255,255,255,0.05)`
                    : "inset 0 1px 0 rgba(255,255,255,0.03)",
                ringColor: gradientFrom,
            }}
            animate={isActive ? {
                scale: [1, 1.02, 1],
                boxShadow: [
                    `0 0 20px ${gradientFrom}40`,
                    `0 0 30px ${gradientFrom}60`,
                    `0 0 20px ${gradientFrom}40`,
                ]
            } : {}}
            transition={{ duration: 0.5 }}
        >
            {/* Background gradient */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    background: `linear-gradient(135deg, ${gradientFrom}20: ${gradientTo}10)`,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${gradientFrom}20` }}
                    >
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="text-right">
                        <div className={`text-2xl font-bold ${color} tabular-nums`}>
                            <AnimatedCounter value={value} />
                        </div>
                        {total !== undefined && (
                            <div className="text-xs text-slate-500">/ {total}</div>
                        )}
                    </div>
                </div>

                {/* Label */}
                <div className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
                    {label}
                </div>

                {/* Progress bar */}
                {showProgress && total && (
                    <div className="mt-3 h-1.5 rounded-full bg-slate-800/50 overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ============================================
// LIVE STATISTICS PANEL
// ============================================

export function LiveStatisticsPanel() {
    const stats = useStatistics();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">Live Statistics</h3>
                </div>
                {stats.isComplete && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs"
                    >
                        <CheckCircle2 className="w-3 h-3" />
                        Complete
                    </motion.div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon={Activity}
                    label="Comparisons"
                    value={stats.comparisons}
                    color="text-amber-400"
                    gradientFrom="#f59e0b"
                    gradientTo="#d97706"
                    isActive={stats.currentStepType === "compare"}
                />
                <StatCard
                    icon={ArrowLeftRight}
                    label="Swaps"
                    value={stats.swaps}
                    color="text-rose-400"
                    gradientFrom="#f43f5e"
                    gradientTo="#e11d48"
                    isActive={stats.currentStepType === "swap"}
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Sorted"
                    value={stats.sortedCount}
                    total={stats.totalElements}
                    color="text-emerald-400"
                    gradientFrom="#10b981"
                    gradientTo="#059669"
                    isActive={stats.currentStepType === "mark_sorted"}
                    showProgress
                />
                <StatCard
                    icon={TrendingUp}
                    label="Progress"
                    value={Math.round(stats.progressPercent)}
                    total={100}
                    color="text-purple-400"
                    gradientFrom="#8b5cf6"
                    gradientTo="#7c3aed"
                    showProgress
                />
            </div>

            {/* Time Remaining */}
            {stats.estimatedTimeRemaining > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50"
                >
                    <Timer className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-400">
                        Est. time remaining:{" "}
                        <span className="text-purple-400 font-mono">
                            {stats.estimatedTimeRemaining}s
                        </span>
                    </span>
                </motion.div>
            )}
        </div>
    );
}

// ============================================
// COMPACT STATS BAR (for header)
// ============================================

export function CompactStatsBar() {
    const stats = useStatistics();

    return (
        <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <StatBadge
                icon={Activity}
                value={stats.comparisons}
                color="text-amber-400"
                bgColor="bg-amber-500/10"
                isActive={stats.currentStepType === "compare"}
            />
            <StatBadge
                icon={ArrowLeftRight}
                value={stats.swaps}
                color="text-rose-400"
                bgColor="bg-rose-500/10"
                isActive={stats.currentStepType === "swap"}
            />
            <StatBadge
                icon={CheckCircle2}
                value={`${stats.sortedCount}/${stats.totalElements}`}
                color="text-emerald-400"
                bgColor="bg-emerald-500/10"
                isActive={stats.currentStepType === "mark_sorted"}
            />
            <div className="flex-1 h-1.5 rounded-full bg-slate-800">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    animate={{ width: `${stats.progressPercent}%` }}
                    transition={{ duration: 0.2 }}
                />
            </div>
        </div>
    );
}

function StatBadge({
    icon: Icon,
    value,
    color,
    bgColor,
    isActive,
}: {
    icon: React.ElementType;
    value: number | string;
    color: string;
    bgColor: string;
    isActive: boolean;
}) {
    return (
        <motion.div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${bgColor} ${isActive ? "ring-1 ring-offset-1 ring-offset-slate-950" : ""
                }`}
            style={{ ringColor: isActive ? color : "transparent" }}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className={`text-xs font-mono ${color}`}>{value}</span>
        </motion.div>
    );
}
