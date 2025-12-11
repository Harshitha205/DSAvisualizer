// ============================================
// CODE RUNNER TYPE DEFINITIONS
// ============================================

// Supported programming languages
export type SupportedLanguage = "javascript" | "python" | "cpp" | "java";

// Judge0 language IDs
export const LANGUAGE_IDS: Record<SupportedLanguage, number> = {
    javascript: 63,  // Node.js
    python: 71,      // Python 3
    cpp: 54,         // C++ (GCC)
    java: 62,        // Java
};

// Code execution request
export interface CodeExecutionRequest {
    code: string;
    language: SupportedLanguage;
    input?: string;
    timeout?: number;  // in seconds, default 10
    memoryLimit?: number;  // in KB, default 128000
}

// Execution result from Judge0
export interface CodeExecutionResult {
    success: boolean;
    output: string;
    stderr: string;
    executionTime: number;  // in ms
    memoryUsage: number;    // in KB
    status: {
        id: number;
        description: string;
    };
    compileOutput?: string;
}

// Traced operation from instrumented code
export interface TracedOperation {
    id: number;
    type: "compare" | "swap" | "assign" | "access" | "mark_sorted" | "mark_pivot";
    indices: number[];
    values?: number[];
    timestamp: number;
    description: string;
    line?: number;  // Line number in pseudocode
}

// Complete execution trace
export interface ExecutionTrace {
    operations: TracedOperation[];
    arraySnapshots: number[][];
    finalArray: number[];
    stats: {
        comparisons: number;
        swaps: number;
        assignments: number;
        accesses: number;
    };
    executionTime: number;
}

// Animation step generated from trace
export interface AnimationStepFromTrace {
    id: number;
    operation: TracedOperation;
    arraySnapshot: {
        value: number;
        state: "default" | "comparing" | "swapping" | "sorted" | "pivot";
    }[];
    pseudocodeLine?: number;
    description: string;
}

// Pseudocode mapping
export interface PseudocodeMapping {
    algorithm: string;
    lines: {
        lineNumber: number;
        code: string;
        operationType?: TracedOperation["type"];
    }[];
}

// Code template for instrumentation
export interface CodeTemplate {
    language: SupportedLanguage;
    template: string;
    instrumentation: string;
}
