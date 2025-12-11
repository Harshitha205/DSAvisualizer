import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Delay helper for animations
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate random array for sorting visualization
export function generateRandomArray(size: number, min: number = 5, max: number = 100): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

// Color helpers for visualization
export const colors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  comparing: "#f59e0b",
  swapping: "#ef4444",
  sorted: "#10b981",
  default: "#6366f1",
};

// Animation speed presets
export const speedPresets = {
  slow: 1000,
  normal: 500,
  fast: 200,
  veryFast: 50,
};
