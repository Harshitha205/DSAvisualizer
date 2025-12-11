"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot,
    Send,
    Sparkles,
    BookOpen,
    MessageCircle,
    Lightbulb,
    GraduationCap,
    ChevronRight,
    RefreshCw,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ArrowRight,
    Loader2,
    Trash2,
} from "lucide-react";
import {
    useAIStepExplanation,
    useAIChat,
    useAIQuiz
} from "@/hooks/useAITutor";
import { EXAMPLE_CHAT_PROMPTS, ALGORITHM_METADATA } from "@/lib/aiTutorTypes";

// ============================================
// STEP EXPLANATION PANEL
// Shows AI explanation for current step
// ============================================

export function StepExplanationPanel() {
    const { explanation, isLoading, error, explain, context } = useAIStepExplanation(false);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-purple-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Step Explanation</h3>
                </div>
                <button
                    onClick={explain}
                    disabled={isLoading || !context}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium hover:bg-purple-500/30 transition-colors disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Sparkles className="w-3 h-3" />
                    )}
                    Explain
                </button>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-8"
                    >
                        <div className="flex items-center gap-2 text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Analyzing step...</span>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                {explanation && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {/* Main explanation */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/10">
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {explanation.explanation}
                            </p>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <InfoCard
                                icon={BookOpen}
                                label="What happened"
                                content={explanation.whatHappened}
                                color="text-cyan-400"
                            />
                            <InfoCard
                                icon={HelpCircle}
                                label="Why it matters"
                                content={explanation.whyItMatters}
                                color="text-purple-400"
                            />
                        </div>

                        {/* Next step hint */}
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/30">
                            <ArrowRight className="w-4 h-4 text-emerald-400 mt-0.5" />
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Next</span>
                                <p className="text-xs text-slate-400">{explanation.nextStepHint}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {!explanation && !isLoading && !error && (
                    <div className="py-8 text-center text-slate-500 text-sm">
                        Click "Explain" to get an AI-powered explanation of the current step
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function InfoCard({
    icon: Icon,
    label,
    content,
    color,
}: {
    icon: React.ElementType;
    label: string;
    content: string;
    color: string;
}) {
    return (
        <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className={`w-3 h-3 ${color}`} />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{content}</p>
        </div>
    );
}

// ============================================
// AI CHAT COMPONENT
// ============================================

interface AIChatProps {
    className?: string;
}

export function AIChat({ className = "" }: AIChatProps) {
    const { messages, isLoading, sendMessage, clearChat } = useAIChat();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            sendMessage(input);
            setInput("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        setInput(prompt);
        inputRef.current?.focus();
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">AI Tutor</h3>
                        <p className="text-xs text-slate-500">Ask me anything about algorithms</p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-500 hover:text-slate-300 transition-colors"
                    title="Clear chat"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-slate-400">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-sm">Thinking...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-4 py-2 border-t border-slate-800/30">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {EXAMPLE_CHAT_PROMPTS.slice(0, 4).map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => handleQuickPrompt(prompt)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-slate-800/50 text-slate-400 text-xs hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-800/50">
                <div className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChatBubble({ message }: { message: { role: string; content: string } }) {
    const isUser = message.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl ${isUser
                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                        : "bg-slate-800/50 border border-slate-700/30 text-slate-200"
                    }`}
            >
                <div
                    className="text-sm prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                        __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.*?)\*/g, "<em>$1</em>")
                            .replace(/\n/g, "<br />")
                    }}
                />
            </div>
        </motion.div>
    );
}

// ============================================
// QUIZ COMPONENT
// ============================================

interface QuizPanelProps {
    algorithmName?: string;
    className?: string;
}

export function QuizPanel({ algorithmName = "bubble", className = "" }: QuizPanelProps) {
    const {
        quiz,
        isLoading,
        generateQuiz,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        answers,
        answerQuestion,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        resetQuiz,
        showResults,
        score,
        progress,
    } = useAIQuiz();

    const meta = ALGORITHM_METADATA[algorithmName as keyof typeof ALGORITHM_METADATA];

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Quiz Mode</h3>
                        <p className="text-xs text-slate-500">Test your knowledge</p>
                    </div>
                </div>

                {!quiz && (
                    <button
                        onClick={() => generateQuiz(algorithmName)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        Generate Quiz
                    </button>
                )}
            </div>

            {/* Quiz content */}
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-4" />
                        <p className="text-slate-400">Generating quiz for {meta?.name || algorithmName}...</p>
                    </motion.div>
                )}

                {quiz && !showResults && currentQuestion && (
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        {/* Progress */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                                <span>{Math.round(progress)}% complete</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-800">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question */}
                        <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/30">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${currentQuestion.type === "code_trace"
                                        ? "bg-purple-500/20 text-purple-300"
                                        : "bg-cyan-500/20 text-cyan-300"
                                    }`}>
                                    {currentQuestion.type === "code_trace" ? "Code Trace" : "MCQ"}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${currentQuestion.difficulty === "easy"
                                        ? "bg-emerald-500/20 text-emerald-300"
                                        : currentQuestion.difficulty === "medium"
                                            ? "bg-amber-500/20 text-amber-300"
                                            : "bg-rose-500/20 text-rose-300"
                                    }`}>
                                    {currentQuestion.difficulty}
                                </span>
                            </div>
                            <p className="text-white font-medium">{currentQuestion.question}</p>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                            {currentQuestion.options?.map((option, i) => {
                                const isSelected = answers.get(currentQuestion.id) === i;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => answerQuestion(currentQuestion.id, i)}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${isSelected
                                                ? "bg-purple-500/20 border-2 border-purple-500 text-white"
                                                : "bg-slate-800/30 border border-slate-700/30 text-slate-300 hover:bg-slate-800/50"
                                            }`}
                                    >
                                        <span className="text-sm">{option}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between pt-4">
                            <button
                                onClick={previousQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {currentQuestionIndex < totalQuestions - 1 ? (
                                <button
                                    onClick={nextQuestion}
                                    className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/30"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={submitQuiz}
                                    disabled={answers.size < totalQuestions}
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm disabled:opacity-50"
                                >
                                    Submit Quiz
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

                {showResults && quiz && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        {/* Score card */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/20 text-center">
                            <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                {score}/{totalQuestions}
                            </div>
                            <p className="text-slate-400">
                                {score === totalQuestions
                                    ? "Perfect score! 🎉"
                                    : score >= totalQuestions * 0.7
                                        ? "Great job! 👏"
                                        : "Keep practicing! 💪"}
                            </p>
                        </div>

                        {/* Answer review */}
                        <div className="space-y-3">
                            {quiz.questions.map((q, i) => {
                                const userAnswer = answers.get(q.id);
                                const isCorrect = userAnswer === q.correctAnswer;

                                return (
                                    <div
                                        key={q.id}
                                        className={`p-4 rounded-xl border ${isCorrect
                                                ? "bg-emerald-500/10 border-emerald-500/30"
                                                : "bg-rose-500/10 border-rose-500/30"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {isCorrect ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-rose-400 mt-0.5" />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm text-white mb-1">Q{i + 1}: {q.question}</p>
                                                <p className="text-xs text-slate-400">{q.explanation}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={resetQuiz}
                                className="flex-1 py-3 rounded-xl bg-slate-800/50 text-slate-300 text-sm hover:bg-slate-800"
                            >
                                <RefreshCw className="w-4 h-4 inline mr-2" />
                                Retry Quiz
                            </button>
                            <button
                                onClick={() => generateQuiz(algorithmName)}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm"
                            >
                                <Sparkles className="w-4 h-4 inline mr-2" />
                                New Quiz
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================
// COMBINED AI TUTOR PANEL
// ============================================

type TutorTab = "chat" | "explain" | "quiz";

export function AITutorPanel({ className = "" }: { className?: string }) {
    const [activeTab, setActiveTab] = useState<TutorTab>("chat");

    const tabs: { id: TutorTab; label: string; icon: React.ElementType }[] = [
        { id: "chat", label: "Chat", icon: MessageCircle },
        { id: "explain", label: "Explain", icon: Lightbulb },
        { id: "quiz", label: "Quiz", icon: GraduationCap },
    ];

    return (
        <div className={`flex flex-col h-full rounded-2xl overflow-hidden ${className}`}
            style={{
                background: "linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(10, 15, 30, 0.98))",
                border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
        >
            {/* Tab bar */}
            <div className="flex border-b border-slate-800/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? "text-white border-b-2 border-purple-500 bg-purple-500/5"
                                : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === "chat" && <AIChat className="h-full" />}
                {activeTab === "explain" && (
                    <div className="p-5 overflow-y-auto h-full">
                        <StepExplanationPanel />
                    </div>
                )}
                {activeTab === "quiz" && (
                    <div className="p-5 overflow-y-auto h-full">
                        <QuizPanel />
                    </div>
                )}
            </div>
        </div>
    );
}
