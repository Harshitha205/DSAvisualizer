"use client";

import React from "react";
import { useVisualizationStore, AlgorithmType } from "@/stores/visualizationStore";
import { Button } from "./ui/Button";
import { Slider } from "./ui/Slider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import {
    Play,
    Pause,
    RotateCcw,
    Shuffle,
    Layers,
    Zap,
    BarChart3,
    Activity,
} from "lucide-react";

const algorithms: { id: AlgorithmType; name: string; complexity: string }[] = [
    { id: "bubble", name: "Bubble Sort", complexity: "O(n²)" },
    { id: "selection", name: "Selection Sort", complexity: "O(n²)" },
    { id: "insertion", name: "Insertion Sort", complexity: "O(n²)" },
    { id: "merge", name: "Merge Sort", complexity: "O(n log n)" },
    { id: "quick", name: "Quick Sort", complexity: "O(n log n)" },
    { id: "heap", name: "Heap Sort", complexity: "O(n log n)" },
];

export function ControlPanel() {
    const {
        arraySize,
        speed,
        currentAlgorithm,
        isRunning,
        isPaused,
        isSorted,
        comparisons,
        swaps,
        mode,
        setArraySize,
        setSpeed,
        setAlgorithm,
        setIsRunning,
        setIsPaused,
        setMode,
        generateNewArray,
        resetArray,
    } = useVisualizationStore();

    const handlePlayPause = () => {
        if (isRunning) {
            setIsPaused(!isPaused);
        } else {
            setIsRunning(true);
        }
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsPaused(false);
        resetArray();
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Algorithm Selection */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-indigo-400" />
                        Algorithm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        {algorithms.map((algo) => (
                            <button
                                key={algo.id}
                                onClick={() => setAlgorithm(algo.id)}
                                disabled={isRunning}
                                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${currentAlgorithm === algo.id
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                            >
                                <div>{algo.name}</div>
                                <div className="text-xs opacity-70">{algo.complexity}</div>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Controls */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Button
                            variant="gradient"
                            size="lg"
                            onClick={handlePlayPause}
                            disabled={isSorted}
                            className="flex-1"
                        >
                            {isRunning && !isPaused ? (
                                <>
                                    <Pause className="w-5 h-5" />
                                    Pause
                                </>
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    {isPaused ? "Resume" : "Start"}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handleReset}
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={generateNewArray}
                            disabled={isRunning}
                        >
                            <Shuffle className="w-5 h-5" />
                        </Button>
                    </div>

                    <Slider
                        label="Array Size"
                        value={arraySize}
                        min={5}
                        max={50}
                        onChange={setArraySize}
                    />

                    <Slider
                        label="Speed (ms)"
                        value={speed}
                        min={10}
                        max={1000}
                        step={10}
                        onChange={setSpeed}
                    />

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode("3d")}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${mode === "3d"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                        >
                            3D View
                        </button>
                        <button
                            onClick={() => setMode("2d")}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${mode === "2d"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                        >
                            2D View
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-amber-400">{comparisons}</div>
                            <div className="text-xs text-slate-400 mt-1">Comparisons</div>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-rose-400">{swaps}</div>
                            <div className="text-xs text-slate-400 mt-1">Swaps</div>
                        </div>
                    </div>
                    {isSorted && (
                        <div className="mt-4 text-center py-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                            <span className="text-emerald-400 font-medium">✓ Array Sorted!</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Legend */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        Legend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-indigo-500" />
                            <span className="text-slate-400">Default</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-amber-500" />
                            <span className="text-slate-400">Comparing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-rose-500" />
                            <span className="text-slate-400">Swapping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-emerald-500" />
                            <span className="text-slate-400">Sorted</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
