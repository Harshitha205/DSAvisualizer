"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    showValue?: boolean;
    className?: string;
}

export function Slider({
    value,
    min,
    max,
    step = 1,
    onChange,
    label,
    showValue = true,
    className,
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {(label || showValue) && (
                <div className="flex items-center justify-between text-sm">
                    {label && <span className="text-slate-400">{label}</span>}
                    {showValue && (
                        <span className="text-indigo-400 font-medium">{value}</span>
                    )}
                </div>
            )}
            <div className="relative w-full h-2">
                <div className="absolute inset-0 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-indigo-500 pointer-events-none transition-all"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                />
            </div>
        </div>
    );
}
