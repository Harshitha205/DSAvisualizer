import { NextRequest, NextResponse } from "next/server";
import {
    AlgorithmContext,
    StepExplanation,
    QuizData,
    ChatResponse,
    AI_PROMPTS,
    ALGORITHM_METADATA,
} from "@/lib/aiTutorTypes";

// ============================================
// AI TUTOR API ROUTE
// Handles step explanations, quiz generation, and chat
// ============================================

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

async function callOpenAI(messages: { role: string; content: string }[], options?: {
    temperature?: number;
    maxTokens?: number;
}) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        throw new Error("OpenAI API key not configured");
    }

    const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 1000,
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ============================================
// STEP EXPLANATION ENDPOINT
// ============================================

async function handleStepExplanation(context: AlgorithmContext): Promise<StepExplanation> {
    const messages = [
        { role: "system", content: AI_PROMPTS.systemPrompt },
        { role: "user", content: AI_PROMPTS.stepExplanation(context) },
    ];

    const response = await callOpenAI(messages, { temperature: 0.5 });
    return JSON.parse(response);
}

// ============================================
// QUIZ GENERATION ENDPOINT
// ============================================

async function handleQuizGeneration(algorithmName: string): Promise<QuizData> {
    const messages = [
        { role: "system", content: AI_PROMPTS.systemPrompt },
        { role: "user", content: AI_PROMPTS.quizGeneration(algorithmName) },
    ];

    const response = await callOpenAI(messages, {
        temperature: 0.8,
        maxTokens: 2000
    });

    return JSON.parse(response);
}

// ============================================
// CHAT ENDPOINT
// ============================================

async function handleChat(
    context: AlgorithmContext,
    userQuestion: string,
    chatHistory: { role: string; content: string }[]
): Promise<ChatResponse> {
    const messages = [
        { role: "system", content: AI_PROMPTS.systemPrompt },
        ...chatHistory.slice(-10), // Keep last 10 messages for context
        { role: "user", content: AI_PROMPTS.chatResponse(context, userQuestion) },
    ];

    const response = await callOpenAI(messages, { temperature: 0.7 });
    return JSON.parse(response);
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...params } = body;

        switch (action) {
            case "explain_step": {
                const explanation = await handleStepExplanation(params.context);
                return NextResponse.json({ success: true, data: explanation });
            }

            case "generate_quiz": {
                const quiz = await handleQuizGeneration(params.algorithmName);
                return NextResponse.json({ success: true, data: quiz });
            }

            case "chat": {
                const response = await handleChat(
                    params.context,
                    params.question,
                    params.chatHistory || []
                );
                return NextResponse.json({ success: true, data: response });
            }

            default:
                return NextResponse.json(
                    { success: false, error: "Invalid action" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error("AI Tutor API Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}

// ============================================
// FALLBACK RESPONSES (when API key not available)
// ============================================

export function getFallbackExplanation(context: AlgorithmContext): StepExplanation {
    const meta = ALGORITHM_METADATA[context.algorithmName as keyof typeof ALGORITHM_METADATA];

    const explanations: Record<string, string> = {
        compare: `We're comparing elements at positions ${context.lastAction.indices.join(" and ")} to determine their relative order.`,
        swap: `The elements at positions ${context.lastAction.indices.join(" and ")} were out of order, so we swapped them.`,
        mark_sorted: `Element at position ${context.lastAction.indices[0]} is now in its final sorted position!`,
        mark_pivot: `We've selected the element at position ${context.lastAction.indices[0]} as our pivot for partitioning.`,
        complete: `The array is now fully sorted! ${meta?.name || "The algorithm"} has completed.`,
    };

    return {
        explanation: explanations[context.lastAction.type] || context.lastAction.description,
        whatHappened: context.lastAction.description,
        whyItMatters: `This operation is part of how ${meta?.name || "this algorithm"} systematically organizes elements.`,
        nextStepHint: context.lastAction.type === "complete"
            ? "The sorting is complete! Try a different algorithm or array."
            : "Watch for the next comparison or swap operation.",
        complexity: {
            currentPhase: `Step ${context.currentStep} of ${context.totalSteps}`,
            progressAnalysis: `${Math.round((context.currentStep / context.totalSteps) * 100)}% complete`,
        },
    };
}

export function getFallbackQuiz(algorithmName: string): QuizData {
    const meta = ALGORITHM_METADATA[algorithmName as keyof typeof ALGORITHM_METADATA]
        || ALGORITHM_METADATA.bubble;

    return {
        algorithmName: meta.name,
        questions: [
            {
                id: 1,
                type: "mcq",
                question: `What is the average time complexity of ${meta.name}?`,
                options: [
                    "A) O(n)",
                    "B) O(n log n)",
                    "C) O(n²)",
                    "D) O(log n)"
                ],
                correctAnswer: meta.timeComplexity.average.includes("n²") ? 2 : 1,
                explanation: `${meta.name} has an average time complexity of ${meta.timeComplexity.average}.`,
                difficulty: "easy",
            },
            {
                id: 2,
                type: "mcq",
                question: `Is ${meta.name} a stable sorting algorithm?`,
                options: [
                    "A) Yes",
                    "B) No",
                    "C) Depends on implementation",
                    "D) Only for small arrays"
                ],
                correctAnswer: meta.stable ? 0 : 1,
                explanation: `${meta.name} is ${meta.stable ? "stable" : "not stable"} - ${meta.stable ? "equal elements maintain their relative order" : "equal elements may be reordered"}.`,
                difficulty: "easy",
            },
            {
                id: 3,
                type: "mcq",
                question: `What is the space complexity of ${meta.name}?`,
                options: [
                    "A) O(1)",
                    "B) O(n)",
                    "C) O(log n)",
                    "D) O(n²)"
                ],
                correctAnswer: meta.spaceComplexity === "O(1)" ? 0 : (meta.spaceComplexity === "O(n)" ? 1 : 2),
                explanation: `${meta.name} has a space complexity of ${meta.spaceComplexity}.`,
                difficulty: "medium",
            },
            {
                id: 4,
                type: "mcq",
                question: `What is the best case time complexity of ${meta.name}?`,
                options: [
                    "A) O(1)",
                    "B) O(n)",
                    "C) O(n log n)",
                    "D) O(n²)"
                ],
                correctAnswer: meta.timeComplexity.best === "O(n)" ? 1 : (meta.timeComplexity.best.includes("log") ? 2 : 3),
                explanation: `The best case for ${meta.name} is ${meta.timeComplexity.best}.`,
                difficulty: "medium",
            },
            {
                id: 5,
                type: "mcq",
                question: `Which operation is central to ${meta.name}?`,
                options: meta.keyOperations.slice(0, 3).map((op, i) => `${String.fromCharCode(65 + i)}) ${op}`).concat(["D) None of the above"]),
                correctAnswer: 0,
                explanation: `"${meta.keyOperations[0]}" is a key operation in ${meta.name}.`,
                difficulty: "easy",
            },
            {
                id: 6,
                type: "code_trace",
                question: `Given array [4, 2, 7, 1], after the first complete pass of ${meta.name}, which element is guaranteed to be in its final position?`,
                options: [
                    "A) The smallest element (1)",
                    "B) The largest element (7)",
                    "C) The first element (4)",
                    "D) It depends on the pivot chosen"
                ],
                correctAnswer: algorithmName === "bubble" ? 1 : 0,
                explanation: `In ${meta.name}, ${algorithmName === "bubble" ? "the largest element bubbles to the end" : "the smallest element is placed in position"} after the first pass.`,
                difficulty: "medium",
            },
            {
                id: 7,
                type: "code_trace",
                question: `For array [3, 1, 4, 1, 5], how many comparisons does ${meta.name} make in the first pass?`,
                options: [
                    "A) 4",
                    "B) 5",
                    "C) 3",
                    "D) 10"
                ],
                correctAnswer: 0,
                explanation: `In the first pass, ${meta.name} makes n-1 = 4 comparisons for an array of 5 elements.`,
                difficulty: "hard",
            },
        ],
        generatedAt: new Date().toISOString(),
    };
}
