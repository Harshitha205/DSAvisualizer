import { NextRequest, NextResponse } from "next/server";
import {
    CodeExecutionRequest,
    CodeExecutionResult,
    ExecutionTrace,
    TracedOperation,
    LANGUAGE_IDS,
    SupportedLanguage,
} from "@/lib/codeRunnerTypes";

// ============================================
// JUDGE0 API CONFIGURATION
// ============================================

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";

// ============================================
// CODE INSTRUMENTATION
// Wraps user code to capture operations
// ============================================

const INSTRUMENTATION_CODE: Record<SupportedLanguage, string> = {
    javascript: `
// Instrumentation wrapper
const __trace = [];
const __snapshots = [];
let __opId = 0;

function __traceOp(type, indices, values, description) {
    __trace.push({
        id: __opId++,
        type,
        indices,
        values,
        timestamp: Date.now(),
        description
    });
    __snapshots.push([...arr]);
}

function compare(i, j) {
    __traceOp('compare', [i, j], [arr[i], arr[j]], \`Comparing arr[\${i}]=\${arr[i]} with arr[\${j}]=\${arr[j]}\`);
    return arr[i] - arr[j];
}

function swap(i, j) {
    __traceOp('swap', [i, j], [arr[i], arr[j]], \`Swapping arr[\${i}]=\${arr[i]} with arr[\${j}]=\${arr[j]}\`);
    [arr[i], arr[j]] = [arr[j], arr[i]];
}

function markSorted(i) {
    __traceOp('mark_sorted', [i], [arr[i]], \`Element at index \${i} is sorted\`);
}

function markPivot(i) {
    __traceOp('mark_pivot', [i], [arr[i]], \`Pivot selected at index \${i}\`);
}

// User code will be inserted here
// __USER_CODE__

// Output trace as JSON
console.log(JSON.stringify({
    operations: __trace,
    arraySnapshots: __snapshots,
    finalArray: arr,
    stats: {
        comparisons: __trace.filter(o => o.type === 'compare').length,
        swaps: __trace.filter(o => o.type === 'swap').length,
        assignments: 0,
        accesses: 0
    }
}));
`,

    python: `
import json
import time

__trace = []
__snapshots = []
__op_id = 0

def __trace_op(op_type, indices, values, description):
    global __op_id
    __trace.append({
        'id': __op_id,
        'type': op_type,
        'indices': indices,
        'values': values,
        'timestamp': int(time.time() * 1000),
        'description': description
    })
    __op_id += 1
    __snapshots.append(arr.copy())

def compare(i, j):
    __trace_op('compare', [i, j], [arr[i], arr[j]], f'Comparing arr[{i}]={arr[i]} with arr[{j}]={arr[j]}')
    return arr[i] - arr[j]

def swap(i, j):
    __trace_op('swap', [i, j], [arr[i], arr[j]], f'Swapping arr[{i}]={arr[i]} with arr[{j}]={arr[j]}')
    arr[i], arr[j] = arr[j], arr[i]

def mark_sorted(i):
    __trace_op('mark_sorted', [i], [arr[i]], f'Element at index {i} is sorted')

def mark_pivot(i):
    __trace_op('mark_pivot', [i], [arr[i]], f'Pivot selected at index {i}')

# User code will be inserted here
# __USER_CODE__

# Output trace as JSON
print(json.dumps({
    'operations': __trace,
    'arraySnapshots': __snapshots,
    'finalArray': arr,
    'stats': {
        'comparisons': len([o for o in __trace if o['type'] == 'compare']),
        'swaps': len([o for o in __trace if o['type'] == 'swap']),
        'assignments': 0,
        'accesses': 0
    }
}))
`,

    cpp: `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

vector<string> __trace;
int __opId = 0;

void __traceOp(string type, int i, int j, int vi, int vj, string desc) {
    stringstream ss;
    ss << "{\\"id\\":" << __opId++ << ",\\"type\\":\\"" << type 
       << "\\",\\"indices\\":[" << i << "," << j << "],\\"values\\":["
       << vi << "," << vj << "],\\"description\\":\\"" << desc << "\\"}";
    __trace.push_back(ss.str());
}

int arr[1000];
int n;

int compare(int i, int j) {
    __traceOp("compare", i, j, arr[i], arr[j], "Comparing elements");
    return arr[i] - arr[j];
}

void swap_arr(int i, int j) {
    __traceOp("swap", i, j, arr[i], arr[j], "Swapping elements");
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

// __USER_CODE__

int main() {
    // Read input array
    cin >> n;
    for(int i = 0; i < n; i++) cin >> arr[i];
    
    // Run user's sort function
    sort_array();
    
    // Output JSON
    cout << "{\\"operations\\":[";
    for(int i = 0; i < __trace.size(); i++) {
        cout << __trace[i];
        if(i < __trace.size()-1) cout << ",";
    }
    cout << "],\\"finalArray\\":[";
    for(int i = 0; i < n; i++) {
        cout << arr[i];
        if(i < n-1) cout << ",";
    }
    cout << "]}";
    return 0;
}
`,

    java: `
import java.util.*;

public class Main {
    static List<String> __trace = new ArrayList<>();
    static int __opId = 0;
    static int[] arr;
    
    static void __traceOp(String type, int i, int j, int vi, int vj, String desc) {
        __trace.add(String.format(
            "{\\"id\\":%d,\\"type\\":\\"%s\\",\\"indices\\":[%d,%d],\\"values\\":[%d,%d],\\"description\\":\\"%s\\"}",
            __opId++, type, i, j, vi, vj, desc
        ));
    }
    
    static int compare(int i, int j) {
        __traceOp("compare", i, j, arr[i], arr[j], "Comparing elements");
        return arr[i] - arr[j];
    }
    
    static void swap(int i, int j) {
        __traceOp("swap", i, j, arr[i], arr[j], "Swapping elements");
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    
    // __USER_CODE__
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        arr = new int[n];
        for(int i = 0; i < n; i++) arr[i] = sc.nextInt();
        
        sortArray();
        
        System.out.print("{\\"operations\\":[");
        for(int i = 0; i < __trace.size(); i++) {
            System.out.print(__trace.get(i));
            if(i < __trace.size()-1) System.out.print(",");
        }
        System.out.print("],\\"finalArray\\":[");
        for(int i = 0; i < arr.length; i++) {
            System.out.print(arr[i]);
            if(i < arr.length-1) System.out.print(",");
        }
        System.out.print("]}");
    }
}
`,
};

// ============================================
// INSTRUMENT USER CODE
// ============================================

function instrumentCode(code: string, language: SupportedLanguage): string {
    const instrumentation = INSTRUMENTATION_CODE[language];
    return instrumentation.replace("// __USER_CODE__", code);
}

// ============================================
// SECURITY VALIDATION
// ============================================

const FORBIDDEN_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
    javascript: [
        /require\s*\(/,
        /import\s+/,
        /process\./,
        /child_process/,
        /fs\./,
        /eval\s*\(/,
        /Function\s*\(/,
        /\.exec\s*\(/,
        /\.spawn\s*\(/,
    ],
    python: [
        /import\s+os/,
        /import\s+subprocess/,
        /import\s+sys/,
        /from\s+os/,
        /exec\s*\(/,
        /eval\s*\(/,
        /__import__/,
        /open\s*\(/,
    ],
    cpp: [
        /system\s*\(/,
        /popen\s*\(/,
        /exec[lvpe]*\s*\(/,
        /fork\s*\(/,
    ],
    java: [
        /Runtime\./,
        /ProcessBuilder/,
        /exec\s*\(/,
        /System\.exit/,
    ],
};

function validateCode(code: string, language: SupportedLanguage): { valid: boolean; error?: string } {
    const patterns = FORBIDDEN_PATTERNS[language];

    for (const pattern of patterns) {
        if (pattern.test(code)) {
            return {
                valid: false,
                error: `Security violation: forbidden pattern detected (${pattern.source})`
            };
        }
    }

    // Check code length
    if (code.length > 10000) {
        return { valid: false, error: "Code exceeds maximum length (10000 characters)" };
    }

    return { valid: true };
}

// ============================================
// JUDGE0 API CALLS
// ============================================

async function submitToJudge0(
    code: string,
    languageId: number,
    input?: string,
    timeout: number = 10
): Promise<string> {
    const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-RapidAPI-Key": JUDGE0_API_KEY,
            "X-RapidAPI-Host": JUDGE0_API_HOST,
        },
        body: JSON.stringify({
            source_code: Buffer.from(code).toString("base64"),
            language_id: languageId,
            stdin: input ? Buffer.from(input).toString("base64") : "",
            cpu_time_limit: timeout,
            memory_limit: 128000,
        }),
    });

    if (!response.ok) {
        throw new Error(`Judge0 API error: ${response.statusText}`);
    }

    return response.json();
}

// ============================================
// FALLBACK LOCAL EXECUTOR (JavaScript only)
// ============================================

function executeLocalJavaScript(code: string): { output: string; error?: string } {
    try {
        // Create a sandboxed context
        const sandbox = {
            console: {
                log: (...args: unknown[]) => {
                    sandbox.__output.push(args.map(String).join(" "));
                },
            },
            __output: [] as string[],
            arr: [] as number[],
        };

        // Execute in sandbox using Function constructor (limited sandbox)
        const wrappedCode = `
            with (sandbox) {
                ${code}
            }
            return sandbox.__output.join("\\n");
        `;

        const executor = new Function("sandbox", wrappedCode);
        const output = executor(sandbox);

        return { output };
    } catch (error) {
        return {
            output: "",
            error: error instanceof Error ? error.message : "Execution error"
        };
    }
}

// ============================================
// PARSE EXECUTION OUTPUT
// ============================================

function parseExecutionOutput(output: string): ExecutionTrace | null {
    try {
        // Find JSON in output (might have other console.logs)
        const jsonMatch = output.match(/\{[\s\S]*"operations"[\s\S]*\}/);
        if (!jsonMatch) return null;

        const trace = JSON.parse(jsonMatch[0]);
        return trace as ExecutionTrace;
    } catch {
        return null;
    }
}

// ============================================
// MAIN API HANDLER
// ============================================

export async function POST(request: NextRequest) {
    try {
        const body: CodeExecutionRequest & { action?: string } = await request.json();
        const { action = "execute", code, language, input, timeout = 10 } = body;

        // Validate language
        if (!LANGUAGE_IDS[language]) {
            return NextResponse.json(
                { success: false, error: `Unsupported language: ${language}` },
                { status: 400 }
            );
        }

        // Security validation
        const validation = validateCode(code, language);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // Instrument code for tracing
        const instrumentedCode = instrumentCode(code, language);

        let result: CodeExecutionResult;
        let trace: ExecutionTrace | null = null;

        // Try Judge0 first, fallback to local for JavaScript
        if (JUDGE0_API_KEY) {
            try {
                const judge0Result = await submitToJudge0(
                    instrumentedCode,
                    LANGUAGE_IDS[language],
                    input,
                    timeout
                );

                const j0 = judge0Result as {
                    stdout?: string;
                    stderr?: string;
                    status?: { id: number; description: string };
                    time?: string;
                    memory?: number;
                    compile_output?: string;
                };

                result = {
                    success: j0.status?.id === 3, // Accepted
                    output: j0.stdout ? Buffer.from(j0.stdout, "base64").toString() : "",
                    stderr: j0.stderr ? Buffer.from(j0.stderr, "base64").toString() : "",
                    executionTime: parseFloat(j0.time || "0") * 1000,
                    memoryUsage: j0.memory || 0,
                    status: j0.status || { id: 0, description: "Unknown" },
                    compileOutput: j0.compile_output
                        ? Buffer.from(j0.compile_output, "base64").toString()
                        : undefined,
                };

                trace = parseExecutionOutput(result.output);
            } catch (error) {
                console.error("Judge0 error, falling back:", error);
                // Fallback to local execution for JavaScript
                if (language === "javascript") {
                    const localResult = executeLocalJavaScript(instrumentedCode);
                    result = {
                        success: !localResult.error,
                        output: localResult.output,
                        stderr: localResult.error || "",
                        executionTime: 0,
                        memoryUsage: 0,
                        status: { id: localResult.error ? 4 : 3, description: localResult.error ? "Error" : "Accepted" },
                    };
                    trace = parseExecutionOutput(result.output);
                } else {
                    throw error;
                }
            }
        } else {
            // No Judge0 key, use local execution for JavaScript
            if (language === "javascript") {
                const localResult = executeLocalJavaScript(instrumentedCode);
                result = {
                    success: !localResult.error,
                    output: localResult.output,
                    stderr: localResult.error || "",
                    executionTime: 0,
                    memoryUsage: 0,
                    status: { id: localResult.error ? 4 : 3, description: localResult.error ? "Error" : "Accepted" },
                };
                trace = parseExecutionOutput(result.output);
            } else {
                return NextResponse.json(
                    { success: false, error: "Judge0 API key required for non-JavaScript languages" },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json({
            success: true,
            result,
            trace,
        });

    } catch (error) {
        console.error("Code runner error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Execution failed"
            },
            { status: 500 }
        );
    }
}

// ============================================
// GET AVAILABLE LANGUAGES
// ============================================

export async function GET() {
    return NextResponse.json({
        languages: Object.keys(LANGUAGE_IDS),
        features: {
            tracing: true,
            security: true,
            timeout: 10,
            maxCodeLength: 10000,
        },
    });
}
