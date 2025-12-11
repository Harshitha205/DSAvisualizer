import { useState, useCallback, useEffect, useRef } from "react";
import {
    AlgorithmContext,
    StepExplanation,
    QuizData,
    ChatMessage,
    ChatResponse,
    ALGORITHM_METADATA,
} from "@/lib/aiTutorTypes";
import { getFallbackExplanation, getFallbackQuiz } from "@/app/api/ai-tutor/route";
import { useAnimationEngine } from "@/stores/animationEngine";
import { useVisualizationStore } from "@/stores/visualizationStore";

// ============================================
// AI TUTOR SERVICE
// ============================================

class AITutorService {
    private baseUrl = "/api/ai-tutor";

    async explainStep(context: AlgorithmContext): Promise<StepExplanation> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "explain_step", context }),
            });

            const data = await response.json();

            if (!data.success) {
                console.warn("Using fallback explanation:", data.error);
                return getFallbackExplanation(context);
            }

            return data.data;
        } catch (error) {
            console.error("AI Tutor error:", error);
            return getFallbackExplanation(context);
        }
    }

    async generateQuiz(algorithmName: string): Promise<QuizData> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "generate_quiz", algorithmName }),
            });

            const data = await response.json();

            if (!data.success) {
                console.warn("Using fallback quiz:", data.error);
                return getFallbackQuiz(algorithmName);
            }

            return data.data;
        } catch (error) {
            console.error("Quiz generation error:", error);
            return getFallbackQuiz(algorithmName);
        }
    }

    async chat(
        context: AlgorithmContext,
        question: string,
        chatHistory: { role: string; content: string }[]
    ): Promise<ChatResponse> {
        try {
            const response = await fetch(this.baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "chat",
                    context,
                    question,
                    chatHistory
                }),
            });

            const data = await response.json();

            if (!data.success) {
                return this.getFallbackChatResponse(question, context);
            }

            return data.data;
        } catch (error) {
            console.error("Chat error:", error);
            return this.getFallbackChatResponse(question, context);
        }
    }

    private getFallbackChatResponse(question: string, context: AlgorithmContext): ChatResponse {
        const meta = ALGORITHM_METADATA[context.algorithmName as keyof typeof ALGORITHM_METADATA];

        // Simple keyword-based fallback responses
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes("complexity") || lowerQuestion.includes("o(n")) {
            return {
                message: `**${meta?.name || "This algorithm"}** has the following complexity:\n\n- **Time:** ${meta?.timeComplexity.average || "varies"}\n- **Space:** ${meta?.spaceComplexity || "O(1)"}\n\nThe time complexity is determined by the nested loops that compare elements.`,
                references: { concept: "complexity" },
                followUpQuestions: [
                    "What causes the worst case scenario?",
                    "How does this compare to other sorting algorithms?",
                ],
            };
        }

        if (lowerQuestion.includes("swap")) {
            return {
                message: `A **swap** operation exchanges the positions of two elements in the array. In ${meta?.name || "this algorithm"}, swaps occur when elements are found to be out of order.\n\nCurrently, we've performed **${context.stats.swaps}** swaps.`,
                references: { indices: context.lastAction.indices },
                followUpQuestions: [
                    "How many swaps does this algorithm typically need?",
                    "Is there a way to reduce the number of swaps?",
                ],
            };
        }

        if (lowerQuestion.includes("compare") || lowerQuestion.includes("comparison")) {
            return {
                message: `**Comparisons** are operations where we check if one element is greater than, less than, or equal to another. ${meta?.name || "This algorithm"} uses comparisons to determine the relative order of elements.\n\nSo far, we've made **${context.stats.comparisons}** comparisons.`,
                references: { concept: "comparison" },
                followUpQuestions: [
                    "Why are comparisons important for complexity analysis?",
                    "Can we reduce the number of comparisons?",
                ],
            };
        }

        // Default response
        return {
            message: `Great question about ${meta?.name || "this sorting algorithm"}! ${meta?.description || "This algorithm works by systematically comparing and reordering elements."}\n\nThe current array state is: [${context.arrayState.join(", ")}]\n\nWe're at step ${context.currentStep} of ${context.totalSteps}.`,
            followUpQuestions: [
                "What happens in the next step?",
                "How efficient is this algorithm?",
            ],
        };
    }
}

export const aiTutorService = new AITutorService();

// ============================================
// HOOK: useAIStepExplanation
// Auto-explains each step as it happens
// ============================================

export function useAIStepExplanation(autoExplain = false) {
    const [explanation, setExplanation] = useState<StepExplanation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { getCurrentStep, currentStepIndex, displayArray, steps } = useAnimationEngine();
    const { currentAlgorithm } = useVisualizationStore();

    const lastExplainedStep = useRef(-1);

    // Build context from current state
    const buildContext = useCallback((): AlgorithmContext | null => {
        const step = getCurrentStep();
        if (!step) return null;

        return {
            algorithmName: currentAlgorithm,
            arrayState: displayArray.map(el => el.value),
            elementStates: displayArray.map(el => el.state),
            currentStep: currentStepIndex + 1,
            totalSteps: steps.length,
            pointers: {},
            lastAction: {
                type: step.type as AlgorithmContext["lastAction"]["type"],
                indices: step.indices,
                description: step.description,
            },
            stats: step.stats,
        };
    }, [getCurrentStep, currentStepIndex, displayArray, steps, currentAlgorithm]);

    // Manual explain function
    const explain = useCallback(async () => {
        const context = buildContext();
        if (!context) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await aiTutorService.explainStep(context);
            setExplanation(result);
            lastExplainedStep.current = currentStepIndex;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get explanation");
        } finally {
            setIsLoading(false);
        }
    }, [buildContext, currentStepIndex]);

    // Auto-explain on step change
    useEffect(() => {
        if (autoExplain && currentStepIndex !== lastExplainedStep.current && currentStepIndex >= 0) {
            explain();
        }
    }, [autoExplain, currentStepIndex, explain]);

    return {
        explanation,
        isLoading,
        error,
        explain,
        context: buildContext(),
    };
}

// ============================================
// HOOK: useAIQuiz
// Generates and manages quizzes
// ============================================

export function useAIQuiz() {
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<number, number>>(new Map());
    const [showResults, setShowResults] = useState(false);

    const generateQuiz = useCallback(async (algorithmName: string) => {
        setIsLoading(true);
        setError(null);
        setAnswers(new Map());
        setCurrentQuestionIndex(0);
        setShowResults(false);

        try {
            const result = await aiTutorService.generateQuiz(algorithmName);
            setQuiz(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate quiz");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const answerQuestion = useCallback((questionId: number, answerIndex: number) => {
        setAnswers(prev => new Map(prev).set(questionId, answerIndex));
    }, []);

    const nextQuestion = useCallback(() => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [quiz, currentQuestionIndex]);

    const previousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    }, [currentQuestionIndex]);

    const submitQuiz = useCallback(() => {
        setShowResults(true);
    }, []);

    const resetQuiz = useCallback(() => {
        setAnswers(new Map());
        setCurrentQuestionIndex(0);
        setShowResults(false);
    }, []);

    // Calculate score
    const score = quiz?.questions.reduce((acc, q) => {
        const userAnswer = answers.get(q.id);
        return acc + (userAnswer === q.correctAnswer ? 1 : 0);
    }, 0) ?? 0;

    const totalQuestions = quiz?.questions.length ?? 0;
    const progress = totalQuestions > 0 ? (answers.size / totalQuestions) * 100 : 0;

    return {
        quiz,
        isLoading,
        error,
        generateQuiz,
        currentQuestion: quiz?.questions[currentQuestionIndex],
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
    };
}

// ============================================
// HOOK: useAIChat
// Manages chat conversation
// ============================================

export function useAIChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { getCurrentStep, currentStepIndex, displayArray, steps } = useAnimationEngine();
    const { currentAlgorithm } = useVisualizationStore();

    // Build context
    const buildContext = useCallback((): AlgorithmContext => {
        const step = getCurrentStep();
        return {
            algorithmName: currentAlgorithm,
            arrayState: displayArray.map(el => el.value),
            elementStates: displayArray.map(el => el.state),
            currentStep: currentStepIndex + 1,
            totalSteps: steps.length,
            pointers: {},
            lastAction: step ? {
                type: step.type as AlgorithmContext["lastAction"]["type"],
                indices: step.indices,
                description: step.description,
            } : {
                type: "compare",
                indices: [],
                description: "Ready to start",
            },
            stats: step?.stats ?? { comparisons: 0, swaps: 0 },
        };
    }, [getCurrentStep, currentStepIndex, displayArray, steps, currentAlgorithm]);

    // Send message
    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date(),
            context: buildContext(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const chatHistory = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await aiTutorService.chat(
                buildContext(),
                content,
                chatHistory
            );

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: response.message,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to get response");
        } finally {
            setIsLoading(false);
        }
    }, [buildContext, messages]);

    // Clear chat
    const clearChat = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    // Add welcome message on mount
    useEffect(() => {
        if (messages.length === 0) {
            const welcomeMessage: ChatMessage = {
                id: "welcome",
                role: "assistant",
                content: `👋 Hi! I'm your AI Tutor for sorting algorithms. I can see you're looking at **${ALGORITHM_METADATA[currentAlgorithm as keyof typeof ALGORITHM_METADATA]?.name || currentAlgorithm}**.\n\nAsk me anything like:\n- "Why is this algorithm O(n²)?"\n- "Explain what's happening in this step"\n- "How does the swap work?"`,
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [currentAlgorithm, messages.length]);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat,
        context: buildContext(),
    };
}
