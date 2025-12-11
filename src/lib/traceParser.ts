import {
    ExecutionTrace,
    TracedOperation,
    AnimationStepFromTrace,
    PseudocodeMapping,
} from "@/lib/codeRunnerTypes";
import { AnimationStep, ArrayElement } from "@/lib/animationTypes";

// ============================================
// PSEUDOCODE MAPPINGS
// Maps operation types to pseudocode line numbers
// ============================================

export const PSEUDOCODE_MAPPINGS: Record<string, PseudocodeMapping> = {
    bubble: {
        algorithm: "bubble",
        lines: [
            { lineNumber: 1, code: "procedure bubbleSort(A: list)" },
            { lineNumber: 2, code: "  n ← length(A)" },
            { lineNumber: 3, code: "  for i ← 0 to n-1 do" },
            { lineNumber: 4, code: "    for j ← 0 to n-i-1 do" },
            { lineNumber: 5, code: "      if A[j] > A[j+1] then", operationType: "compare" },
            { lineNumber: 6, code: "        swap A[j] and A[j+1]", operationType: "swap" },
            { lineNumber: 7, code: "      end if" },
            { lineNumber: 8, code: "    end for" },
            { lineNumber: 9, code: "  end for", operationType: "mark_sorted" },
            { lineNumber: 10, code: "end procedure" },
        ],
    },
    selection: {
        algorithm: "selection",
        lines: [
            { lineNumber: 1, code: "procedure selectionSort(A: list)" },
            { lineNumber: 2, code: "  n ← length(A)" },
            { lineNumber: 3, code: "  for i ← 0 to n-1 do" },
            { lineNumber: 4, code: "    minIdx ← i" },
            { lineNumber: 5, code: "    for j ← i+1 to n do" },
            { lineNumber: 6, code: "      if A[j] < A[minIdx] then", operationType: "compare" },
            { lineNumber: 7, code: "        minIdx ← j", operationType: "mark_pivot" },
            { lineNumber: 8, code: "      end if" },
            { lineNumber: 9, code: "    end for" },
            { lineNumber: 10, code: "    swap A[i] and A[minIdx]", operationType: "swap" },
            { lineNumber: 11, code: "  end for", operationType: "mark_sorted" },
            { lineNumber: 12, code: "end procedure" },
        ],
    },
    insertion: {
        algorithm: "insertion",
        lines: [
            { lineNumber: 1, code: "procedure insertionSort(A: list)" },
            { lineNumber: 2, code: "  for i ← 1 to length(A) do" },
            { lineNumber: 3, code: "    key ← A[i]", operationType: "mark_pivot" },
            { lineNumber: 4, code: "    j ← i - 1" },
            { lineNumber: 5, code: "    while j >= 0 and A[j] > key do", operationType: "compare" },
            { lineNumber: 6, code: "      A[j+1] ← A[j]", operationType: "swap" },
            { lineNumber: 7, code: "      j ← j - 1" },
            { lineNumber: 8, code: "    end while" },
            { lineNumber: 9, code: "    A[j+1] ← key", operationType: "mark_sorted" },
            { lineNumber: 10, code: "  end for" },
            { lineNumber: 11, code: "end procedure" },
        ],
    },
    quick: {
        algorithm: "quick",
        lines: [
            { lineNumber: 1, code: "procedure quickSort(A, low, high)" },
            { lineNumber: 2, code: "  if low < high then" },
            { lineNumber: 3, code: "    pivot ← partition(A, low, high)" },
            { lineNumber: 4, code: "    quickSort(A, low, pivot - 1)" },
            { lineNumber: 5, code: "    quickSort(A, pivot + 1, high)" },
            { lineNumber: 6, code: "  end if" },
            { lineNumber: 7, code: "end procedure" },
            { lineNumber: 8, code: "" },
            { lineNumber: 9, code: "procedure partition(A, low, high)" },
            { lineNumber: 10, code: "  pivot ← A[high]", operationType: "mark_pivot" },
            { lineNumber: 11, code: "  i ← low - 1" },
            { lineNumber: 12, code: "  for j ← low to high-1 do" },
            { lineNumber: 13, code: "    if A[j] <= pivot then", operationType: "compare" },
            { lineNumber: 14, code: "      i ← i + 1" },
            { lineNumber: 15, code: "      swap A[i] and A[j]", operationType: "swap" },
            { lineNumber: 16, code: "    end if" },
            { lineNumber: 17, code: "  end for" },
            { lineNumber: 18, code: "  swap A[i+1] and A[high]", operationType: "swap" },
            { lineNumber: 19, code: "  return i + 1", operationType: "mark_sorted" },
            { lineNumber: 20, code: "end procedure" },
        ],
    },
};

// ============================================
// TRACE PARSER CLASS
// Converts execution traces to visualization steps
// ============================================

export class TraceParser {
    private trace: ExecutionTrace;
    private algorithm: string;
    private pseudocodeMapping: PseudocodeMapping;

    constructor(trace: ExecutionTrace, algorithm: string = "bubble") {
        this.trace = trace;
        this.algorithm = algorithm;
        this.pseudocodeMapping = PSEUDOCODE_MAPPINGS[algorithm] || PSEUDOCODE_MAPPINGS.bubble;
    }

    // Get pseudocode line number for operation type
    private getPseudocodeLine(operationType: TracedOperation["type"]): number | undefined {
        const line = this.pseudocodeMapping.lines.find(l => l.operationType === operationType);
        return line?.lineNumber;
    }

    // Build element states based on operation
    private buildElementStates(
        arraySnapshot: number[],
        operation: TracedOperation,
        sortedIndices: Set<number>
    ): ArrayElement[] {
        return arraySnapshot.map((value, index) => {
            let state: ArrayElement["state"] = "default";

            if (sortedIndices.has(index)) {
                state = "sorted";
            } else if (operation.indices.includes(index)) {
                switch (operation.type) {
                    case "compare":
                        state = "comparing";
                        break;
                    case "swap":
                        state = "swapping";
                        break;
                    case "mark_sorted":
                        state = "sorted";
                        break;
                    case "mark_pivot":
                        state = "pivot";
                        break;
                }
            }

            return { value, state };
        });
    }

    // Convert trace to animation steps
    public toAnimationSteps(): AnimationStep[] {
        const steps: AnimationStep[] = [];
        const sortedIndices = new Set<number>();
        let comparisons = 0;
        let swaps = 0;

        // Initial state
        if (this.trace.arraySnapshots.length > 0) {
            const initialArray = this.trace.arraySnapshots[0];
            steps.push({
                id: 0,
                type: "compare",
                indices: [],
                description: "Initial array state",
                arraySnapshot: initialArray.map(v => ({ value: v, state: "default" as const })),
                highlightIndices: [],
                stats: { comparisons: 0, swaps: 0 },
            });
        }

        // Convert each operation to a step
        this.trace.operations.forEach((operation, index) => {
            // Update counters
            if (operation.type === "compare") comparisons++;
            if (operation.type === "swap") swaps++;
            if (operation.type === "mark_sorted") {
                operation.indices.forEach(i => sortedIndices.add(i));
            }

            // Get array snapshot for this step
            const arraySnapshot = this.trace.arraySnapshots[index] || this.trace.finalArray;
            const elementStates = this.buildElementStates(arraySnapshot, operation, sortedIndices);

            steps.push({
                id: index + 1,
                type: operation.type as AnimationStep["type"],
                indices: operation.indices,
                description: operation.description,
                arraySnapshot: elementStates,
                highlightIndices: operation.indices,
                stats: { comparisons, swaps },
            });
        });

        // Final complete step
        steps.push({
            id: steps.length,
            type: "complete",
            indices: [],
            description: "Sorting complete!",
            arraySnapshot: this.trace.finalArray.map(v => ({ value: v, state: "sorted" as const })),
            highlightIndices: [],
            stats: { comparisons, swaps },
        });

        return steps;
    }

    // Convert to animation steps with pseudocode highlighting
    public toAnimationStepsWithPseudocode(): AnimationStepFromTrace[] {
        const steps: AnimationStepFromTrace[] = [];
        const sortedIndices = new Set<number>();

        this.trace.operations.forEach((operation, index) => {
            if (operation.type === "mark_sorted") {
                operation.indices.forEach(i => sortedIndices.add(i));
            }

            const arraySnapshot = this.trace.arraySnapshots[index] || this.trace.finalArray;
            const elementStates = this.buildElementStates(arraySnapshot, operation, sortedIndices);

            steps.push({
                id: index,
                operation,
                arraySnapshot: elementStates,
                pseudocodeLine: this.getPseudocodeLine(operation.type),
                description: operation.description,
            });
        });

        return steps;
    }

    // Get statistics summary
    public getStats() {
        return {
            ...this.trace.stats,
            totalOperations: this.trace.operations.length,
            executionTime: this.trace.executionTime,
        };
    }

    // Get pseudocode with current line
    public getPseudocodeWithHighlight(currentLine?: number) {
        return this.pseudocodeMapping.lines.map(line => ({
            ...line,
            isHighlighted: line.lineNumber === currentLine,
        }));
    }
}

// ============================================
// STEP GENERATOR FUNCTIONS
// ============================================

/**
 * Convert raw execution trace to visualization steps
 */
export function generateStepsFromTrace(
    trace: ExecutionTrace,
    algorithm: string = "bubble"
): AnimationStep[] {
    const parser = new TraceParser(trace, algorithm);
    return parser.toAnimationSteps();
}

/**
 * Convert trace to steps with pseudocode mapping
 */
export function generateStepsWithPseudocode(
    trace: ExecutionTrace,
    algorithm: string = "bubble"
): AnimationStepFromTrace[] {
    const parser = new TraceParser(trace, algorithm);
    return parser.toAnimationStepsWithPseudocode();
}

/**
 * Validate trace structure
 */
export function validateTrace(trace: unknown): trace is ExecutionTrace {
    if (!trace || typeof trace !== "object") return false;

    const t = trace as ExecutionTrace;

    return (
        Array.isArray(t.operations) &&
        Array.isArray(t.finalArray) &&
        typeof t.stats === "object" &&
        typeof t.stats.comparisons === "number" &&
        typeof t.stats.swaps === "number"
    );
}

/**
 * Merge multiple traces (for recursive algorithms)
 */
export function mergeTraces(traces: ExecutionTrace[]): ExecutionTrace {
    const merged: ExecutionTrace = {
        operations: [],
        arraySnapshots: [],
        finalArray: traces[traces.length - 1]?.finalArray || [],
        stats: {
            comparisons: 0,
            swaps: 0,
            assignments: 0,
            accesses: 0,
        },
        executionTime: 0,
    };

    let opId = 0;
    traces.forEach(trace => {
        trace.operations.forEach(op => {
            merged.operations.push({ ...op, id: opId++ });
        });
        merged.arraySnapshots.push(...trace.arraySnapshots);
        merged.stats.comparisons += trace.stats.comparisons;
        merged.stats.swaps += trace.stats.swaps;
        merged.stats.assignments += trace.stats.assignments;
        merged.stats.accesses += trace.stats.accesses;
        merged.executionTime += trace.executionTime;
    });

    return merged;
}

/**
 * Create initial trace from array
 */
export function createInitialTrace(array: number[]): ExecutionTrace {
    return {
        operations: [],
        arraySnapshots: [array],
        finalArray: [...array],
        stats: {
            comparisons: 0,
            swaps: 0,
            assignments: 0,
            accesses: 0,
        },
        executionTime: 0,
    };
}

/**
 * Add operation to trace
 */
export function addOperationToTrace(
    trace: ExecutionTrace,
    type: TracedOperation["type"],
    indices: number[],
    description: string,
    currentArray: number[]
): ExecutionTrace {
    const newOp: TracedOperation = {
        id: trace.operations.length,
        type,
        indices,
        values: indices.map(i => currentArray[i]),
        timestamp: Date.now(),
        description,
    };

    return {
        ...trace,
        operations: [...trace.operations, newOp],
        arraySnapshots: [...trace.arraySnapshots, [...currentArray]],
        stats: {
            ...trace.stats,
            comparisons: trace.stats.comparisons + (type === "compare" ? 1 : 0),
            swaps: trace.stats.swaps + (type === "swap" ? 1 : 0),
        },
    };
}
