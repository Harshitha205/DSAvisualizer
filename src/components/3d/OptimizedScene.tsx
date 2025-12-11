"use client";

import React, { Suspense, memo, useMemo, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import {
    OrbitControls,
    PerspectiveCamera,
    ContactShadows,
    Environment,
} from "@react-three/drei";
import {
    EffectComposer,
    Bloom,
    Vignette,
} from "@react-three/postprocessing";
import { AnimatedInstancedBars, UltraPerformanceInstancedBars } from "./InstancedBars";
import { useVisualizationStore } from "@/stores/visualizationStore";

// ============================================
// PERFORMANCE CONFIGURATION
// ============================================

interface PerformanceConfig {
    maxBarsForFullQuality: number;
    maxBarsForMediumQuality: number;
    enablePostProcessing: boolean;
    enableShadows: boolean;
    enableEnvironment: boolean;
}

const PERFORMANCE_CONFIGS: Record<"high" | "medium" | "low", PerformanceConfig> = {
    high: {
        maxBarsForFullQuality: 50,
        maxBarsForMediumQuality: 100,
        enablePostProcessing: true,
        enableShadows: true,
        enableEnvironment: true,
    },
    medium: {
        maxBarsForFullQuality: 100,
        maxBarsForMediumQuality: 200,
        enablePostProcessing: true,
        enableShadows: false,
        enableEnvironment: false,
    },
    low: {
        maxBarsForFullQuality: 200,
        maxBarsForMediumQuality: 500,
        enablePostProcessing: false,
        enableShadows: false,
        enableEnvironment: false,
    },
};

// ============================================
// MEMOIZED LIGHTING SETUP
// ============================================

const Lighting = memo(function Lighting({ enableShadows }: { enableShadows: boolean }) {
    return (
        <>
            <ambientLight intensity={0.15} color="#a78bfa" />
            <directionalLight
                position={[8, 15, 10]}
                intensity={0.8}
                color="#e9d5ff"
                castShadow={enableShadows}
                shadow-mapSize={enableShadows ? [2048, 2048] : undefined}
            />
            <pointLight position={[-10, 10, -10]} intensity={0.3} color="#06b6d4" />
            <pointLight position={[10, 5, 10]} intensity={0.2} color="#f43f5e" />
        </>
    );
});

// ============================================
// MEMOIZED GROUND PLANE
// ============================================

const Ground = memo(function Ground({ enableShadows }: { enableShadows: boolean }) {
    return (
        <>
            {/* Base plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={enableShadows}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial
                    color="#0f0720"
                    metalness={0.8}
                    roughness={0.4}
                />
            </mesh>

            {/* Grid lines */}
            <gridHelper
                args={[40, 40, "#4c1d95", "#1e1b4b"]}
                position={[0, 0.01, 0]}
            />

            {/* Contact shadows for depth */}
            {enableShadows && (
                <ContactShadows
                    position={[0, 0, 0]}
                    opacity={0.4}
                    scale={30}
                    blur={2}
                    far={8}
                    color="#000"
                />
            )}
        </>
    );
});

// ============================================
// MEMOIZED POST-PROCESSING
// Simplified for performance
// ============================================

const OptimizedPostProcessing = memo(function OptimizedPostProcessing() {
    return (
        <EffectComposer multisampling={0}>
            <Bloom
                intensity={0.8}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
            />
            <Vignette offset={0.2} darkness={0.5} />
        </EffectComposer>
    );
});

// ============================================
// SCENE CONTENT
// ============================================

interface SceneContentProps {
    config: PerformanceConfig;
    barCount: number;
}

const SceneContent = memo(function SceneContent({ config, barCount }: SceneContentProps) {
    // Choose renderer based on bar count
    const useUltraPerformance = barCount > config.maxBarsForMediumQuality;
    const useAnimated = barCount <= config.maxBarsForFullQuality;

    return (
        <>
            {/* Camera */}
            <PerspectiveCamera makeDefault position={[0, 10, 18]} fov={45} />
            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2.1}
            />

            {/* Lighting */}
            <Lighting enableShadows={config.enableShadows && barCount < 50} />

            {/* Environment */}
            {config.enableEnvironment && (
                <Environment preset="night" />
            )}

            {/* Ground */}
            <Ground enableShadows={config.enableShadows} />

            {/* Bars - Choose renderer based on count */}
            <group position={[0, 0, 0]}>
                {useUltraPerformance ? (
                    <UltraPerformanceInstancedBars />
                ) : useAnimated ? (
                    <AnimatedInstancedBars
                        barWidth={0.7}
                        gapRatio={0.3}
                        maxHeight={7}
                        animationSpeed={10}
                    />
                ) : (
                    <AnimatedInstancedBars
                        barWidth={0.5}
                        gapRatio={0.2}
                        maxHeight={6}
                        animationSpeed={12}
                    />
                )}
            </group>

            {/* Post-processing (only if enabled and low bar count) */}
            {config.enablePostProcessing && barCount < 100 && (
                <OptimizedPostProcessing />
            )}
        </>
    );
});

// ============================================
// MAIN OPTIMIZED SCENE
// ============================================

interface OptimizedSortingSceneProps {
    quality?: "high" | "medium" | "low" | "auto";
    className?: string;
}

export const OptimizedSortingScene = memo(function OptimizedSortingScene({
    quality = "auto",
    className = "",
}: OptimizedSortingSceneProps) {
    // Get bar count with minimal subscription
    const barCount = useVisualizationStore((state) => state.array.length);

    // Auto-select quality based on bar count
    const effectiveQuality = useMemo(() => {
        if (quality !== "auto") return quality;

        if (barCount <= 30) return "high";
        if (barCount <= 100) return "medium";
        return "low";
    }, [quality, barCount]);

    const config = PERFORMANCE_CONFIGS[effectiveQuality];

    // Memoize canvas props
    const canvasProps = useMemo(() => ({
        shadows: config.enableShadows,
        dpr: barCount > 100 ? 1 : [1, 2] as [number, number],
        gl: {
            antialias: barCount <= 100,
            powerPreference: "high-performance" as const,
            alpha: false,
        },
        performance: {
            min: 0.5,
            max: 1,
            debounce: 200,
        },
    }), [config.enableShadows, barCount]);

    return (
        <div className={`w-full h-full bg-slate-950 ${className}`}>
            <Canvas {...canvasProps}>
                <Suspense fallback={null}>
                    <SceneContent config={config} barCount={barCount} />
                </Suspense>
            </Canvas>

            {/* Quality indicator */}
            {process.env.NODE_ENV === "development" && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                    {barCount} bars | {effectiveQuality} quality
                </div>
            )}
        </div>
    );
});

// ============================================
// PERFORMANCE STATS OVERLAY
// ============================================

export function PerformanceOverlay() {
    const [fps, setFps] = React.useState(60);
    const frameCount = React.useRef(0);
    const lastTime = React.useRef(performance.now());

    React.useEffect(() => {
        let animationFrame: number;

        const updateFPS = () => {
            frameCount.current++;
            const now = performance.now();
            const elapsed = now - lastTime.current;

            if (elapsed >= 1000) {
                setFps(Math.round((frameCount.current * 1000) / elapsed));
                frameCount.current = 0;
                lastTime.current = now;
            }

            animationFrame = requestAnimationFrame(updateFPS);
        };

        animationFrame = requestAnimationFrame(updateFPS);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    const fpsColor = fps >= 55 ? "text-emerald-400" : fps >= 30 ? "text-amber-400" : "text-rose-400";

    return (
        <div className="absolute top-2 right-2 px-3 py-2 bg-black/70 rounded-lg backdrop-blur-sm">
            <div className={`text-sm font-mono ${fpsColor}`}>
                {fps} FPS
            </div>
        </div>
    );
}
