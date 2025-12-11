"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    PerspectiveCamera,
} from "@react-three/drei";
import {
    EffectComposer,
    Bloom,
    Vignette,
} from "@react-three/postprocessing";
import { ArrayBar } from "./ArrayBar";
import { useVisualizationStore } from "@/stores/visualizationStore";
import * as THREE from "three";

// ============================================
// ARRAY VISUALIZATION - 3D BARS (UNCHANGED)
// ============================================

function ArrayVisualization() {
    const { array } = useVisualizationStore();
    const maxValue = Math.max(...array.map(el => el.value), 100);

    return (
        <group position={[0, 0, 0]}>
            {array.map((element, index) => (
                <ArrayBar
                    key={index}
                    value={element.value}
                    index={index}
                    totalBars={array.length}
                    state={element.state}
                    maxValue={maxValue}
                    swapTargetIndex={element.swapTargetIndex}
                    swapPhase={element.swapPhase}
                />
            ))}
        </group>
    );
}

// ============================================
// MINIMAL POST-PROCESSING
// Just bloom and vignette for polish
// ============================================

function PostProcessing() {
    return (
        <EffectComposer multisampling={4}>
            {/* Bloom for neon glow on bars */}
            <Bloom
                intensity={0.8}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
                radius={0.6}
            />
            {/* Vignette for focus */}
            <Vignette
                eskil={false}
                offset={0.15}
                darkness={0.5}
            />
        </EffectComposer>
    );
}

// ============================================
// SIMPLE GROUND PLANE (Optional - subtle)
// ============================================

function GroundPlane() {
    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
            receiveShadow
        >
            <planeGeometry args={[60, 60]} />
            <meshStandardMaterial
                color="#0a0a15"
                transparent
                opacity={0.8}
                metalness={0.1}
                roughness={0.9}
            />
        </mesh>
    );
}

// ============================================
// MAIN CLEAN SCENE
// No particles, orbs, grids - just bars + controls
// ============================================

function Scene() {
    return (
        <>
            {/* Camera */}
            <PerspectiveCamera
                makeDefault
                position={[0, 12, 22]}
                fov={42}
            />

            {/* ========== LIGHTING ========== */}

            {/* Ambient light - soft overall illumination */}
            <ambientLight intensity={0.3} color="#a78bfa" />

            {/* Main directional light - from top-right */}
            <directionalLight
                position={[8, 20, 10]}
                intensity={0.8}
                color="#e9d5ff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />

            {/* Fill light from left - cyan tint */}
            <directionalLight
                position={[-15, 8, 5]}
                intensity={0.3}
                color="#22d3ee"
            />

            {/* Purple accent light */}
            <pointLight
                position={[10, 5, 0]}
                intensity={0.6}
                color="#8b5cf6"
                distance={25}
                decay={2}
            />

            {/* Cyan accent light */}
            <pointLight
                position={[-10, 4, 3]}
                intensity={0.4}
                color="#06b6d4"
                distance={25}
                decay={2}
            />

            {/* ========== SCENE ELEMENTS ========== */}

            {/* Optional subtle ground */}
            <GroundPlane />

            {/* Array visualization - THE BARS */}
            <ArrayVisualization />

            {/* Post-processing */}
            <PostProcessing />

            {/* ========== ORBIT CONTROLS ========== */}
            {/* User can rotate, zoom, and pan the view */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={8}
                maxDistance={50}
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI / 2}
                autoRotate={false}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.8}
                zoomSpeed={1.0}
                panSpeed={0.8}
                target={[0, 3, 0]}
            />
        </>
    );
}

// ============================================
// MAIN SORTING SCENE COMPONENT
// Clean dark gradient background
// ============================================

export function SortingScene() {
    const { generateNewArray, array } = useVisualizationStore();

    useEffect(() => {
        if (array.length === 0) {
            generateNewArray();
        }
    }, [generateNewArray, array.length]);

    return (
        <div
            className="w-full h-full"
            style={{
                // Clean dark gradient background - no visual noise
                background: "linear-gradient(180deg, #0a0a1a 0%, #05050f 50%, #000005 100%)"
            }}
        >
            <Canvas
                shadows="soft"
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance",
                    stencil: false,
                }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    {/* Set scene background color */}
                    <color attach="background" args={["#0a0a1a"]} />
                    <fog attach="fog" args={["#0a0a1a", 30, 80]} />
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}
