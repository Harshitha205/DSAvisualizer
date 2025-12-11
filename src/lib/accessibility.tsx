"use client";

import React, {
    useEffect,
    useCallback,
    createContext,
    useContext,
    useState,
    useRef,
} from "react";
import { useAnimationEngine } from "@/stores/animationEngine";
import { useVisualizationStore } from "@/stores/visualizationStore";

// ============================================
// KEYBOARD SHORTCUT TYPES
// ============================================

interface KeyboardShortcut {
    key: string;
    modifiers?: ("ctrl" | "shift" | "alt" | "meta")[];
    action: () => void;
    description: string;
    category: "playback" | "navigation" | "view" | "general";
}

interface KeyboardShortcutConfig {
    enabled: boolean;
    shortcuts: KeyboardShortcut[];
}

// ============================================
// DEFAULT SHORTCUTS
// ============================================

const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, "action">[] = [
    // Playback
    { key: " ", description: "Play / Pause", category: "playback" },
    { key: "ArrowRight", description: "Step Forward", category: "playback" },
    { key: "ArrowLeft", description: "Step Backward", category: "playback" },
    { key: "r", description: "Reset", category: "playback" },
    { key: "Home", description: "Go to Start", category: "playback" },
    { key: "End", description: "Go to End", category: "playback" },

    // Speed control
    { key: "[", description: "Decrease Speed", category: "playback" },
    { key: "]", description: "Increase Speed", category: "playback" },

    // View
    { key: "v", description: "Toggle 2D/3D View", category: "view" },
    { key: "2", description: "Switch to 2D", category: "view" },
    { key: "3", description: "Switch to 3D", category: "view" },
    { key: "m", description: "Toggle Mute", category: "general" },

    // General
    { key: "?", modifiers: ["shift"], description: "Show Keyboard Shortcuts", category: "general" },
    { key: "Escape", description: "Close Dialogs / Cancel", category: "general" },
];

// ============================================
// KEYBOARD SHORTCUTS CONTEXT
// ============================================

interface KeyboardShortcutsContextType {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    shortcuts: typeof DEFAULT_SHORTCUTS;
    showHelp: boolean;
    setShowHelp: (show: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType>({
    enabled: true,
    setEnabled: () => { },
    shortcuts: DEFAULT_SHORTCUTS,
    showHelp: false,
    setShowHelp: () => { },
});

export function useKeyboardShortcuts() {
    return useContext(KeyboardShortcutsContext);
}

// ============================================
// KEYBOARD SHORTCUTS PROVIDER
// ============================================

interface KeyboardShortcutsProviderProps {
    children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
    const [enabled, setEnabled] = useState(true);
    const [showHelp, setShowHelp] = useState(false);

    const animationEngine = useAnimationEngine();
    const { mode, setMode } = useVisualizationStore();

    // Handle keyboard events
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignore if typing in input
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Get modifiers
            const hasCtrl = event.ctrlKey || event.metaKey;
            const hasShift = event.shiftKey;
            const hasAlt = event.altKey;

            // Match shortcut
            switch (event.key) {
                // Play/Pause
                case " ":
                    event.preventDefault();
                    if (animationEngine.playbackState === "playing") {
                        animationEngine.pause();
                    } else {
                        animationEngine.play();
                    }
                    announceAction(
                        animationEngine.playbackState === "playing" ? "Paused" : "Playing"
                    );
                    break;

                // Step Forward
                case "ArrowRight":
                    event.preventDefault();
                    if (animationEngine.canGoNext()) {
                        animationEngine.nextStep();
                        announceStep(animationEngine.currentStepIndex + 1, animationEngine.steps.length);
                    }
                    break;

                // Step Backward
                case "ArrowLeft":
                    event.preventDefault();
                    if (animationEngine.canGoPrevious()) {
                        animationEngine.previousStep();
                        announceStep(animationEngine.currentStepIndex - 1, animationEngine.steps.length);
                    }
                    break;

                // Reset
                case "r":
                case "R":
                    if (!hasCtrl) {
                        event.preventDefault();
                        animationEngine.reset();
                        announceAction("Reset to beginning");
                    }
                    break;

                // Go to Start
                case "Home":
                    event.preventDefault();
                    animationEngine.goToStep(0);
                    announceAction("Jumped to start");
                    break;

                // Go to End
                case "End":
                    event.preventDefault();
                    animationEngine.goToStep(animationEngine.steps.length - 1);
                    announceAction("Jumped to end");
                    break;

                // Decrease Speed
                case "[":
                    event.preventDefault();
                    const slowerSpeed = Math.min(animationEngine.speed * 1.5, 2000);
                    animationEngine.setSpeed(slowerSpeed);
                    announceAction(`Speed: ${Math.round(500 / slowerSpeed * 100)}%`);
                    break;

                // Increase Speed
                case "]":
                    event.preventDefault();
                    const fasterSpeed = Math.max(animationEngine.speed / 1.5, 50);
                    animationEngine.setSpeed(fasterSpeed);
                    announceAction(`Speed: ${Math.round(500 / fasterSpeed * 100)}%`);
                    break;

                // Toggle View
                case "v":
                case "V":
                    event.preventDefault();
                    const newMode = mode === "2d" ? "3d" : "2d";
                    setMode(newMode);
                    announceAction(`Switched to ${newMode.toUpperCase()} view`);
                    break;

                // Switch to 2D
                case "2":
                    if (!hasCtrl && !hasAlt) {
                        event.preventDefault();
                        setMode("2d");
                        announceAction("Switched to 2D view");
                    }
                    break;

                // Switch to 3D
                case "3":
                    if (!hasCtrl && !hasAlt) {
                        event.preventDefault();
                        setMode("3d");
                        announceAction("Switched to 3D view");
                    }
                    break;

                // Show Help
                case "?":
                    if (hasShift) {
                        event.preventDefault();
                        setShowHelp(true);
                    }
                    break;

                // Close dialogs
                case "Escape":
                    if (showHelp) {
                        setShowHelp(false);
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enabled, animationEngine, mode, setMode, showHelp]);

    return (
        <KeyboardShortcutsContext.Provider
            value={{
                enabled,
                setEnabled,
                shortcuts: DEFAULT_SHORTCUTS,
                showHelp,
                setShowHelp,
            }}
        >
            {children}
            {showHelp && <KeyboardShortcutsHelp onClose={() => setShowHelp(false)} />}
        </KeyboardShortcutsContext.Provider>
    );
}

// ============================================
// SCREEN READER ANNOUNCEMENTS
// ============================================

let announceElement: HTMLElement | null = null;

function getAnnounceElement(): HTMLElement {
    if (!announceElement && typeof document !== "undefined") {
        announceElement = document.createElement("div");
        announceElement.setAttribute("role", "status");
        announceElement.setAttribute("aria-live", "polite");
        announceElement.setAttribute("aria-atomic", "true");
        announceElement.className = "sr-only";
        document.body.appendChild(announceElement);
    }
    return announceElement!;
}

export function announceAction(message: string) {
    const el = getAnnounceElement();
    if (el) {
        el.textContent = message;
        // Clear after a short delay to allow re-announcements
        setTimeout(() => {
            el.textContent = "";
        }, 1000);
    }
}

export function announceStep(current: number, total: number) {
    const step = useAnimationEngine.getState().getCurrentStep();
    if (step) {
        announceAction(`Step ${current + 1} of ${total}: ${step.description}`);
    }
}

// ============================================
// KEYBOARD SHORTCUTS HELP DIALOG
// ============================================

interface KeyboardShortcutsHelpProps {
    onClose: () => void;
}

function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    // Focus trap
    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog) {
            dialog.focus();
        }
    }, []);

    // Group shortcuts by category
    const groupedShortcuts = DEFAULT_SHORTCUTS.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, typeof DEFAULT_SHORTCUTS>);

    const categoryLabels: Record<string, string> = {
        playback: "Playback Controls",
        navigation: "Navigation",
        view: "View Options",
        general: "General",
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
        >
            <div
                ref={dialogRef}
                className="w-full max-w-lg p-6 bg-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                tabIndex={-1}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 id="shortcuts-title" className="text-xl font-semibold text-white">
                        Keyboard Shortcuts
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        aria-label="Close shortcuts help"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto">
                    {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                        <div key={category}>
                            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
                                {categoryLabels[category] || category}
                            </h3>
                            <div className="space-y-2">
                                {shortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-800/50"
                                    >
                                        <span className="text-sm text-slate-300">
                                            {shortcut.description}
                                        </span>
                                        <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-purple-400 font-mono border border-slate-700">
                                            {formatKey(shortcut.key, shortcut.modifiers)}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500 text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-purple-400 font-mono">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
}

function formatKey(key: string, modifiers?: string[]): string {
    const parts: string[] = [];

    if (modifiers?.includes("ctrl")) parts.push("Ctrl");
    if (modifiers?.includes("shift")) parts.push("Shift");
    if (modifiers?.includes("alt")) parts.push("Alt");
    if (modifiers?.includes("meta")) parts.push("⌘");

    // Format special keys
    const keyMap: Record<string, string> = {
        " ": "Space",
        "ArrowRight": "→",
        "ArrowLeft": "←",
        "ArrowUp": "↑",
        "ArrowDown": "↓",
        "Escape": "Esc",
    };

    parts.push(keyMap[key] || key.toUpperCase());

    return parts.join(" + ");
}

// ============================================
// ACCESSIBLE BUTTON COMPONENT
// ============================================

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shortcut?: string;
    shortcutLabel?: string;
}

export function AccessibleButton({
    children,
    shortcut,
    shortcutLabel,
    ...props
}: AccessibleButtonProps) {
    const ariaLabel = shortcutLabel
        ? `${props["aria-label"] || ""} (${shortcutLabel})`.trim()
        : props["aria-label"];

    return (
        <button
            {...props}
            aria-label={ariaLabel}
            aria-keyshortcuts={shortcut}
        >
            {children}
        </button>
    );
}

// ============================================
// SKIP LINK FOR KEYBOARD NAVIGATION
// ============================================

export function SkipLink() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:outline-none"
        >
            Skip to main content
        </a>
    );
}

// ============================================
// SCREEN READER ONLY TEXT
// ============================================

export function SrOnly({ children }: { children: React.ReactNode }) {
    return <span className="sr-only">{children}</span>;
}

// ============================================
// LIVE REGION FOR UPDATES
// ============================================

interface LiveRegionProps {
    message: string;
    politeness?: "polite" | "assertive";
}

export function LiveRegion({ message, politeness = "polite" }: LiveRegionProps) {
    return (
        <div
            role="status"
            aria-live={politeness}
            aria-atomic="true"
            className="sr-only"
        >
            {message}
        </div>
    );
}

// ============================================
// FOCUS TRAP HOOK
// ============================================

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean) {
    useEffect(() => {
        if (!isActive || !containerRef.current) return;

        const container = containerRef.current;
        const focusableElements = container.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== "Tab") return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        container.addEventListener("keydown", handleTab);
        firstElement?.focus();

        return () => container.removeEventListener("keydown", handleTab);
    }, [containerRef, isActive]);
}
