"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ChevronRight, PlayCircle } from "lucide-react";
import { useAnimationEngine } from "@/stores/animationEngine";

// ============================================
// PSEUDOCODE DATA
// Each algorithm has its pseudocode with line mappings
// ============================================

interface PseudoCodeLine {
    id: number;
    code: string;
    indent: number;
    isComment?: boolean;
    stepTypes?: string[];  // Which step types highlight this line
}

interface AlgorithmPseudocode {
    name: string;
    complexity: { time: string; space: string };
    lines: PseudoCodeLine[];
}

const ALGORITHM_PSEUDOCODE: Record<string, AlgorithmPseudocode> = {
    bubble: {
        name: "Bubble Sort",
        complexity: { time: "O(n²)", space: "O(1)" },
        lines: [
            { id: 1, code: "procedure bubbleSort(A: list)", indent: 0 },
            { id: 2, code: "n ← length(A)", indent: 1 },
            { id: 3, code: "for i ← 0 to n-1 do", indent: 1 },
            { id: 4, code: "for j ← 0 to n-i-1 do", indent: 2 },
            { id: 5, code: "if A[j] > A[j+1] then", indent: 3, stepTypes: ["compare"] },
            { id: 6, code: "swap A[j] and A[j+1]", indent: 4, stepTypes: ["swap"] },
            { id: 7, code: "end if", indent: 3 },
            { id: 8, code: "end for", indent: 2 },
            { id: 9, code: "// Element at n-i-1 is sorted", indent: 2, isComment: true, stepTypes: ["mark_sorted"] },
            { id: 10, code: "end for", indent: 1 },
            { id: 11, code: "return A", indent: 1, stepTypes: ["complete"] },
            { id: 12, code: "end procedure", indent: 0 },
        ],
    },
    selection: {
        name: "Selection Sort",
        complexity: { time: "O(n²)", space: "O(1)" },
        lines: [
            { id: 1, code: "procedure selectionSort(A: list)", indent: 0 },
            { id: 2, code: "n ← length(A)", indent: 1 },
            { id: 3, code: "for i ← 0 to n-1 do", indent: 1 },
            { id: 4, code: "minIdx ← i", indent: 2 },
            { id: 5, code: "for j ← i+1 to n do", indent: 2 },
            { id: 6, code: "if A[j] < A[minIdx] then", indent: 3, stepTypes: ["compare"] },
            { id: 7, code: "minIdx ← j", indent: 4, stepTypes: ["mark_pivot"] },
            { id: 8, code: "end if", indent: 3 },
            { id: 9, code: "end for", indent: 2 },
            { id: 10, code: "swap A[i] and A[minIdx]", indent: 2, stepTypes: ["swap"] },
            { id: 11, code: "// A[i] is now sorted", indent: 2, isComment: true, stepTypes: ["mark_sorted"] },
            { id: 12, code: "end for", indent: 1 },
            { id: 13, code: "return A", indent: 1, stepTypes: ["complete"] },
            { id: 14, code: "end procedure", indent: 0 },
        ],
    },
    insertion: {
        name: "Insertion Sort",
        complexity: { time: "O(n²)", space: "O(1)" },
        lines: [
            { id: 1, code: "procedure insertionSort(A: list)", indent: 0 },
            { id: 2, code: "for i ← 1 to length(A) do", indent: 1 },
            { id: 3, code: "key ← A[i]", indent: 2, stepTypes: ["mark_pivot"] },
            { id: 4, code: "j ← i - 1", indent: 2 },
            { id: 5, code: "while j >= 0 and A[j] > key do", indent: 2, stepTypes: ["compare"] },
            { id: 6, code: "A[j+1] ← A[j]  // shift right", indent: 3, stepTypes: ["swap"] },
            { id: 7, code: "j ← j - 1", indent: 3 },
            { id: 8, code: "end while", indent: 2 },
            { id: 9, code: "A[j+1] ← key", indent: 2, stepTypes: ["mark_sorted"] },
            { id: 10, code: "end for", indent: 1 },
            { id: 11, code: "return A", indent: 1, stepTypes: ["complete"] },
            { id: 12, code: "end procedure", indent: 0 },
        ],
    },
    quick: {
        name: "Quick Sort",
        complexity: { time: "O(n log n)", space: "O(log n)" },
        lines: [
            { id: 1, code: "procedure quickSort(A, low, high)", indent: 0 },
            { id: 2, code: "if low < high then", indent: 1 },
            { id: 3, code: "pivot ← partition(A, low, high)", indent: 2, stepTypes: ["mark_pivot"] },
            { id: 4, code: "quickSort(A, low, pivot - 1)", indent: 2 },
            { id: 5, code: "quickSort(A, pivot + 1, high)", indent: 2 },
            { id: 6, code: "end if", indent: 1 },
            { id: 7, code: "end procedure", indent: 0 },
            { id: 8, code: "", indent: 0 },
            { id: 9, code: "procedure partition(A, low, high)", indent: 0 },
            { id: 10, code: "pivot ← A[high]", indent: 1 },
            { id: 11, code: "i ← low - 1", indent: 1 },
            { id: 12, code: "for j ← low to high-1 do", indent: 1 },
            { id: 13, code: "if A[j] <= pivot then", indent: 2, stepTypes: ["compare"] },
            { id: 14, code: "i ← i + 1", indent: 3 },
            { id: 15, code: "swap A[i] and A[j]", indent: 3, stepTypes: ["swap"] },
            { id: 16, code: "end if", indent: 2 },
            { id: 17, code: "end for", indent: 1 },
            { id: 18, code: "swap A[i+1] and A[high]", indent: 1, stepTypes: ["swap"] },
            { id: 19, code: "return i + 1", indent: 1, stepTypes: ["mark_sorted"] },
            { id: 20, code: "end procedure", indent: 0, stepTypes: ["complete"] },
        ],
    },
};

// ============================================
// HOOK FOR SYNCING HIGHLIGHT WITH STEPS
// ============================================

export function usePseudoCodeHighlight(algorithm: string) {
    const { getCurrentStep, currentStepIndex, playbackState } = useAnimationEngine();

    const currentStep = getCurrentStep();
    const pseudocode = ALGORITHM_PSEUDOCODE[algorithm] || ALGORITHM_PSEUDOCODE.bubble;

    // Find which lines to highlight based on current step type
    const highlightedLineIds = useMemo(() => {
        if (!currentStep) return [];

        return pseudocode.lines
            .filter(line => line.stepTypes?.includes(currentStep.type))
            .map(line => line.id);
    }, [currentStep, pseudocode.lines]);

    return {
        pseudocode,
        highlightedLineIds,
        currentStepType: currentStep?.type ?? null,
        isPlaying: playbackState === "playing",
        currentStepIndex,
    };
}

// ============================================
// PSEUDOCODE VIEWER COMPONENT
// ============================================

interface PseudoCodeViewerProps {
    algorithm: string;
    className?: string;
}

export function PseudoCodeViewer({
    algorithm,
    className = ""
}: PseudoCodeViewerProps) {
    const {
        pseudocode,
        highlightedLineIds,
        currentStepType,
        isPlaying,
    } = usePseudoCodeHighlight(algorithm);

    const containerRef = useRef<HTMLDivElement>(null);
    const highlightedRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to highlighted line
    useEffect(() => {
        if (highlightedRef.current && containerRef.current) {
            highlightedRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [highlightedLineIds]);

    return (
        <div className={`rounded-2xl overflow-hidden ${className}`}
            style={{
                background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 15, 30, 0.95))",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
            }}
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Code2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">
                                {pseudocode.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono">
                                    Time: {pseudocode.complexity.time}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-mono">
                                    Space: {pseudocode.complexity.space}
                                </span>
                            </div>
                        </div>
                    </div>

                    {isPlaying && (
                        <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10"
                        >
                            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-medium">Running</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Code Container */}
            <div
                ref={containerRef}
                className="p-4 overflow-y-auto max-h-[400px] scrollbar-thin"
                style={{ scrollbarColor: "#4c1d95 transparent" }}
            >
                <div className="space-y-0.5">
                    <AnimatePresence>
                        {pseudocode.lines.map((line) => (
                            <CodeLine
                                key={line.id}
                                line={line}
                                isHighlighted={highlightedLineIds.includes(line.id)}
                                ref={highlightedLineIds.includes(line.id) ? highlightedRef : null}
                                stepType={currentStepType}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Step Type Legend */}
            <div className="px-5 py-3 border-t border-slate-800/50 bg-slate-900/30">
                <div className="flex items-center gap-3 flex-wrap">
                    <LegendItem color="text-amber-400" bgColor="bg-amber-500" label="Compare" />
                    <LegendItem color="text-rose-400" bgColor="bg-rose-500" label="Swap" />
                    <LegendItem color="text-cyan-400" bgColor="bg-cyan-500" label="Pivot" />
                    <LegendItem color="text-emerald-400" bgColor="bg-emerald-500" label="Sorted" />
                </div>
            </div>
        </div>
    );
}

// ============================================
// CODE LINE COMPONENT
// ============================================

interface CodeLineProps {
    line: PseudoCodeLine;
    isHighlighted: boolean;
    stepType: string | null;
}

const CodeLine = React.forwardRef<HTMLDivElement, CodeLineProps>(
    ({ line, isHighlighted, stepType }, ref) => {
        // Get highlight color based on step type
        const getHighlightStyle = () => {
            if (!isHighlighted) return {};

            const colors: Record<string, { bg: string; border: string; glow: string }> = {
                compare: {
                    bg: "rgba(245, 158, 11, 0.15)",
                    border: "rgba(245, 158, 11, 0.5)",
                    glow: "rgba(245, 158, 11, 0.3)",
                },
                swap: {
                    bg: "rgba(244, 63, 94, 0.15)",
                    border: "rgba(244, 63, 94, 0.5)",
                    glow: "rgba(244, 63, 94, 0.3)",
                },
                mark_pivot: {
                    bg: "rgba(6, 182, 212, 0.15)",
                    border: "rgba(6, 182, 212, 0.5)",
                    glow: "rgba(6, 182, 212, 0.3)",
                },
                mark_sorted: {
                    bg: "rgba(16, 185, 129, 0.15)",
                    border: "rgba(16, 185, 129, 0.5)",
                    glow: "rgba(16, 185, 129, 0.3)",
                },
                complete: {
                    bg: "rgba(139, 92, 246, 0.15)",
                    border: "rgba(139, 92, 246, 0.5)",
                    glow: "rgba(139, 92, 246, 0.3)",
                },
            };

            return colors[stepType || ""] || colors.compare;
        };

        const highlightStyle = getHighlightStyle();

        return (
            <motion.div
                ref={ref}
                className={`relative flex items-center rounded-lg transition-all duration-200 ${isHighlighted ? "z-10" : ""
                    }`}
                style={{
                    paddingLeft: `${line.indent * 20 + 12}px`,
                    paddingRight: "12px",
                    paddingTop: "6px",
                    paddingBottom: "6px",
                    backgroundColor: isHighlighted ? highlightStyle.bg : "transparent",
                    borderLeft: isHighlighted ? `3px solid ${highlightStyle.border}` : "3px solid transparent",
                    boxShadow: isHighlighted ? `0 0 20px ${highlightStyle.glow}` : "none",
                }}
                animate={isHighlighted ? {
                    backgroundColor: [highlightStyle.bg, `${highlightStyle.bg}`, highlightStyle.bg],
                } : {}}
                transition={{ duration: 0.5 }}
            >
                {/* Line number */}
                <span className={`w-6 text-right mr-4 text-xs font-mono ${isHighlighted ? "text-slate-300" : "text-slate-600"
                    }`}>
                    {line.id}
                </span>

                {/* Arrow indicator */}
                <AnimatePresence>
                    {isHighlighted && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="absolute left-1"
                        >
                            <ChevronRight
                                className="w-3.5 h-3.5"
                                style={{ color: highlightStyle.border }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Code content */}
                <span
                    className={`font-mono text-sm ${line.isComment
                            ? "text-slate-500 italic"
                            : isHighlighted
                                ? "text-white font-medium"
                                : "text-slate-400"
                        }`}
                >
                    {line.code || "\u00A0"}
                </span>

                {/* Animated underline for highlighted line */}
                {isHighlighted && (
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{
                            background: `linear-gradient(90deg, transparent, ${highlightStyle.border}, transparent)`
                        }}
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </motion.div>
        );
    }
);

CodeLine.displayName = "CodeLine";

// ============================================
// LEGEND ITEM
// ============================================

function LegendItem({
    color,
    bgColor,
    label
}: {
    color: string;
    bgColor: string;
    label: string;
}) {
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${bgColor}`} />
            <span className={`text-[10px] ${color}`}>{label}</span>
        </div>
    );
}

// ============================================
// COMPACT PSEUDOCODE VIEWER (for sidebar)
// ============================================

export function CompactPseudoCodeViewer({ algorithm }: { algorithm: string }) {
    const {
        pseudocode,
        highlightedLineIds,
        currentStepType,
    } = usePseudoCodeHighlight(algorithm);

    // Show only relevant lines (highlighted + context)
    const visibleLines = useMemo(() => {
        if (highlightedLineIds.length === 0) {
            return pseudocode.lines.slice(0, 5);
        }

        const highlightedIdx = pseudocode.lines.findIndex(
            l => highlightedLineIds.includes(l.id)
        );

        const start = Math.max(0, highlightedIdx - 1);
        const end = Math.min(pseudocode.lines.length, highlightedIdx + 3);

        return pseudocode.lines.slice(start, end);
    }, [highlightedLineIds, pseudocode.lines]);

    return (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50">
            <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium text-slate-300">
                    {pseudocode.name}
                </span>
            </div>
            <div className="space-y-1">
                {visibleLines.map((line) => (
                    <div
                        key={line.id}
                        className={`text-[11px] font-mono py-1 px-2 rounded transition-all ${highlightedLineIds.includes(line.id)
                                ? "bg-purple-500/20 text-white border-l-2 border-purple-500"
                                : "text-slate-500"
                            }`}
                        style={{ marginLeft: line.indent * 8 }}
                    >
                        {line.code || "\u00A0"}
                    </div>
                ))}
            </div>
        </div>
    );
}
