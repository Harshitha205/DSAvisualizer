"use client";

import { Howl, Howler } from "howler";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useCallback, useRef } from "react";

// ============================================
// SOUND TYPES
// ============================================

export type SoundType =
    | "compare"
    | "swap"
    | "sorted"
    | "complete"
    | "pivot"
    | "click"
    | "success"
    | "error";

// ============================================
// SOUND STORE
// ============================================

interface SoundState {
    isMuted: boolean;
    masterVolume: number;

    toggleMute: () => void;
    setMasterVolume: (volume: number) => void;
}

export const useSoundStore = create<SoundState>()(
    persist(
        (set, get) => ({
            isMuted: false,
            masterVolume: 0.5,

            toggleMute: () => {
                const newMuted = !get().isMuted;
                Howler.mute(newMuted);
                set({ isMuted: newMuted });
            },

            setMasterVolume: (volume) => {
                const clampedVolume = Math.max(0, Math.min(1, volume));
                Howler.volume(clampedVolume);
                set({ masterVolume: clampedVolume });
            },
        }),
        {
            name: "dsa-visualizer-howler-settings",
        }
    )
);

// ============================================
// SYNTH SOUND GENERATOR
// Creates sounds using Web Audio + Howler
// ============================================

class SynthSound {
    private audioContext: AudioContext | null = null;

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        }
        return this.audioContext;
    }

    // Generate a base64 encoded WAV of a sine wave
    private generateToneWav(frequency: number, duration: number, volume: number = 0.5): string {
        const sampleRate = 44100;
        const numSamples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset + i, str.charCodeAt(i));
            }
        };

        writeString(0, "RIFF");
        view.setUint32(4, 36 + numSamples * 2, true);
        writeString(8, "WAVE");
        writeString(12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, "data");
        view.setUint32(40, numSamples * 2, true);

        // Generate sine wave with envelope
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5) * Math.min(1, t * 100);
            const sample = Math.sin(2 * Math.PI * frequency * t) * envelope * volume;
            view.setInt16(44 + i * 2, Math.floor(sample * 32767), true);
        }

        // Convert to base64
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return "data:audio/wav;base64," + btoa(binary);
    }

    // Generate different sound types
    generateCompareSound(): string {
        return this.generateToneWav(880, 0.08, 0.3);
    }

    generateSwapSound(): string {
        return this.generateToneWav(440, 0.12, 0.35);
    }

    generateSortedSound(): string {
        return this.generateToneWav(660, 0.15, 0.4);
    }

    generateCompleteSound(): string {
        return this.generateToneWav(523, 0.4, 0.5);
    }

    generatePivotSound(): string {
        return this.generateToneWav(1046, 0.1, 0.35);
    }

    generateClickSound(): string {
        return this.generateToneWav(1200, 0.03, 0.2);
    }
}

// ============================================
// HOWLER SOUND MANAGER
// ============================================

class HowlerSoundManager {
    private sounds: Map<SoundType, Howl> = new Map();
    private synth: SynthSound = new SynthSound();
    private initialized = false;

    initialize() {
        if (this.initialized || typeof window === "undefined") return;

        // Create Howl instances for each sound type
        this.sounds.set("compare", new Howl({
            src: [this.synth.generateCompareSound()],
            volume: 0.3,
            rate: 1.2,
            preload: true,
        }));

        this.sounds.set("swap", new Howl({
            src: [this.synth.generateSwapSound()],
            volume: 0.4,
            rate: 0.9,
            preload: true,
        }));

        this.sounds.set("sorted", new Howl({
            src: [this.synth.generateSortedSound()],
            volume: 0.35,
            rate: 1.3,
            preload: true,
        }));

        this.sounds.set("complete", new Howl({
            src: [this.synth.generateCompleteSound()],
            volume: 0.5,
            rate: 1.0,
            preload: true,
        }));

        this.sounds.set("pivot", new Howl({
            src: [this.synth.generatePivotSound()],
            volume: 0.35,
            rate: 1.1,
            preload: true,
        }));

        this.sounds.set("click", new Howl({
            src: [this.synth.generateClickSound()],
            volume: 0.2,
            rate: 1.5,
            preload: true,
        }));

        this.initialized = true;
    }

    play(type: SoundType, options?: { rate?: number; volume?: number }) {
        this.initialize();

        const sound = this.sounds.get(type);
        if (sound) {
            if (options?.rate) sound.rate(options.rate);
            if (options?.volume) sound.volume(options.volume);
            sound.play();
        }
    }

    stop(type: SoundType) {
        const sound = this.sounds.get(type);
        if (sound) {
            sound.stop();
        }
    }

    stopAll() {
        this.sounds.forEach(sound => sound.stop());
    }

    // Play a sequence of sounds (for complete animation)
    async playSequence(types: SoundType[], interval: number = 100) {
        for (const type of types) {
            this.play(type);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    // Play with pitch based on array index position
    playWithPitch(type: SoundType, index: number, total: number) {
        const rate = 0.8 + (index / total) * 0.6; // Rate from 0.8 to 1.4
        this.play(type, { rate });
    }
}

// Singleton instance
let soundManager: HowlerSoundManager | null = null;

export function getSoundManager(): HowlerSoundManager {
    if (!soundManager) {
        soundManager = new HowlerSoundManager();
    }
    return soundManager;
}

// ============================================
// SOUND FUNCTIONS
// ============================================

export function playSound(type: SoundType, options?: { rate?: number; volume?: number }) {
    if (typeof window === "undefined") return;

    const { isMuted } = useSoundStore.getState();
    if (isMuted) return;

    getSoundManager().play(type, options);
}

export function playSoundWithPitch(type: SoundType, index: number, total: number) {
    if (typeof window === "undefined") return;

    const { isMuted } = useSoundStore.getState();
    if (isMuted) return;

    getSoundManager().playWithPitch(type, index, total);
}

export function stopAllSounds() {
    getSoundManager().stopAll();
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Main hook for sound effects
 */
export function useSoundEffects() {
    const { isMuted, masterVolume, toggleMute, setMasterVolume } = useSoundStore();

    // Initialize sound manager on mount
    useEffect(() => {
        getSoundManager().initialize();
        Howler.volume(masterVolume);
        Howler.mute(isMuted);
    }, []);

    const play = useCallback((type: SoundType, options?: { rate?: number }) => {
        playSound(type, options);
    }, []);

    return {
        play,
        playCompare: useCallback(() => play("compare"), [play]),
        playSwap: useCallback(() => play("swap"), [play]),
        playSorted: useCallback(() => play("sorted"), [play]),
        playComplete: useCallback(() => play("complete"), [play]),
        playPivot: useCallback(() => play("pivot"), [play]),
        playClick: useCallback(() => play("click"), [play]),
        stopAll: stopAllSounds,
        isMuted,
        masterVolume,
        toggleMute,
        setMasterVolume,
    };
}

/**
 * Hook for auto-playing sounds based on animation step type
 */
export function useStepSounds(
    stepType: string | null,
    index?: number,
    total?: number
) {
    const lastStepType = useRef<string | null>(null);

    useEffect(() => {
        if (stepType && stepType !== lastStepType.current) {
            const soundMap: Record<string, SoundType> = {
                compare: "compare",
                swap: "swap",
                mark_sorted: "sorted",
                mark_pivot: "pivot",
                complete: "complete",
            };

            const soundType = soundMap[stepType];
            if (soundType) {
                if (index !== undefined && total !== undefined) {
                    playSoundWithPitch(soundType, index, total);
                } else {
                    playSound(soundType);
                }
            }

            lastStepType.current = stepType;
        }
    }, [stepType, index, total]);
}

// ============================================
// SOUND TOGGLE COMPONENT
// ============================================

import React from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

interface SoundToggleProps {
    className?: string;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function SoundToggle({
    className = "",
    size = "md",
    showLabel = false,
}: SoundToggleProps) {
    const { isMuted, masterVolume, toggleMute, setMasterVolume } = useSoundStore();

    const sizes = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    const iconSizes = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
    };

    const VolumeIcon = isMuted ? VolumeX : masterVolume > 0.5 ? Volume2 : Volume1;

    return (
        <div className= {`flex items-center gap-2 ${className}`
}>
    <motion.button
                onClick={
    () => {
        toggleMute();
        if (!isMuted) {
            playSound("click");
        }
    }
}
className = {`${sizes[size]} rounded-xl flex items-center justify-center transition-all ${isMuted
        ? "bg-slate-800/50 text-slate-500 hover:bg-slate-700/50"
        : "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
    }`}
whileTap = {{ scale: 0.95 }}
whileHover = {{ scale: 1.05 }}
title = { isMuted? "Unmute": "Mute" }
    >
    <VolumeIcon className={ iconSizes[size] } />
        </motion.button>

{
    showLabel && (
        <span className="text-sm text-slate-400" >
            { isMuted? "Muted": `${Math.round(masterVolume * 100)}%` }
            </span>
            )
}
</div>
    );
}

// ============================================
// VOLUME SLIDER COMPONENT
// ============================================

export function VolumeSlider({ className = "" }: { className?: string }) {
    const { masterVolume, setMasterVolume, isMuted } = useSoundStore();

    return (
        <div className= {`flex items-center gap-3 ${className}`
}>
    <SoundToggle size="sm" />

        <div className="relative flex-1 h-2 rounded-full bg-slate-800" >
            <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
initial = { false}
animate = {{
    width: `${masterVolume * 100}%`,
        opacity: isMuted ? 0.3 : 1,
                    }}
transition = {{ duration: 0.1 }}
                />
    < input
type = "range"
min = "0"
max = "100"
value = { masterVolume * 100}
onChange = {(e) => setMasterVolume(Number(e.target.value) / 100)}
disabled = { isMuted }
className = "absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
    />
    </div>

    < span className = "text-xs text-slate-500 font-mono w-8" >
        { Math.round(masterVolume * 100) } %
        </span>
        </div>
    );
}
