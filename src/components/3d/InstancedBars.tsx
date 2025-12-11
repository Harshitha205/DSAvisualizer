"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useVisualizationStore, ElementState } from "@/stores/visualizationStore";

// ============================================
// CONFIGURATION
// ============================================

const MAX_INSTANCES = 500;  // Maximum number of bars supported

// State colors mapped to RGB values for GPU
const STATE_COLORS: Record<ElementState, THREE.Color> = {
    default: new THREE.Color(0x8b5cf6),   // Purple
    comparing: new THREE.Color(0xf59e0b), // Amber
    swapping: new THREE.Color(0xf43f5e),  // Rose
    sorted: new THREE.Color(0x10b981),    // Emerald
    pivot: new THREE.Color(0x06b6d4),     // Cyan
};

// Emissive intensity per state
const STATE_EMISSIVE: Record<ElementState, number> = {
    default: 0.3,
    comparing: 0.8,
    swapping: 0.9,
    sorted: 0.5,
    pivot: 0.7,
};

// ============================================
// INSTANCED BAR RENDERER
// High-performance rendering using THREE.InstancedMesh
// ============================================

interface InstancedBarsProps {
    barWidth?: number;
    gapRatio?: number;
    maxHeight?: number;
}

export function InstancedBars({
    barWidth = 0.8,
    gapRatio = 0.2,
    maxHeight = 8,
}: InstancedBarsProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const glowMeshRef = useRef<THREE.InstancedMesh>(null);

    // Cache objects for matrix calculations (avoid GC)
    const tempObject = useMemo(() => new THREE.Object3D(), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Get array data from store with shallow comparison
    const array = useVisualizationStore(state => state.array);
    const maxValue = useMemo(() =>
        Math.max(...array.map(el => el.value), 100),
        [array]
    );

    // Create geometry once
    const geometry = useMemo(() => {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        // Translate so bottom is at y=0
        geo.translate(0, 0.5, 0);
        return geo;
    }, []);

    // Create materials once
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        metalness: 0.4,
        roughness: 0.3,
        envMapIntensity: 0.8,
    }), []);

    const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
    }), []);

    // Calculate bar spacing
    const totalWidth = useMemo(() => {
        const count = array.length;
        const spacing = barWidth * (1 + gapRatio);
        return count * spacing;
    }, [array.length, barWidth, gapRatio]);

    const startX = useMemo(() => -totalWidth / 2 + barWidth / 2, [totalWidth, barWidth]);

    // Update instance matrices and colors
    useFrame(() => {
        if (!meshRef.current || array.length === 0) return;

        const mesh = meshRef.current;
        const glowMesh = glowMeshRef.current;
        const spacing = barWidth * (1 + gapRatio);

        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            const height = (element.value / maxValue) * maxHeight;
            const x = startX + i * spacing;

            // Set position and scale
            tempObject.position.set(x, 0, 0);
            tempObject.scale.set(barWidth, height, barWidth);
            tempObject.updateMatrix();

            mesh.setMatrixAt(i, tempObject.matrix);

            // Set color based on state
            const color = STATE_COLORS[element.state] || STATE_COLORS.default;
            mesh.setColorAt(i, color);

            // Update glow mesh if exists
            if (glowMesh) {
                tempObject.scale.set(barWidth * 1.1, height * 1.05, barWidth * 1.1);
                tempObject.updateMatrix();
                glowMesh.setMatrixAt(i, tempObject.matrix);
                glowMesh.setColorAt(i, color);
            }
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

        if (glowMesh) {
            glowMesh.instanceMatrix.needsUpdate = true;
            if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;
        }

        // Update instance count
        mesh.count = array.length;
        if (glowMesh) glowMesh.count = array.length;
    });

    // Set initial count on mount
    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.count = array.length;
        }
        if (glowMeshRef.current) {
            glowMeshRef.current.count = array.length;
        }
    }, [array.length]);

    return (
        <group>
            {/* Main bars */}
            <instancedMesh
                ref={meshRef}
                args={[geometry, material, MAX_INSTANCES]}
                castShadow
                receiveShadow
            />

            {/* Glow effect bars */}
            <instancedMesh
                ref={glowMeshRef}
                args={[geometry, glowMaterial, MAX_INSTANCES]}
            />
        </group>
    );
}

// ============================================
// ENHANCED INSTANCED BARS WITH ANIMATION
// Supports smooth height transitions
// ============================================

interface AnimatedInstancedBarsProps extends InstancedBarsProps {
    animationSpeed?: number;
}

export function AnimatedInstancedBars({
    barWidth = 0.8,
    gapRatio = 0.2,
    maxHeight = 8,
    animationSpeed = 8,
}: AnimatedInstancedBarsProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const glowMeshRef = useRef<THREE.InstancedMesh>(null);

    // Animation state - stores current animated heights
    const animatedHeights = useRef<Float32Array>(new Float32Array(MAX_INSTANCES));
    const targetHeights = useRef<Float32Array>(new Float32Array(MAX_INSTANCES));
    const animatedY = useRef<Float32Array>(new Float32Array(MAX_INSTANCES)); // For swap animation

    const tempObject = useMemo(() => new THREE.Object3D(), []);

    const array = useVisualizationStore(state => state.array);
    const maxValue = useMemo(() =>
        Math.max(...array.map(el => el.value), 100),
        [array]
    );

    const geometry = useMemo(() => {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        geo.translate(0, 0.5, 0);
        return geo;
    }, []);

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        metalness: 0.5,
        roughness: 0.2,
        envMapIntensity: 1.0,
    }), []);

    const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
    }), []);

    const totalWidth = useMemo(() => {
        const count = array.length;
        const spacing = barWidth * (1 + gapRatio);
        return count * spacing;
    }, [array.length, barWidth, gapRatio]);

    const startX = useMemo(() => -totalWidth / 2 + barWidth / 2, [totalWidth, barWidth]);
    const spacing = barWidth * (1 + gapRatio);

    // Update target heights when array changes
    useEffect(() => {
        for (let i = 0; i < array.length; i++) {
            targetHeights.current[i] = (array[i].value / maxValue) * maxHeight;
        }
    }, [array, maxValue, maxHeight]);

    // Animation loop
    useFrame((_, delta) => {
        if (!meshRef.current || array.length === 0) return;

        const mesh = meshRef.current;
        const glowMesh = glowMeshRef.current;
        const lerpFactor = Math.min(1, delta * animationSpeed);

        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            const targetHeight = targetHeights.current[i];

            // Lerp height for smooth animation
            animatedHeights.current[i] = THREE.MathUtils.lerp(
                animatedHeights.current[i],
                targetHeight,
                lerpFactor
            );

            // Calculate Y offset for swap animation
            let yOffset = 0;
            if (element.swapPhase === "lift" || element.swapPhase === "slide") {
                yOffset = 1.5;
            }
            animatedY.current[i] = THREE.MathUtils.lerp(
                animatedY.current[i],
                yOffset,
                lerpFactor * 2
            );

            const x = startX + i * spacing;
            const height = animatedHeights.current[i];
            const y = animatedY.current[i];

            // Main bar
            tempObject.position.set(x, y, 0);
            tempObject.scale.set(barWidth, Math.max(0.1, height), barWidth);
            tempObject.updateMatrix();
            mesh.setMatrixAt(i, tempObject.matrix);

            // Color
            const color = STATE_COLORS[element.state] || STATE_COLORS.default;
            mesh.setColorAt(i, color);

            // Glow (slightly larger)
            if (glowMesh) {
                const glowScale = element.state === "comparing" || element.state === "swapping" ? 1.2 : 1.1;
                tempObject.scale.set(barWidth * glowScale, Math.max(0.1, height * 1.02), barWidth * glowScale);
                tempObject.updateMatrix();
                glowMesh.setMatrixAt(i, tempObject.matrix);
                glowMesh.setColorAt(i, color);
            }
        }

        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.count = array.length;

        if (glowMesh) {
            glowMesh.instanceMatrix.needsUpdate = true;
            if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;
            glowMesh.count = array.length;
        }
    });

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[geometry, material, MAX_INSTANCES]}
                castShadow
                receiveShadow
            />
            <instancedMesh
                ref={glowMeshRef}
                args={[geometry, glowMaterial, MAX_INSTANCES]}
            />
        </group>
    );
}

// ============================================
// ULTRA-PERFORMANCE INSTANCED BARS
// Minimal overhead, maximum FPS
// ============================================

export function UltraPerformanceInstancedBars() {
    const meshRef = useRef<THREE.InstancedMesh>(null);

    // Pre-allocate all matrices and colors
    const matrices = useMemo(() => {
        const arr = new Float32Array(MAX_INSTANCES * 16);
        // Initialize with identity matrices
        for (let i = 0; i < MAX_INSTANCES; i++) {
            const m = new THREE.Matrix4();
            m.toArray(arr, i * 16);
        }
        return arr;
    }, []);

    const colors = useMemo(() => {
        const arr = new Float32Array(MAX_INSTANCES * 3);
        const defaultColor = STATE_COLORS.default;
        for (let i = 0; i < MAX_INSTANCES; i++) {
            arr[i * 3] = defaultColor.r;
            arr[i * 3 + 1] = defaultColor.g;
            arr[i * 3 + 2] = defaultColor.b;
        }
        return arr;
    }, []);

    const array = useVisualizationStore(state => state.array);

    const geometry = useMemo(() => {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        geo.translate(0, 0.5, 0);
        return geo;
    }, []);

    const material = useMemo(() => new THREE.MeshStandardMaterial({
        metalness: 0.4,
        roughness: 0.3,
        vertexColors: true,
    }), []);

    // Direct matrix manipulation for maximum performance
    useFrame(() => {
        if (!meshRef.current || array.length === 0) return;

        const mesh = meshRef.current;
        const maxValue = Math.max(...array.map(el => el.value), 100);
        const barWidth = 0.8;
        const spacing = 1.0;
        const totalWidth = array.length * spacing;
        const startX = -totalWidth / 2 + barWidth / 2;
        const maxHeight = 8;

        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            const height = (element.value / maxValue) * maxHeight;
            const x = startX + i * spacing;

            // Direct matrix construction (faster than Object3D)
            const idx = i * 16;
            // Scale X
            matrices[idx + 0] = barWidth;
            matrices[idx + 1] = 0;
            matrices[idx + 2] = 0;
            matrices[idx + 3] = 0;
            // Scale Y
            matrices[idx + 4] = 0;
            matrices[idx + 5] = height;
            matrices[idx + 6] = 0;
            matrices[idx + 7] = 0;
            // Scale Z
            matrices[idx + 8] = 0;
            matrices[idx + 9] = 0;
            matrices[idx + 10] = barWidth;
            matrices[idx + 11] = 0;
            // Position
            matrices[idx + 12] = x;
            matrices[idx + 13] = 0;
            matrices[idx + 14] = 0;
            matrices[idx + 15] = 1;

            // Color
            const color = STATE_COLORS[element.state] || STATE_COLORS.default;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        // Update GPU buffers
        mesh.instanceMatrix.array.set(matrices);
        mesh.instanceMatrix.needsUpdate = true;

        if (mesh.instanceColor) {
            mesh.instanceColor.array.set(colors);
            mesh.instanceColor.needsUpdate = true;
        }

        mesh.count = array.length;
    });

    useEffect(() => {
        if (meshRef.current) {
            meshRef.current.count = array.length;
            // Enable per-instance colors
            meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(
                new Float32Array(MAX_INSTANCES * 3),
                3
            );
        }
    }, []);

    return (
        <instancedMesh
            ref={meshRef}
            args={[geometry, material, MAX_INSTANCES]}
            castShadow
        />
    );
}

// ============================================
// PERFORMANCE MONITOR HOC
// ============================================

interface PerformanceStats {
    fps: number;
    instanceCount: number;
    drawCalls: number;
}

export function usePerformanceStats(): PerformanceStats {
    const { gl } = useThree();
    const statsRef = useRef<PerformanceStats>({ fps: 60, instanceCount: 0, drawCalls: 0 });
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());

    useFrame(() => {
        frameCount.current++;
        const now = performance.now();
        const elapsed = now - lastTime.current;

        if (elapsed >= 1000) {
            statsRef.current.fps = Math.round((frameCount.current * 1000) / elapsed);
            statsRef.current.drawCalls = gl.info.render.calls;
            frameCount.current = 0;
            lastTime.current = now;
        }
    });

    return statsRef.current;
}
