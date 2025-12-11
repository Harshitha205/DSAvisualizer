import { useState, useCallback } from "react";
import {
    CodeExecutionRequest,
    CodeExecutionResult,
    ExecutionTrace,
    SupportedLanguage,
} from "@/lib/codeRunnerTypes";
import {
    generateStepsFromTrace,
    validateTrace,
    TraceParser,
} from "@/lib/traceParser";
import { AnimationStep } from "@/lib/animationTypes";
import { useAnimationEngine } from "@/stores/animationEngine";

// ============================================
// CODE RUNNER SERVICE
// ============================================

class CodeRunnerService {
    private baseUrl = "/api/code-runner";

    async execute(request: CodeExecutionRequest): Promise<{
        result: CodeExecutionResult;
        trace: ExecutionTrace | null;
    }> {
        const response = await fetch(this.baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || "Execution failed");
        }

        return {
            result: data.result,
            trace: data.trace,
        };
    }

    async getLanguages(): Promise<string[]> {
        const response = await fetch(this.baseUrl);
        const data = await response.json();
        return data.languages;
    }
}

export const codeRunnerService = new CodeRunnerService();

// ============================================
// HOOK: useCodeRunner
// Main hook for code execution
// ============================================

interface UseCodeRunnerOptions {
    autoConvertToSteps?: boolean;
    algorithm?: string;
}

export function useCodeRunner(options: UseCodeRunnerOptions = {}) {
    const { autoConvertToSteps = true, algorithm = "bubble" } = options;

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState<SupportedLanguage>("javascript");
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<CodeExecutionResult | null>(null);
    const [trace, setTrace] = useState<ExecutionTrace | null>(null);
    const [steps, setSteps] = useState<AnimationStep[]>([]);
    const [error, setError] = useState<string | null>(null);

    const animationEngine = useAnimationEngine();

    // Execute code
    const execute = useCallback(async (input?: string) => {
        if (!code.trim()) {
            setError("No code provided");
            return;
        }

        setIsExecuting(true);
        setError(null);
        setResult(null);
        setTrace(null);
        setSteps([]);

        try {
            const { result, trace } = await codeRunnerService.execute({
                code,
                language,
                input,
            });

            setResult(result);

            if (trace && validateTrace(trace)) {
                setTrace(trace);

                if (autoConvertToSteps) {
                    const generatedSteps = generateStepsFromTrace(trace, algorithm);
                    setSteps(generatedSteps);

                    // Load steps into animation engine
                    animationEngine.clearSteps();
                    // Manually set steps since we generated them from trace
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Execution failed");
        } finally {
            setIsExecuting(false);
        }
    }, [code, language, algorithm, autoConvertToSteps, animationEngine]);

    // Reset state
    const reset = useCallback(() => {
        setCode("");
        setResult(null);
        setTrace(null);
        setSteps([]);
        setError(null);
    }, []);

    // Get trace parser for advanced usage
    const getTraceParser = useCallback(() => {
        if (!trace) return null;
        return new TraceParser(trace, algorithm);
    }, [trace, algorithm]);

    return {
        // State
        code,
        language,
        isExecuting,
        result,
        trace,
        steps,
        error,

        // Setters
        setCode,
        setLanguage,

        // Actions
        execute,
        reset,
        getTraceParser,

        // Derived
        hasResult: !!result,
        hasTrace: !!trace,
        stepCount: steps.length,
    };
}

// ============================================
// HOOK: useCodeTemplates
// Pre-defined code templates for algorithms
// ============================================

interface CodeTemplate {
    name: string;
    language: SupportedLanguage;
    code: string;
    input: string;
}

export function useCodeTemplates() {
    const templates: Record<string, CodeTemplate> = {
        bubbleSort: {
            name: "Bubble Sort",
            language: "javascript",
            code: `// Bubble Sort Implementation
// Use compare(i, j) and swap(i, j) for visualization

let arr = [64, 34, 25, 12, 22, 11, 90];

for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
        if (compare(j, j + 1) > 0) {
            swap(j, j + 1);
        }
    }
    markSorted(arr.length - 1 - i);
}
markSorted(0);
`,
            input: "",
        },
        selectionSort: {
            name: "Selection Sort",
            language: "javascript",
            code: `// Selection Sort Implementation
let arr = [64, 25, 12, 22, 11];

for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    markPivot(i);
    
    for (let j = i + 1; j < arr.length; j++) {
        if (compare(j, minIdx) < 0) {
            minIdx = j;
            markPivot(minIdx);
        }
    }
    
    if (minIdx !== i) {
        swap(i, minIdx);
    }
    markSorted(i);
}
markSorted(arr.length - 1);
`,
            input: "",
        },
        insertionSort: {
            name: "Insertion Sort",
            language: "javascript",
            code: `// Insertion Sort Implementation
let arr = [12, 11, 13, 5, 6];

markSorted(0);

for (let i = 1; i < arr.length; i++) {
    markPivot(i);
    let j = i;
    
    while (j > 0 && compare(j - 1, j) > 0) {
        swap(j - 1, j);
        j--;
    }
    markSorted(j);
}
`,
            input: "",
        },
        quickSort: {
            name: "Quick Sort",
            language: "javascript",
            code: `// Quick Sort Implementation
let arr = [10, 7, 8, 9, 1, 5];

function partition(low, high) {
    markPivot(high);
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (compare(j, high) <= 0) {
            i++;
            if (i !== j) {
                swap(i, j);
            }
        }
    }
    
    swap(i + 1, high);
    markSorted(i + 1);
    return i + 1;
}

function quickSort(low, high) {
    if (low < high) {
        const pi = partition(low, high);
        quickSort(low, pi - 1);
        quickSort(pi + 1, high);
    }
}

quickSort(0, arr.length - 1);
`,
            input: "",
        },
        bubbleSortPython: {
            name: "Bubble Sort (Python)",
            language: "python",
            code: `# Bubble Sort Implementation in Python
# Use compare(i, j) and swap(i, j) for visualization

arr = [64, 34, 25, 12, 22, 11, 90]

for i in range(len(arr) - 1):
    for j in range(len(arr) - i - 1):
        if compare(j, j + 1) > 0:
            swap(j, j + 1)
    mark_sorted(len(arr) - 1 - i)

mark_sorted(0)
`,
            input: "",
        },
    };

    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const getTemplate = useCallback((name: string) => templates[name], [templates]);

    const listTemplates = useCallback(() => Object.entries(templates).map(([key, value]) => ({
        id: key,
        name: value.name,
        language: value.language,
    })), [templates]);

    return {
        templates,
        selectedTemplate,
        setSelectedTemplate,
        getTemplate,
        listTemplates,
    };
}

// ============================================
// HOOK: useTraceVisualization
// Visualize trace with pseudocode sync
// ============================================

export function useTraceVisualization(trace: ExecutionTrace | null, algorithm: string = "bubble") {
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);

    const parser = trace ? new TraceParser(trace, algorithm) : null;
    const stepsWithPseudocode = parser?.toAnimationStepsWithPseudocode() || [];
    const stats = parser?.getStats() || null;

    const currentStep = currentStepIndex >= 0 && currentStepIndex < stepsWithPseudocode.length
        ? stepsWithPseudocode[currentStepIndex]
        : null;

    const pseudocodeWithHighlight = parser?.getPseudocodeWithHighlight(
        currentStep?.pseudocodeLine
    ) || [];

    const nextStep = useCallback(() => {
        if (currentStepIndex < stepsWithPseudocode.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        }
    }, [currentStepIndex, stepsWithPseudocode.length]);

    const previousStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    const goToStep = useCallback((index: number) => {
        if (index >= 0 && index < stepsWithPseudocode.length) {
            setCurrentStepIndex(index);
        }
    }, [stepsWithPseudocode.length]);

    const reset = useCallback(() => {
        setCurrentStepIndex(-1);
    }, []);

    return {
        // State
        currentStepIndex,
        currentStep,
        totalSteps: stepsWithPseudocode.length,
        stepsWithPseudocode,
        pseudocodeWithHighlight,
        stats,

        // Navigation
        nextStep,
        previousStep,
        goToStep,
        reset,

        // Derived
        isAtStart: currentStepIndex <= 0,
        isAtEnd: currentStepIndex >= stepsWithPseudocode.length - 1,
        hasTrace: !!trace,
    };
}
