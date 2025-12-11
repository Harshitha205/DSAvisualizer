"use client";

import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { useVisualizationStore } from "@/stores/visualizationStore";
import { useAnimationEngine } from "@/stores/animationEngine";

// ============================================
// STATE COLOR CONFIGURATION
// ============================================

const STATE_COLORS = {
    default: {
        gradient: "linear-gradient(180deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)",
        border: "#8b5cf6",
        glow: "rgba(139, 92, 246, 0.4)",
        shadow: "0 4px 20px rgba(139, 92, 246, 0.3)",
    },
    comparing: {
        gradient: "linear-gradient(180deg, #fcd34d 0%, #fbbf24 50%, #f59e0b 100%)",
        border: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.5)",
        shadow: "0 4px 25px rgba(245, 158, 11, 0.4)",
    },
    swapping: {
        gradient: "linear-gradient(180deg, #fb7185 0%, #f43f5e 50%, #e11d48 100%)",
        border: "#f43f5e",
        glow: "rgba(244, 63, 94, 0.5)",
        shadow: "0 4px 25px rgba(244, 63, 94, 0.4)",
    },
    sorted: {
        gradient: "linear-gradient(180deg, #34d399 0%, #10b981 50%, #059669 100%)",
        border: "#10b981",
        glow: "rgba(16, 185, 129, 0.4)",
        shadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
    },
    pivot: {
        gradient: "linear-gradient(180deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)",
        border: "#06b6d4",
        glow: "rgba(6, 182, 212, 0.5)",
        shadow: "0 4px 20px rgba(6, 182, 212, 0.3)",
    },
};

// ============================================
// ANIMATED BAR COMPONENT
// ============================================

interface AnimatedBarProps {
    value: number;
    maxValue: number;
    index: number;
    totalBars: number;
    state: keyof typeof STATE_COLORS;
    swapPhase?: string;
    swapTargetIndex?: number;
}

function AnimatedBar({
    value,
    maxValue,
    index,
    totalBars,
    state,
    swapPhase,
    swapTargetIndex,
}: AnimatedBarProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Calculate dimensions
    const heightPercent = (value / maxValue) * 100;
    const colors = STATE_COLORS[state] || STATE_COLORS.default;

    // Swap animation offset
    const getSwapOffset = () => {
        if (swapPhase === "slide" && swapTargetIndex !== undefined) {
            const direction = swapTargetIndex > index ? 1 : -1;
            const distance = Math.abs(swapTargetIndex - index);
            // Calculate pixel offset based on bar width + gap
            return direction * distance * 100; // Percentage offset
        }
        return 0;
    };

    const swapOffset = getSwapOffset();
    const isSwapping = swapPhase === "lift" || swapPhase === "slide";

    return (
        <motion.div
            ref={containerRef}
            className="relative flex flex-col items-center justify-end"
            style={{
                flex: 1,
                maxWidth: `${Math.min(60, 800 / totalBars)}px`,
            }}
            initial={false}
            animate={{
                y: swapPhase === "lift" || swapPhase === "slide" ? -20 : 0,
                x: swapOffset,
                scale: state === "comparing" || state === "swapping" ? 1.05 : 1,
                zIndex: isSwapping ? 10 : 1,
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                mass: 0.8,
            }}
        >
            {/* Value tooltip */}
            <AnimatePresence>
                {(state === "comparing" || state === "swapping" || state === "pivot") && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        className="absolute -top-8 px-2 py-1 rounded-lg text-xs font-bold text-white"
                        style={{
                            background: colors.gradient,
                            boxShadow: colors.shadow,
                        }}
                    >
                        {value}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bar container */}
            <motion.div
                className="w-full rounded-t-lg relative overflow-hidden"
                style={{
                    background: colors.gradient,
                    boxShadow: colors.shadow,
                    border: `2px solid ${colors.border}`,
                    borderBottom: "none",
                }}
                initial={false}
                animate={{
                    height: `${heightPercent}%`,
                }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                }}
            >
                {/* Shimmer effect for active states */}
                {(state === "comparing" || state === "swapping") && (
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                        }}
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                )}

                {/* Glow overlay */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(ellipse at center top, ${colors.glow}, transparent 70%)`,
                    }}
                />

                {/* Inner highlight */}
                <div
                    className="absolute top-0 left-1 right-1 h-2 rounded-full opacity-50"
                    style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.4), transparent)",
                    }}
                />
            </motion.div>

            {/* Base glow */}
            <div
                className="absolute bottom-0 w-full h-2 rounded-b-lg"
                style={{
                    background: colors.glow,
                    filter: "blur(4px)",
                }}
            />

            {/* Index label */}
            <div className="mt-1 text-[10px] text-slate-500 font-mono">
                {index}
            </div>
        </motion.div>
    );
}

// ============================================
// 2D BAR CHART VISUALIZATION
// ============================================

interface BarChart2DProps {
    className?: string;
    showLabels?: boolean;
    minHeight?: number;
}

export function BarChart2D({
    className = "",
    showLabels = true,
    minHeight = 300,
}: BarChart2DProps) {
    const { array, mode } = useVisualizationStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(minHeight);

    // Update container height on resize
    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                setContainerHeight(containerRef.current.clientHeight);
            }
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    // Calculate max value for scaling
    const maxValue = useMemo(() => {
        if (array.length === 0) return 100;
        return Math.max(...array.map(el => el.value), 1);
    }, [array]);

    if (array.length === 0) {
        return (
            <div className={`flex items-center justify-center ${className}`} style={{ minHeight }}>
                <p className="text-slate-500">No data to display</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${className}`}
            style={{
                minHeight,
                background: "linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(10, 15, 30, 0.8) 100%)",
            }}
        >
            {/* Grid lines */}
            <div className="absolute inset-0 pointer-events-none">
                {[0, 25, 50, 75, 100].map((percent) => (
                    <div
                        key={percent}
                        className="absolute left-0 right-0 border-t border-slate-800/50"
                        style={{ bottom: `${percent}%` }}
                    >
                        {showLabels && (
                            <span className="absolute -left-1 -translate-y-1/2 text-[10px] text-slate-600 font-mono">
                                {Math.round((percent / 100) * maxValue)}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Bars container */}
            <div
                className="absolute inset-x-4 bottom-6 top-4 flex items-end gap-1"
            >
                <AnimatePresence mode="popLayout">
                    {array.map((element, index) => (
                        <AnimatedBar
                            key={index}
                            value={element.value}
                            maxValue={maxValue}
                            index={index}
                            totalBars={array.length}
                            state={element.state}
                            swapPhase={element.swapPhase}
                            swapTargetIndex={element.swapTargetIndex}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-900 to-transparent" />
        </div>
    );
}

// ============================================
// SVG-BASED 2D VISUALIZATION (Alternative)
// ============================================

export function BarChartSVG({ className = "" }: { className?: string }) {
    const { array } = useVisualizationStore();
    const svgRef = useRef<SVGSVGElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    // Update dimensions on resize
    useEffect(() => {
        const updateDimensions = () => {
            if (svgRef.current?.parentElement) {
                setDimensions({
                    width: svgRef.current.parentElement.clientWidth,
                    height: svgRef.current.parentElement.clientHeight,
                });
            }
        };
        updateDimensions();
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    const maxValue = Math.max(...array.map(el => el.value), 1);
    const barWidth = (dimensions.width - 40) / array.length - 4;
    const chartHeight = dimensions.height - 40;

    return (
        <svg
            ref={svgRef}
            className={className}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* Definitions for gradients */}
            <defs>
                {Object.entries(STATE_COLORS).map(([state, colors]) => (
                    <linearGradient
                        key={state}
                        id={`gradient-${state}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                    >
                        <stop offset="0%" stopColor={colors.border} stopOpacity="1" />
                        <stop offset="100%" stopColor={colors.border} stopOpacity="0.6" />
                    </linearGradient>
                ))}

                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                    key={i}
                    x1="20"
                    y1={20 + chartHeight * (1 - ratio)}
                    x2={dimensions.width - 20}
                    y2={20 + chartHeight * (1 - ratio)}
                    stroke="rgba(100, 116, 139, 0.2)"
                    strokeDasharray="4"
                />
            ))}

            {/* Bars */}
            {array.map((element, index) => {
                const barHeight = (element.value / maxValue) * chartHeight;
                const x = 20 + index * (barWidth + 4);
                const y = 20 + chartHeight - barHeight;
                const colors = STATE_COLORS[element.state];
                const isActive = element.state === "comparing" || element.state === "swapping";

                return (
                    <g key={index}>
                        {/* Bar shadow */}
                        <rect
                            x={x + 2}
                            y={y + 2}
                            width={barWidth}
                            height={barHeight}
                            fill="rgba(0,0,0,0.3)"
                            rx="4"
                        />

                        {/* Main bar */}
                        <motion.rect
                            x={x}
                            width={barWidth}
                            rx="4"
                            fill={`url(#gradient-${element.state})`}
                            filter={isActive ? "url(#glow)" : undefined}
                            initial={false}
                            animate={{
                                y,
                                height: barHeight,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                            }}
                        />

                        {/* Value label for active bars */}
                        {isActive && (
                            <motion.text
                                x={x + barWidth / 2}
                                y={y - 10}
                                textAnchor="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {element.value}
                            </motion.text>
                        )}

                        {/* Index label */}
                        <text
                            x={x + barWidth / 2}
                            y={dimensions.height - 8}
                            textAnchor="middle"
                            fill="rgba(148, 163, 184, 0.5)"
                            fontSize="10"
                        >
                            {index}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ============================================
// 2D/3D VIEW MODE TOGGLE
// ============================================

interface ViewModeToggleProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function ViewModeToggle({ className = "", size = "md" }: ViewModeToggleProps) {
    const { mode, setMode } = useVisualizationStore();

    const sizes = {
        sm: { container: "h-8", button: "px-3 text-xs", icon: "w-3 h-3" },
        md: { container: "h-10", button: "px-4 text-sm", icon: "w-4 h-4" },
        lg: { container: "h-12", button: "px-5 text-base", icon: "w-5 h-5" },
    };

    const s = sizes[size];

    return (
        <div
            className={`relative flex rounded-2xl p-1 ${className}`}
            style={{
                background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 15, 30, 0.95))",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
            }}
        >
            {/* Sliding background */}
            <motion.div
                className="absolute rounded-xl"
                style={{
                    background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
                    boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
                }}
                initial={false}
                animate={{
                    x: mode === "2d" ? 4 : "calc(100% + 4px)",
                    width: "calc(50% - 4px)",
                    height: "calc(100% - 8px)",
                    top: 4,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* 2D Button */}
            <button
                onClick={() => setMode("2d")}
                className={`relative z-10 flex items-center gap-2 ${s.container} ${s.button} rounded-xl font-medium transition-colors ${mode === "2d" ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
            >
                <svg className={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="8" width="4" height="12" rx="1" />
                    <rect x="10" y="4" width="4" height="16" rx="1" />
                    <rect x="17" y="10" width="4" height="10" rx="1" />
                </svg>
                2D
            </button>

            {/* 3D Button */}
            <button
                onClick={() => setMode("3d")}
                className={`relative z-10 flex items-center gap-2 ${s.container} ${s.button} rounded-xl font-medium transition-colors ${mode === "3d" ? "text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
            >
                <svg className={s.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3L2 9l10 6 10-6-10-6z" />
                    <path d="M2 15l10 6 10-6" />
                    <path d="M2 9v6" />
                    <path d="M22 9v6" />
                    <path d="M12 9v12" />
                </svg>
                3D
            </button>
        </div>
    );
}

// ============================================
// UNIFIED VISUALIZATION WRAPPER
// Renders either 2D or 3D based on mode
// ============================================

import dynamic from "next/dynamic";

// Dynamically import 3D scene to avoid SSR issues
const SortingScene = dynamic(
    () => import("@/components/3d/SortingScene").then(mod => mod.SortingScene),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading 3D Engine...</span>
                </div>
            </div>
        ),
    }
);

interface UnifiedVisualizationProps {
    className?: string;
}

export function UnifiedVisualization({ className = "" }: UnifiedVisualizationProps) {
    const { mode } = useVisualizationStore();

    return (
        <div className={`relative w-full h-full overflow-hidden rounded-2xl ${className}`}>
            <AnimatePresence mode="wait">
                {mode === "2d" ? (
                    <motion.div
                        key="2d"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <BarChart2D className="w-full h-full" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="3d"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <SortingScene />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mode toggle overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                <ViewModeToggle size="md" />
            </div>
        </div>
    );
}
