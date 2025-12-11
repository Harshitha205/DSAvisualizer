"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useCallback, useRef } from "react";

// ============================================
// SOUND TYPES & CONFIGURATION
// ============================================

export type SoundType =
    | "compare"
    | "swap"
    | "sorted"
    | "complete"
    | "pivot"
    | "click"
    | "hover"
    | "start"
    | "error";

interface SoundConfig {
    src: string;
    volume: number;
    rate?: number;  // Playback rate
}

// Base64 encoded sound effects (simple tones generated programmatically)
// These are small audio files encoded as data URIs for instant loading
const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
    compare: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.3,
        rate: 1.2,
    },
    swap: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.4,
        rate: 0.8,
    },
    sorted: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.35,
        rate: 1.5,
    },
    complete: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.5,
        rate: 1.0,
    },
    pivot: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.35,
        rate: 1.3,
    },
    click: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.2,
        rate: 1.5,
    },
    hover: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.1,
        rate: 2.0,
    },
    start: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.4,
        rate: 1.0,
    },
    error: {
        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA",
        volume: 0.3,
        rate: 0.6,
    },
};

// ============================================
// SOUND STORE (Zustand with persistence)
// ============================================

interface SoundState {
    isMuted: boolean;
    masterVolume: number;
    soundEnabled: Record<SoundType, boolean>;

    // Actions
    toggleMute: () => void;
    setMasterVolume: (volume: number) => void;
    toggleSound: (type: SoundType) => void;
    setEnabled: (type: SoundType, enabled: boolean) => void;
}

export const useSoundStore = create<SoundState>()(
    persist(
        (set, get) => ({
            isMuted: false,
            masterVolume: 0.5,
            soundEnabled: {
                compare: true,
                swap: true,
                sorted: true,
                complete: true,
                pivot: true,
                click: true,
                hover: false,  // Disabled by default
                start: true,
                error: true,
            },

            toggleMute: () => set({ isMuted: !get().isMuted }),

            setMasterVolume: (volume) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),

            toggleSound: (type) => set({
                soundEnabled: {
                    ...get().soundEnabled,
                    [type]: !get().soundEnabled[type],
                },
            }),

            setEnabled: (type, enabled) => set({
                soundEnabled: {
                    ...get().soundEnabled,
                    [type]: enabled,
                },
            }),
        }),
        {
            name: "dsa-visualizer-sound-settings",
        }
    )
);

// ============================================
// WEB AUDIO API SOUND ENGINE
// Generates tones programmatically
// ============================================

class SoundEngine {
    private audioContext: AudioContext | null = null;
    private gainNode: GainNode | null = null;

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
        }
        return this.audioContext;
    }

    // Generate a tone with specific frequency and duration
    private playTone(frequency: number, duration: number, volume: number, type: OscillatorType = "sine") {
        const ctx = this.getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Quick attack, exponential decay
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    // Play a chord (multiple frequencies)
    private playChord(frequencies: number[], duration: number, volume: number) {
        frequencies.forEach(freq => {
            this.playTone(freq, duration, volume / frequencies.length, "sine");
        });
    }

    // Sound definitions
    playCompare(volume: number) {
        // Quick high-pitched tick
        this.playTone(880, 0.05, volume * 0.4, "sine");
    }

    playSwap(volume: number) {
        // Two-note swoosh
        this.playTone(440, 0.08, volume * 0.3, "triangle");
        setTimeout(() => {
            this.playTone(660, 0.08, volume * 0.3, "triangle");
        }, 50);
    }

    playSorted(volume: number) {
        // Rising arpeggio
        this.playTone(523, 0.1, volume * 0.25, "sine");
        setTimeout(() => this.playTone(659, 0.1, volume * 0.25, "sine"), 50);
        setTimeout(() => this.playTone(784, 0.15, volume * 0.3, "sine"), 100);
    }

    playComplete(volume: number) {
        // Victory fanfare chord
        this.playChord([523, 659, 784], 0.3, volume * 0.5);
        setTimeout(() => {
            this.playChord([587, 740, 880], 0.4, volume * 0.6);
        }, 200);
    }

    playPivot(volume: number) {
        // Distinctive ping
        this.playTone(1046, 0.08, volume * 0.35, "sine");
    }

    playClick(volume: number) {
        // Soft click
        this.playTone(800, 0.02, volume * 0.2, "square");
    }

    playHover(volume: number) {
        // Very subtle tick
        this.playTone(1200, 0.015, volume * 0.1, "sine");
    }

    playStart(volume: number) {
        // Ascending tone
        this.playTone(392, 0.1, volume * 0.3, "sine");
        setTimeout(() => this.playTone(523, 0.1, volume * 0.3, "sine"), 80);
        setTimeout(() => this.playTone(659, 0.15, volume * 0.35, "sine"), 160);
    }

    playError(volume: number) {
        // Descending buzzy tone
        this.playTone(200, 0.2, volume * 0.3, "sawtooth");
        setTimeout(() => this.playTone(150, 0.3, volume * 0.25, "sawtooth"), 150);
    }
}

// Singleton instance
let soundEngine: SoundEngine | null = null;

function getSoundEngine(): SoundEngine {
    if (!soundEngine) {
        soundEngine = new SoundEngine();
    }
    return soundEngine;
}

// ============================================
// PLAY SOUND FUNCTION
// ============================================

export function playSound(type: SoundType) {
    // Check if we're in browser
    if (typeof window === "undefined") return;

    const { isMuted, masterVolume, soundEnabled } = useSoundStore.getState();

    if (isMuted || !soundEnabled[type]) return;

    const engine = getSoundEngine();
    const volume = masterVolume;

    switch (type) {
        case "compare":
            engine.playCompare(volume);
            break;
        case "swap":
            engine.playSwap(volume);
            break;
        case "sorted":
            engine.playSorted(volume);
            break;
        case "complete":
            engine.playComplete(volume);
            break;
        case "pivot":
            engine.playPivot(volume);
            break;
        case "click":
            engine.playClick(volume);
            break;
        case "hover":
            engine.playHover(volume);
            break;
        case "start":
            engine.playStart(volume);
            break;
        case "error":
            engine.playError(volume);
            break;
    }
}

// ============================================
// SOUND HOOKS
// ============================================

/**
 * Hook for playing sounds with animation sync
 */
export function useSoundEffects() {
    const { isMuted, masterVolume, toggleMute, setMasterVolume } = useSoundStore();

    const play = useCallback((type: SoundType) => {
        playSound(type);
    }, []);

    const playCompare = useCallback(() => play("compare"), [play]);
    const playSwap = useCallback(() => play("swap"), [play]);
    const playSorted = useCallback(() => play("sorted"), [play]);
    const playComplete = useCallback(() => play("complete"), [play]);
    const playPivot = useCallback(() => play("pivot"), [play]);
    const playClick = useCallback(() => play("click"), [play]);

    return {
        play,
        playCompare,
        playSwap,
        playSorted,
        playComplete,
        playPivot,
        playClick,
        isMuted,
        masterVolume,
        toggleMute,
        setMasterVolume,
    };
}

/**
 * Hook to auto-play sounds based on animation step
 */
export function useAnimationSounds(stepType: string | null) {
    const lastStepType = useRef<string | null>(null);

    useEffect(() => {
        if (stepType && stepType !== lastStepType.current) {
            switch (stepType) {
                case "compare":
                    playSound("compare");
                    break;
                case "swap":
                    playSound("swap");
                    break;
                case "mark_sorted":
                    playSound("sorted");
                    break;
                case "mark_pivot":
                    playSound("pivot");
                    break;
                case "complete":
                    playSound("complete");
                    break;
            }
            lastStepType.current = stepType;
        }
    }, [stepType]);
}

// ============================================
// SOUND SETTINGS COMPONENT
// ============================================

import React from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

interface SoundSettingsProps {
    className?: string;
    compact?: boolean;
}

export function SoundSettings({ className = "", compact = false }: SoundSettingsProps) {
    const {
        isMuted,
        masterVolume,
        soundEnabled,
        toggleMute,
        setMasterVolume,
        toggleSound,
    } = useSoundStore();

    const VolumeIcon = isMuted ? VolumeX : masterVolume > 0.5 ? Volume2 : Volume1;

    if (compact) {
        return (
            <motion.button
                onClick= { toggleMute }
        className = {`p-2 rounded-xl transition-colors ${isMuted
                ? "bg-slate-800/50 text-slate-500"
                : "bg-purple-500/20 text-purple-400"
            } ${className}`
    }
    whileTap = {{ scale: 0.95 }
}
title = { isMuted? "Unmute sounds": "Mute sounds" }
    >
    <VolumeIcon className="w-5 h-5" />
        </motion.button>
        );
    }

return (
    <div className= {`space-y-4 ${className}`}>
        {/* Mute toggle */ }
        < div className = "flex items-center justify-between" >
            <span className="text-sm text-slate-400" > Sound Effects </span>
                < button
onClick = { toggleMute }
className = {`relative w-12 h-6 rounded-full transition-colors ${isMuted ? "bg-slate-700" : "bg-purple-600"
    }`}
                >
    <motion.div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
animate = {{ left: isMuted ? 4 : 28 }}
transition = {{ type: "spring", stiffness: 500, damping: 30 }}
                    />
    </button>
    </div>

{/* Volume slider */ }
<div className="space-y-2" >
    <div className="flex items-center justify-between" >
        <span className="text-xs text-slate-500" > Volume </span>
            < span className = "text-xs text-purple-400 font-mono" >
                { Math.round(masterVolume * 100) } %
                </span>
                </div>
                < div className = "relative h-2 rounded-full bg-slate-800" >
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
style = {{ width: `${masterVolume * 100}%` }}
                    />
    < input
type = "range"
min = "0"
max = "100"
value = { masterVolume * 100}
onChange = {(e) => setMasterVolume(Number(e.target.value) / 100)}
className = "absolute inset-0 w-full opacity-0 cursor-pointer"
    />
    </div>
    </div>

{/* Sound toggles */ }
<div className="space-y-2" >
    <span className="text-xs text-slate-500" > Sound Types </span>
        < div className = "grid grid-cols-2 gap-2" >
            {(["compare", "swap", "sorted", "complete"] as SoundType[]).map((type) => (
                <button
                            key= { type }
                            onClick = {() => {
                toggleSound(type);
                                playSound(type);
            }}
                className = {`px-3 py-2 rounded-lg text-xs capitalize transition-colors ${soundEnabled[type]
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-slate-800/50 text-slate-500"
                    }`}
                        >
                { type }
                </button>
            ))}
</div>
    </div>
    </div>
    );
}

// ============================================
// COMPACT MUTE TOGGLE BUTTON
// ============================================

export function MuteToggle({ className = "" }: { className?: string }) {
    return <SoundSettings compact className = { className } />;
}
