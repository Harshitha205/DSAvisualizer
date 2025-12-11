"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { SwapPhase } from "@/stores/visualizationStore";

// ============================================
// TYPES
// ============================================
export type BarState = "default" | "comparing" | "swapping" | "sorted" | "pivot";

interface ArrayBarProps {
    value: number;
    index: number;
    totalBars: number;
    state: BarState;
    maxValue?: number;
    // Swap animation props
    swapTargetIndex?: number;
    swapPhase?: SwapPhase;
}

// ============================================
// COLOR & STATE CONFIGURATION
// ============================================

const STATE_COLORS: Record<BarState, string> = {
    default: "#8b5cf6",
    comparing: "#fbbf24",
    swapping: "#f43f5e",
    sorted: "#10b981",
    pivot: "#06b6d4",
};

const STATE_EMISSIVE: Record<BarState, number> = {
    default: 0.25,
    comparing: 0.9,
    swapping: 1.4,
    sorted: 0.5,
    pivot: 0.7,
};

const STATE_SCALE: Record<BarState, number> = {
    default: 1.0,
    comparing: 1.08,
    swapping: 1.12,
    sorted: 1.0,
    pivot: 1.05,
};

const STATE_GLOW: Record<BarState, number> = {
    default: 0.3,
    comparing: 1.2,
    swapping: 2.0,
    sorted: 0.6,
    pivot: 1.0,
};

// ============================================
// SWAP ANIMATION CONFIGURATIONS
// ============================================

const SWAP_LIFT_HEIGHT = 1.5;     // How high bars lift during swap
const SWAP_ARC_HEIGHT = 0.3;      // Additional arc height during slide

// Spring configs for each swap phase
const SPRING_CONFIGS = {
    idle: { tension: 200, friction: 22 },
    lift: { tension: 400, friction: 18 },     // Quick lift
    slide: { tension: 180, friction: 16 },    // Smooth slide with slight overshoot
    settle: { tension: 300, friction: 22 },   // Controlled settle
    comparing: { tension: 280, friction: 20 },
    sorted: { tension: 150, friction: 25 },
};

// ============================================
// BAR DIMENSION CALCULATOR
// ============================================

function calculateBarLayout(index: number, totalBars: number) {
    const barWidth = 0.6;
    const barDepth = 0.6;
    const gap = 0.22;
    const totalWidth = totalBars * (barWidth + gap);
    const xPos = index * (barWidth + gap) - totalWidth / 2 + barWidth / 2;
    
    return { barWidth, barDepth, gap, totalWidth, xPos };
}

// ============================================
// MAIN ARRAY BAR COMPONENT
// ============================================

export function ArrayBar({ 
    value, 
    index, 
    totalBars, 
    state, 
    maxValue = 100,
    swapTargetIndex,
    swapPhase = "idle",
}: ArrayBarProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    
    // Calculate dimensions
    const { barWidth, barDepth, gap, xPos } = calculateBarLayout(index, totalBars);
    const maxHeight = 7;
    const minHeight = 0.4;
    const targetHeight = Math.max((value / maxValue) * maxHeight, minHeight);
    const baseY = targetHeight / 2;

    // Calculate swap target X position
    const targetXPos = swapTargetIndex !== undefined 
        ? calculateBarLayout(swapTargetIndex, totalBars).xPos 
        : xPos;
    
    // Calculate the horizontal distance to travel
    const swapDistance = targetXPos - xPos;

    // ========== SWAP ANIMATION SPRINGS ==========
    
    // Lift animation (Y position offset)
    const { liftOffset } = useSpring({
        liftOffset: swapPhase === "lift" || swapPhase === "slide" 
            ? SWAP_LIFT_HEIGHT 
            : 0,
        config: swapPhase === "lift" 
            ? SPRING_CONFIGS.lift 
            : SPRING_CONFIGS.settle,
    });

    // Slide animation (X position offset)
    const { slideOffset } = useSpring({
        slideOffset: swapPhase === "slide" || swapPhase === "settle" 
            ? swapDistance 
            : 0,
        config: SPRING_CONFIGS.slide,
    });

    // Arc height during slide (parabolic motion feel)
    const { arcOffset } = useSpring({
        arcOffset: swapPhase === "slide" 
            ? SWAP_ARC_HEIGHT 
            : 0,
        config: { tension: 200, friction: 20 },
    });

    // Scale pulse during swap
    const { swapScale } = useSpring({
        swapScale: swapPhase === "lift" || swapPhase === "slide" 
            ? 1.15 
            : 1.0,
        config: SPRING_CONFIGS.lift,
    });

    // Rotation during swap
    const { swapRotation } = useSpring({
        swapRotation: swapPhase === "slide" 
            ? (swapDistance > 0 ? 0.1 : -0.1) 
            : 0,
        config: SPRING_CONFIGS.slide,
    });

    // ========== COLOR & EMISSIVE SPRINGS ==========
    
    const { 
        colorR, colorG, colorB,
        emissiveIntensity,
        glowIntensity,
        baseScale,
    } = useSpring({
        colorR: parseInt(STATE_COLORS[state].slice(1, 3), 16) / 255,
        colorG: parseInt(STATE_COLORS[state].slice(3, 5), 16) / 255,
        colorB: parseInt(STATE_COLORS[state].slice(5, 7), 16) / 255,
        emissiveIntensity: STATE_EMISSIVE[state],
        glowIntensity: STATE_GLOW[state],
        baseScale: STATE_SCALE[state],
        config: state === "comparing" 
            ? SPRING_CONFIGS.comparing 
            : state === "sorted" 
                ? SPRING_CONFIGS.sorted 
                : SPRING_CONFIGS.idle,
    });

    // ========== EDGE GEOMETRY ==========
    
    const edgesGeometry = useMemo(() => {
        const boxGeo = new THREE.BoxGeometry(
            barWidth + 0.03, 
            targetHeight + 0.03, 
            barDepth + 0.03
        );
        return new THREE.EdgesGeometry(boxGeo);
    }, [targetHeight, barWidth, barDepth]);

    // ========== ANIMATION LOOP ==========
    
    useFrame((clock) => {
        const time = clock.clock.getElapsedTime();

        if (meshRef.current) {
            // Get animated values
            const currentLift = (liftOffset as unknown as { get: () => number }).get();
            const currentSlide = (slideOffset as unknown as { get: () => number }).get();
            const currentArc = (arcOffset as unknown as { get: () => number }).get();
            const currentSwapRotation = (swapRotation as unknown as { get: () => number }).get();
            
            // Base idle floating animation
            const idleFloat = swapPhase === "idle" 
                ? Math.sin(time * 1.2 + index * 0.35) * 0.04 
                : 0;
            
            // Calculate final Y position: base + lift + arc + idle float
            meshRef.current.position.y = baseY + currentLift + currentArc + idleFloat;
            
            // Calculate final X position: base + slide offset
            meshRef.current.position.x = currentSlide;

            // Rotation effects
            if (swapPhase === "slide") {
                // Tilt in direction of movement during slide
                meshRef.current.rotation.z = currentSwapRotation;
                meshRef.current.rotation.y = Math.sin(time * 10) * 0.05;
            } else if (state === "comparing") {
                meshRef.current.rotation.y = Math.sin(time * 6) * 0.03;
            } else if (state === "sorted") {
                meshRef.current.rotation.y *= 0.92;
                meshRef.current.rotation.z *= 0.92;
            } else if (swapPhase === "idle") {
                meshRef.current.rotation.y = Math.sin(time * 0.6 + index * 0.15) * 0.015;
                meshRef.current.rotation.z *= 0.95;
            }
        }

        // Group pulse for active states
        if (groupRef.current) {
            if (swapPhase !== "idle") {
                const pulse = 1 + Math.sin(time * 12) * 0.02;
                groupRef.current.scale.setScalar(pulse);
            } else if (state === "comparing") {
                const pulse = 1 + Math.sin(time * 8) * 0.015;
                groupRef.current.scale.setScalar(pulse);
            } else {
                groupRef.current.scale.setScalar(1);
            }
        }
    });

    // ========== COLOR INTERPOLATION HELPER ==========
    
    const interpolateColor = (r: number) => {
        const g = (colorG as unknown as { get: () => number }).get();
        const b = (colorB as unknown as { get: () => number }).get();
        return new THREE.Color(r, g, b);
    };

    // ========== RENDER ==========
    
    return (
        <group ref={groupRef} position={[xPos, 0, 0]}>
            {/* ===== MAIN BAR MESH ===== */}
            <animated.mesh
                ref={meshRef}
                position-y={baseY}
                scale-x={swapPhase !== "idle" ? swapScale : baseScale}
                scale-y={1}
                scale-z={swapPhase !== "idle" ? swapScale : baseScale}
                castShadow
                receiveShadow
            >
                <RoundedBox 
                    args={[barWidth, targetHeight, barDepth]} 
                    radius={0.06} 
                    smoothness={4}
                >
                    <animated.meshStandardMaterial
                        color={colorR.to(interpolateColor)}
                        emissive={colorR.to(interpolateColor)}
                        emissiveIntensity={emissiveIntensity}
                        metalness={0.45}
                        roughness={0.25}
                        envMapIntensity={1.2}
                    />
                </RoundedBox>
            </animated.mesh>

            {/* ===== NEON EDGE GLOW ===== */}
            <animated.lineSegments
                geometry={edgesGeometry}
                position-x={slideOffset}
                position-y={liftOffset.to(l => baseY + l + (arcOffset as unknown as { get: () => number }).get())}
                scale-x={swapPhase !== "idle" ? swapScale : baseScale}
                scale-z={swapPhase !== "idle" ? swapScale : baseScale}
            >
                <animated.lineBasicMaterial
                    color={colorR.to(interpolateColor)}
                    transparent
                    opacity={swapPhase !== "idle" ? 0.9 : state === "comparing" ? 0.7 : 0.4}
                    linewidth={2}
                />
            </animated.lineSegments>

            {/* ===== TOP CAP WITH BLOOM GLOW ===== */}
            <animated.mesh
                position-x={slideOffset}
                position-y={liftOffset.to(l => targetHeight + 0.03 + l + (arcOffset as unknown as { get: () => number }).get())}
                scale-x={swapPhase !== "idle" ? swapScale : baseScale}
                scale-z={swapPhase !== "idle" ? swapScale : baseScale}
            >
                <RoundedBox 
                    args={[barWidth + 0.1, 0.06, barDepth + 0.1]} 
                    radius={0.02} 
                    smoothness={2}
                >
                    <animated.meshStandardMaterial
                        color="#ffffff"
                        emissive={colorR.to(interpolateColor)}
                        emissiveIntensity={glowIntensity}
                        transparent
                        opacity={0.85}
                        metalness={0.9}
                        roughness={0.05}
                    />
                </RoundedBox>
            </animated.mesh>

            {/* ===== INNER GLOW VOLUME ===== */}
            <animated.mesh 
                position-x={slideOffset}
                position-y={liftOffset.to(l => baseY + l + (arcOffset as unknown as { get: () => number }).get())}
            >
                <sphereGeometry args={[barWidth * 0.25, 12, 12]} />
                <animated.meshBasicMaterial
                    color={colorR.to(interpolateColor)}
                    transparent
                    opacity={swapPhase !== "idle" ? 0.35 : 0.12}
                />
            </animated.mesh>

            {/* ===== BASE REFLECTION ===== */}
            <animated.mesh
                position={[0, 0.003, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale-x={swapPhase !== "idle" ? swapScale : baseScale}
                scale-z={swapPhase !== "idle" ? swapScale : baseScale}
                receiveShadow
            >
                <planeGeometry args={[barWidth * 1.3, barDepth * 1.3]} />
                <animated.meshStandardMaterial
                    color={colorR.to(interpolateColor)}
                    transparent
                    opacity={0.2}
                    metalness={1}
                    roughness={0.2}
                />
            </animated.mesh>

            {/* ===== GROUND GLOW RING ===== */}
            <animated.mesh
                position={[0, 0.008, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                scale={swapPhase !== "idle" ? swapScale : baseScale}
            >
                <ringGeometry args={[barWidth * 0.35, barWidth * 0.65, 32]} />
                <animated.meshBasicMaterial
                    color={colorR.to(interpolateColor)}
                    transparent
                    opacity={swapPhase !== "idle" ? 0.5 : state === "comparing" ? 0.3 : 0.15}
                    side={THREE.DoubleSide}
                />
            </animated.mesh>

            {/* ===== SWAP MOTION TRAIL ===== */}
            {swapPhase === "slide" && (
                <SwapTrail 
                    barWidth={barWidth} 
                    color={STATE_COLORS.swapping}
                    direction={swapDistance > 0 ? 1 : -1}
                />
            )}

            {/* ===== PULSE RING (Active states) ===== */}
            {(state === "comparing" || swapPhase !== "idle") && (
                <PulseRing 
                    barWidth={barWidth} 
                    color={STATE_COLORS[state]} 
                    intensity={swapPhase !== "idle" ? 2 : 1}
                />
            )}
        </group>
    );
}

// ============================================
// SWAP TRAIL EFFECT
// ============================================

function SwapTrail({ 
    barWidth, 
    color,
    direction,
}: { 
    barWidth: number; 
    color: string;
    direction: 1 | -1;
}) {
    const trailRef = useRef<THREE.Mesh>(null);
    
    useFrame((clock) => {
        if (trailRef.current) {
            const time = clock.clock.getElapsedTime();
            trailRef.current.scale.x = 0.5 + Math.sin(time * 20) * 0.3;
            trailRef.current.material.opacity = 0.3 + Math.sin(time * 15) * 0.2;
        }
    });

    return (
        <mesh
            ref={trailRef}
            position={[direction * -barWidth * 0.8, 0.5, 0]}
            rotation={[0, 0, direction * Math.PI / 2]}
        >
            <planeGeometry args={[0.3, barWidth * 2]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}

// ============================================
// PULSE RING EFFECT
// ============================================

function PulseRing({ 
    barWidth, 
    color, 
    intensity = 1 
}: { 
    barWidth: number; 
    color: string;
    intensity?: number;
}) {
    const { scale, opacity } = useSpring({
        from: { scale: 1, opacity: 0.5 * intensity },
        to: { scale: 2.5, opacity: 0 },
        config: { duration: 600 },
        loop: true,
    });

    return (
        <animated.mesh
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={scale}
        >
            <ringGeometry args={[barWidth * 0.5, barWidth * 0.6, 32]} />
            <animated.meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
            />
        </animated.mesh>
    );
}
