"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "glass";
}

export function Card({ children, className, variant = "default" }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border",
                {
                    "bg-slate-900 border-slate-800": variant === "default",
                    "bg-slate-900/50 backdrop-blur-xl border-slate-700/50": variant === "glass",
                },
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 py-4 border-b border-slate-800", className)}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h3 className={cn("text-lg font-semibold text-white", className)}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-6 py-4", className)}>
            {children}
        </div>
    );
}
