// ============================================
// AI TUTOR TYPE DEFINITIONS
// ============================================

// Algorithm context for AI explanations
export interface AlgorithmContext {
    algorithmName: string;
    arrayState: number[];
    elementStates: string[];  // "default" | "comparing" | "swapping" | "sorted" | "pivot"
    currentStep: number;
    totalSteps: number;
    pointers: {
        i?: number;
        j?: number;
        pivot?: number;
        minIdx?: number;
        key?: number;
    };
    lastAction: {
        type: "compare" | "swap" | "mark_sorted" | "mark_pivot" | "complete";
        indices: number[];
        description: string;
    };
    stats: {
        comparisons: number;
        swaps: number;
    };
}

// AI Response types
export interface StepExplanation {
    explanation: string;
    whatHappened: string;
    whyItMatters: string;
    nextStepHint: string;
    complexity: {
        currentPhase: string;
        progressAnalysis: string;
    };
}

export interface QuizQuestion {
    id: number;
    type: "mcq" | "code_trace" | "true_false";
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
}

export interface QuizData {
    algorithmName: string;
    questions: QuizQuestion[];
    generatedAt: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    context?: AlgorithmContext;
}

export interface ChatResponse {
    message: string;
    references?: {
        step?: number;
        indices?: number[];
        concept?: string;
    };
    followUpQuestions?: string[];
}

// ============================================
// AI PROMPT TEMPLATES
// ============================================

export const AI_PROMPTS = {
    // System prompt for the AI Tutor
    systemPrompt: `You are an expert computer science tutor specializing in data structures and algorithms. 
Your role is to explain sorting algorithms in a clear, engaging way suitable for students learning programming.

Key guidelines:
- Use simple, clear language
- Provide concrete examples
- Relate concepts to real-world analogies when helpful
- Be encouraging and supportive
- Focus on building intuition, not just memorization
- When explaining steps, reference the specific array values and indices
- Use markdown formatting for clarity`,

    // Template for step-by-step explanations
    stepExplanation: (context: AlgorithmContext) => `
You are explaining ${context.algorithmName} to a student.

Current State:
- Array: [${context.arrayState.join(", ")}]
- Element states: [${context.elementStates.join(", ")}]
- Step ${context.currentStep} of ${context.totalSteps}
- Pointers: ${JSON.stringify(context.pointers)}
- Last action: ${context.lastAction.type} at indices [${context.lastAction.indices.join(", ")}]
- Description: "${context.lastAction.description}"
- Stats: ${context.stats.comparisons} comparisons, ${context.stats.swaps} swaps

Provide a JSON response with:
{
    "explanation": "A 2-3 sentence explanation of what just happened",
    "whatHappened": "Technical description of the operation",
    "whyItMatters": "Why this step is important in the algorithm",
    "nextStepHint": "What will likely happen next",
    "complexity": {
        "currentPhase": "Which phase/pass of the algorithm we're in",
        "progressAnalysis": "How much progress has been made"
    }
}`,

    // Template for quiz generation
    quizGeneration: (algorithmName: string) => `
Generate a quiz about ${algorithmName} for a student learning sorting algorithms.

Create exactly:
- 5 Multiple Choice Questions (varying difficulty)
- 2 Code Trace Questions (where student traces through algorithm execution)

Return JSON in this exact format:
{
    "algorithmName": "${algorithmName}",
    "questions": [
        {
            "id": 1,
            "type": "mcq",
            "question": "Question text here",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "correctAnswer": 0,
            "explanation": "Why this answer is correct",
            "difficulty": "easy"
        },
        {
            "id": 6,
            "type": "code_trace",
            "question": "Given array [5, 2, 8, 1], what is the array after the first pass of ${algorithmName}?",
            "options": ["A) [2, 5, 1, 8]", "B) [1, 2, 5, 8]", "C) [2, 1, 5, 8]", "D) [5, 2, 1, 8]"],
            "correctAnswer": 0,
            "explanation": "Step-by-step trace explanation",
            "difficulty": "medium"
        }
    ],
    "generatedAt": "ISO timestamp"
}

Topics to cover:
1. Time complexity
2. Space complexity
3. Best/worst case scenarios
4. Algorithm behavior understanding
5. Step-by-step execution
6. Comparison with other algorithms
7. Real-world applications`,

    // Template for chat responses
    chatResponse: (context: AlgorithmContext, userQuestion: string) => `
You are an AI tutor helping a student understand ${context.algorithmName}.

Current visualization state:
- Array: [${context.arrayState.join(", ")}]
- Currently highlighted: indices [${context.lastAction.indices.join(", ")}]
- Action type: ${context.lastAction.type}
- Progress: ${context.stats.comparisons} comparisons, ${context.stats.swaps} swaps

Student's question: "${userQuestion}"

Provide a helpful response that:
1. Directly answers their question
2. References the current visualization when relevant
3. Provides examples using the current array values
4. Suggests related concepts they might want to explore

Return JSON:
{
    "message": "Your detailed response using markdown formatting",
    "references": {
        "step": null or step number if relevant,
        "indices": [] or relevant array indices,
        "concept": "related concept name if applicable"
    },
    "followUpQuestions": ["Suggested follow-up question 1", "Suggested follow-up question 2"]
}`,
};

// ============================================
// EXAMPLE PROMPTS FOR COMMON QUESTIONS
// ============================================

export const EXAMPLE_CHAT_PROMPTS = [
    "Why is bubble sort O(n²)?",
    "Show me how the swap works",
    "What's the difference between bubble sort and selection sort?",
    "When should I use quick sort?",
    "Explain the pivot selection in quick sort",
    "Why does insertion sort work well for nearly sorted arrays?",
    "What makes merge sort stable?",
    "How does the partitioning work in quick sort?",
];

// ============================================
// ALGORITHM METADATA FOR AI CONTEXT
// ============================================

export const ALGORITHM_METADATA = {
    bubble: {
        name: "Bubble Sort",
        timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
        spaceComplexity: "O(1)",
        stable: true,
        description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
        keyOperations: ["compare adjacent", "swap if out of order", "bubble up largest"],
    },
    selection: {
        name: "Selection Sort",
        timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
        spaceComplexity: "O(1)",
        stable: false,
        description: "Finds the minimum element and places it at the beginning, then repeats for the remaining unsorted portion.",
        keyOperations: ["find minimum", "swap to position", "expand sorted region"],
    },
    insertion: {
        name: "Insertion Sort",
        timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
        spaceComplexity: "O(1)",
        stable: true,
        description: "Builds the sorted array one item at a time by inserting each element into its correct position.",
        keyOperations: ["pick next element", "find insertion point", "shift elements right"],
    },
    quick: {
        name: "Quick Sort",
        timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
        spaceComplexity: "O(log n)",
        stable: false,
        description: "Divides the array using a pivot element, recursively sorting the sub-arrays.",
        keyOperations: ["choose pivot", "partition array", "recurse on sub-arrays"],
    },
    merge: {
        name: "Merge Sort",
        timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
        spaceComplexity: "O(n)",
        stable: true,
        description: "Divides the array in half, recursively sorts both halves, then merges them.",
        keyOperations: ["divide in half", "recursive sort", "merge sorted halves"],
    },
    heap: {
        name: "Heap Sort",
        timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
        spaceComplexity: "O(1)",
        stable: false,
        description: "Builds a max heap, then repeatedly extracts the maximum element.",
        keyOperations: ["build heap", "extract max", "heapify"],
    },
};
