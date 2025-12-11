"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "gradient";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export function Button({
    className,
    variant = "default",
    size = "md",
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed",
                {
                    // Variants
                    "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800":
                        variant === "default",
                    "border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500":
                        variant === "outline",
                    "text-slate-300 hover:bg-slate-800 hover:text-white":
                        variant === "ghost",
                    "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white hover:opacity-90 active:opacity-80":
                        variant === "gradient",
                    // Sizes
                    "px-3 py-1.5 text-sm": size === "sm",
                    "px-4 py-2 text-sm": size === "md",
                    "px-6 py-3 text-base": size === "lg",
                },
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
