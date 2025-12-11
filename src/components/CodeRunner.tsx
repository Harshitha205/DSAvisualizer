"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play,
    Code2,
    Terminal,
    FileCode2,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Cpu,
    ChevronDown,
    Copy,
    RotateCcw,
    AlertTriangle,
    Sparkles,
} from "lucide-react";
import { useCodeRunner, useCodeTemplates } from "@/hooks/useCodeRunner";
import { SupportedLanguage } from "@/lib/codeRunnerTypes";

// ============================================
// LANGUAGE ICONS & COLORS
// ============================================

const LANGUAGE_CONFIG: Record<SupportedLanguage, {
    icon: string;
    color: string;
    bgColor: string;
}> = {
    javascript: { icon: "JS", color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
    python: { icon: "PY", color: "text-blue-400", bgColor: "bg-blue-500/20" },
    cpp: { icon: "C++", color: "text-purple-400", bgColor: "bg-purple-500/20" },
    java: { icon: "JV", color: "text-orange-400", bgColor: "bg-orange-500/20" },
};

// ============================================
// CODE EDITOR COMPONENT
// ============================================

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
    language: SupportedLanguage;
    disabled?: boolean;
}

function CodeEditor({ code, onChange, language, disabled }: CodeEditorProps) {
    const lineCount = code.split("\n").length;

    return (
        <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50">
            {/* Line numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-800/50 border-r border-slate-700/50 select-none overflow-hidden">
                <div className="pt-4 px-2 text-right">
                    {Array.from({ length: Math.max(lineCount, 10) }, (_, i) => (
                        <div key={i} className="text-xs text-slate-600 h-6 leading-6">
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Code textarea */}
            <textarea
                value={code}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full min-h-[300px] pl-16 pr-4 py-4 bg-transparent text-slate-200 font-mono text-sm resize-y focus:outline-none disabled:opacity-50 leading-6"
                placeholder={`// Write your ${language} sorting code here...
// Use compare(i, j) to compare elements
// Use swap(i, j) to swap elements
// Use markSorted(i) to mark element as sorted`}
                spellCheck={false}
            />

            {/* Language badge */}
            <div className={`absolute top-2 right-2 px-2 py-1 rounded ${LANGUAGE_CONFIG[language].bgColor}`}>
                <span className={`text-xs font-bold ${LANGUAGE_CONFIG[language].color}`}>
                    {LANGUAGE_CONFIG[language].icon}
                </span>
            </div>
        </div>
    );
}

// ============================================
// TEMPLATE SELECTOR
// ============================================

interface TemplateSelectorProps {
    onSelect: (code: string, language: SupportedLanguage) => void;
}

function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    const { listTemplates, getTemplate } = useCodeTemplates();
    const [isOpen, setIsOpen] = useState(false);

    const templates = listTemplates();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
            >
                <FileCode2 className="w-4 h-4" />
                Templates
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-slate-800 border border-slate-700/50 shadow-xl z-50 overflow-hidden"
                    >
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => {
                                    const t = getTemplate(template.id);
                                    if (t) {
                                        onSelect(t.code, t.language);
                                        setIsOpen(false);
                                    }
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/30 last:border-0"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white">{template.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${LANGUAGE_CONFIG[template.language].bgColor} ${LANGUAGE_CONFIG[template.language].color}`}>
                                        {template.language}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// OUTPUT PANEL
// ============================================

interface OutputPanelProps {
    result: {
        success: boolean;
        output: string;
        stderr: string;
        executionTime: number;
        memoryUsage: number;
        status: { description: string };
    } | null;
    error: string | null;
    trace: object | null;
}

function OutputPanel({ result, error, trace }: OutputPanelProps) {
    const [activeTab, setActiveTab] = useState<"output" | "trace" | "stats">("output");

    return (
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-700/50">
                {["output", "trace", "stats"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as typeof activeTab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab
                                ? "text-white border-b-2 border-purple-500 bg-purple-500/5"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4 min-h-[200px]">
                {error && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <XCircle className="w-5 h-5 text-rose-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-rose-400">Error</p>
                            <p className="text-sm text-rose-300 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {!error && activeTab === "output" && (
                    <div className="space-y-4">
                        {result ? (
                            <>
                                <div className="flex items-center gap-2">
                                    {result.success ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-rose-400" />
                                    )}
                                    <span className={`text-sm font-medium ${result.success ? "text-emerald-400" : "text-rose-400"}`}>
                                        {result.status.description}
                                    </span>
                                </div>

                                {result.output && (
                                    <pre className="p-4 rounded-lg bg-slate-800/50 text-slate-300 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                                        {result.output.length > 500
                                            ? result.output.slice(0, 500) + "...\n[Output truncated]"
                                            : result.output}
                                    </pre>
                                )}

                                {result.stderr && (
                                    <pre className="p-4 rounded-lg bg-rose-500/10 text-rose-300 text-sm font-mono overflow-x-auto">
                                        {result.stderr}
                                    </pre>
                                )}
                            </>
                        ) : (
                            <p className="text-slate-500 text-sm">Run your code to see output</p>
                        )}
                    </div>
                )}

                {!error && activeTab === "trace" && (
                    <div>
                        {trace ? (
                            <pre className="p-4 rounded-lg bg-slate-800/50 text-slate-300 text-xs font-mono overflow-x-auto max-h-[300px]">
                                {JSON.stringify(trace, null, 2)}
                            </pre>
                        ) : (
                            <p className="text-slate-500 text-sm">No trace data available</p>
                        )}
                    </div>
                )}

                {!error && activeTab === "stats" && result && (
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            icon={Clock}
                            label="Execution Time"
                            value={`${result.executionTime.toFixed(2)} ms`}
                            color="text-cyan-400"
                        />
                        <StatCard
                            icon={Cpu}
                            label="Memory Usage"
                            value={`${(result.memoryUsage / 1024).toFixed(2)} MB`}
                            color="text-purple-400"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType;
    label: string;
    value: string;
    color: string;
}) {
    return (
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className={`text-lg font-mono font-bold ${color}`}>{value}</p>
        </div>
    );
}

// ============================================
// MAIN CODE RUNNER COMPONENT
// ============================================

interface CodeRunnerProps {
    onStepsGenerated?: (steps: unknown[]) => void;
    className?: string;
}

export function CodeRunner({ onStepsGenerated, className = "" }: CodeRunnerProps) {
    const {
        code,
        setCode,
        language,
        setLanguage,
        isExecuting,
        result,
        trace,
        steps,
        error,
        execute,
        reset,
    } = useCodeRunner({ autoConvertToSteps: true });

    // Notify parent when steps are generated
    useEffect(() => {
        if (steps.length > 0 && onStepsGenerated) {
            onStepsGenerated(steps);
        }
    }, [steps, onStepsGenerated]);

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white">Code Runner</h2>
                        <p className="text-xs text-slate-500">Write and visualize your sorting algorithms</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <TemplateSelector onSelect={(code, lang) => {
                        setCode(code);
                        setLanguage(lang);
                    }} />
                </div>
            </div>

            {/* Instructions */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div className="text-sm">
                        <p className="text-amber-300 font-medium">How to use:</p>
                        <ul className="text-amber-200/70 text-xs mt-1 space-y-1">
                            <li>• Use <code className="px-1 bg-amber-500/20 rounded">compare(i, j)</code> to compare elements at indices i and j</li>
                            <li>• Use <code className="px-1 bg-amber-500/20 rounded">swap(i, j)</code> to swap elements</li>
                            <li>• Use <code className="px-1 bg-amber-500/20 rounded">markSorted(i)</code> to mark element as sorted</li>
                            <li>• Use <code className="px-1 bg-amber-500/20 rounded">markPivot(i)</code> to mark pivot element</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-2">
                {(["javascript", "python", "cpp", "java"] as SupportedLanguage[]).map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${language === lang
                                ? `${LANGUAGE_CONFIG[lang].bgColor} ${LANGUAGE_CONFIG[lang].color} ring-2 ring-offset-2 ring-offset-slate-900`
                                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                            }`}
                        style={{ ringColor: language === lang ? LANGUAGE_CONFIG[lang].color.replace("text-", "") : undefined }}
                    >
                        {LANGUAGE_CONFIG[lang].icon}
                    </button>
                ))}
            </div>

            {/* Code editor */}
            <CodeEditor
                code={code}
                onChange={setCode}
                language={language}
                disabled={isExecuting}
            />

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => execute()}
                    disabled={isExecuting || !code.trim()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExecuting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            Run & Visualize
                        </>
                    )}
                </button>

                <button
                    onClick={reset}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-800 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                </button>

                {steps.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto px-4 py-2 rounded-lg bg-purple-500/10">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">
                            {steps.length} steps generated
                        </span>
                    </div>
                )}
            </div>

            {/* Output */}
            <OutputPanel
                result={result}
                error={error}
                trace={trace}
            />
        </div>
    );
}
