"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useVisualizationStore } from "@/stores/visualizationStore";
import { runAlgorithm } from "@/algorithms/sorting";
import {
  Play,
  Pause,
  RotateCcw,
  Shuffle,
  Zap,
  Activity,
  Sparkles,
  TrendingUp,
  Layers,
  Box,
  Timer,
  ArrowLeftRight,
  ChevronDown,
  Settings2,
  Gauge,
} from "lucide-react";

// ============================================
// SPACING SCALE: 4px / 8px / 12px / 16px / 20px / 24px
// Tailwind equivalents: p-1 / p-2 / p-3 / p-4 / p-5 / p-6
// ============================================

// Dynamic import for 3D scene (no SSR)
const SortingScene = dynamic(
  () => import("@/components/3d/SortingScene").then((mod) => mod.SortingScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-500/20 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 w-12 h-12 border-2 border-cyan-400/50 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <span className="text-purple-400 text-sm font-medium tracking-wide">Initializing 3D Engine...</span>
        </div>
      </div>
    ),
  }
);

type AlgorithmType = "bubble" | "selection" | "insertion" | "quick";
type DataStructureType = "array" | "linkedlist" | "tree" | "graph" | "hashtable" | "stack" | null;

const algorithms: { id: AlgorithmType; name: string; complexity: string; icon: string; color: string; description: string }[] = [
  { id: "bubble", name: "Bubble Sort", complexity: "O(n²)", icon: "🫧", color: "from-purple-500 to-pink-500", description: "Compares adjacent elements and swaps them if in wrong order" },
  { id: "selection", name: "Selection Sort", complexity: "O(n²)", icon: "🎯", color: "from-blue-500 to-cyan-500", description: "Finds minimum element and places it at beginning" },
  { id: "insertion", name: "Insertion Sort", complexity: "O(n²)", icon: "📥", color: "from-green-500 to-emerald-500", description: "Builds sorted array one element at a time" },
  { id: "quick", name: "Quick Sort", complexity: "O(n log n)", icon: "⚡", color: "from-orange-500 to-yellow-500", description: "Divide and conquer using pivot element" },
];

const dataStructures: { id: DataStructureType; name: string; icon: string; color: string; description: string }[] = [
  { id: "array", name: "Array", icon: "📊", color: "from-purple-500 to-violet-500", description: "Linear data structure with indexed elements" },
  { id: "linkedlist", name: "Linked List", icon: "🔗", color: "from-cyan-500 to-blue-500", description: "Node-based structure with dynamic size" },
  { id: "tree", name: "Tree", icon: "🌲", color: "from-green-500 to-emerald-500", description: "Hierarchical structure with parent-child relationships" },
  { id: "graph", name: "Graph", icon: "🕸️", color: "from-pink-500 to-rose-500", description: "Network of nodes connected by edges" },
  { id: "hashtable", name: "Hash Table", icon: "#️⃣", color: "from-amber-500 to-orange-500", description: "Key-value pairs with O(1) average lookup" },
  { id: "stack", name: "Stack & Queue", icon: "📚", color: "from-indigo-500 to-purple-500", description: "LIFO/FIFO structures for ordered processing" },
];

const stateColors: Record<string, string> = {
  default: "bar-default",
  comparing: "bar-comparing",
  swapping: "bar-swapping",
  sorted: "bar-sorted",
  pivot: "bar-pivot",
};

// ============================================
// BACKGROUND COMPONENTS
// ============================================

function ParticlesBackground() {
  return (
    <div className="particles-bg">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            background: i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#06b6d4" : "#ec4899",
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            opacity: 0.4 + Math.random() * 0.3,
          }}
        />
      ))}
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a0e27]/50" />
    </div>
  );
}

// ============================================
// 2D VISUALIZATION
// ============================================

function SortingVisualization2D() {
  const { array } = useVisualizationStore();
  const maxValue = Math.max(...array.map((el) => el.value), 100);

  return (
    <div className="w-full h-full flex items-end justify-center gap-[2px] sm:gap-1 p-6 relative overflow-hidden">
      {/* Horizontal grid lines */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
            style={{ bottom: `${(i + 1) * 12}%` }}
          />
        ))}
      </div>

      {array.map((element, index) => (
        <motion.div
          key={index}
          className={`${stateColors[element.state]} rounded-t-lg relative group cursor-pointer`}
          style={{
            width: `${Math.max(100 / array.length - 0.5, 2)}%`,
            minWidth: "4px",
          }}
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: `${(element.value / maxValue) * 80}%`,
            opacity: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            delay: index * 0.008,
          }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Top glow */}
          <div className="absolute -top-1 left-0 right-0 h-4 bg-gradient-to-t from-transparent to-white/20 rounded-t-lg blur-sm" />

          {/* Hover tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-slate-900/95 backdrop-blur-sm border border-purple-500/20 text-xs text-white font-mono opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg shadow-purple-500/10">
            {element.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// SECTION HEADER COMPONENT (Visual Hierarchy)
// ============================================

function SectionHeader({ icon: Icon, title, iconColor = "text-purple-400", iconBg = "bg-purple-500/10" }: {
  icon: React.ElementType;
  title: string;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 rounded-xl ${iconBg} transition-all duration-300 group-hover:scale-110`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <h3 className="text-sm font-semibold text-white tracking-wide uppercase">{title}</h3>
    </div>
  );
}

// ============================================
// ALGORITHM DROPDOWN SELECTOR
// ============================================

function AlgorithmSelector({
  currentAlgorithm,
  onSelect,
  disabled
}: {
  currentAlgorithm: AlgorithmType;
  onSelect: (algo: AlgorithmType) => void;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentAlgo = algorithms.find(a => a.id === currentAlgorithm);

  return (
    <div className="relative">
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        style={{
          background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
        whileHover={!disabled ? {
          scale: 1.01,
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
        } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl drop-shadow-lg">{currentAlgo?.icon}</span>
          <div className="text-left">
            <div className="font-semibold text-white text-base">{currentAlgo?.name}</div>
            <div className="text-xs text-purple-300/70 font-mono mt-0.5">{currentAlgo?.complexity}</div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(10, 14, 39, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.1)',
            }}
          >
            {algorithms.map((algo, index) => (
              <motion.button
                key={algo.id}
                onClick={() => {
                  onSelect(algo.id);
                  setIsOpen(false);
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`w-full p-3 flex items-center gap-3 transition-all duration-200 hover:bg-purple-500/15 ${currentAlgorithm === algo.id ? 'bg-purple-500/10' : ''
                  }`}
              >
                <span className="text-2xl">{algo.icon}</span>
                <div className="text-left flex-1">
                  <div className="font-medium text-white text-sm">{algo.name}</div>
                  <div className="text-xs text-slate-500">{algo.description}</div>
                </div>
                <span className="text-xs text-cyan-400/80 font-mono bg-cyan-500/10 px-2 py-1 rounded-lg">{algo.complexity}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// STATS CARD COMPONENT
// ============================================

function StatsCard({
  icon: Icon,
  label,
  value,
  color,
  gradient
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  gradient: string;
}) {
  return (
    <motion.div
      className="relative p-4 rounded-2xl overflow-hidden group"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.03)'
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Background gradient accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300`} />

      {/* Neon line accent */}
      <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${gradient} opacity-20`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${color} opacity-80`} />
          <motion.span
            key={value}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`text-2xl font-bold ${color} tabular-nums`}
          >
            {value.toLocaleString()}
          </motion.span>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

// ============================================
// CUSTOM SLIDER COMPONENT
// ============================================

function CustomSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  disabled,
  unit,
  icon: Icon
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  disabled: boolean;
  unit: string;
  icon: React.ElementType;
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-purple-400/70" />
          <span className="text-xs text-slate-400 font-medium tracking-wide">{label}</span>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: '#a78bfa',
          }}
        >
          {value}{unit}
        </div>
      </div>

      {/* Custom slider track */}
      <div className="relative h-2 rounded-full bg-slate-800/60 overflow-hidden group cursor-pointer">
        {/* Filled track with glow */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
          style={{ width: `${percentage}%` }}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />
        {/* Glow effect */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500/50 to-cyan-400/50 rounded-full blur-sm opacity-50"
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-purple-500/30 border-2 border-purple-400 group-hover:scale-110 transition-transform"
          style={{ left: `calc(${percentage}% - 8px)` }}
          animate={{ left: `calc(${percentage}% - 8px)` }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

// ============================================
// VIEW MODE TOGGLE
// ============================================

function ViewModeToggle({ mode, onModeChange }: { mode: "2d" | "3d"; onModeChange: (mode: "2d" | "3d") => void }) {
  return (
    <div
      className="inline-flex items-center gap-1 p-1.5 rounded-2xl"
      style={{
        background: 'rgba(15, 23, 41, 0.6)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {[
        { id: "2d" as const, icon: Layers, label: "2D View" },
        { id: "3d" as const, icon: Box, label: "3D View" },
      ].map((item) => (
        <motion.button
          key={item.id}
          onClick={() => onModeChange(item.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${mode === item.id
            ? "text-white"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          style={mode === item.id ? {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3), 0 0 30px rgba(139, 92, 246, 0.1)',
          } : {}}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({ isRunning, isPaused, isSorted }: { isRunning: boolean; isPaused: boolean; isSorted: boolean }) {
  const status = isRunning && !isPaused ? 'running' : isPaused ? 'paused' : isSorted ? 'sorted' : 'ready';

  const config = {
    running: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'Running' },
    paused: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', dot: 'bg-amber-400', text: 'text-amber-300', label: 'Paused' },
    sorted: { bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', dot: 'bg-cyan-400', text: 'text-cyan-300', label: 'Sorted!' },
    ready: { bg: 'bg-purple-500/15', border: 'border-purple-500/30', dot: 'bg-purple-400', text: 'text-purple-300', label: 'Ready' },
  };

  const { bg, border, dot, text, label } = config[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl ${bg} border ${border}`}
      style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)' }}
    >
      <div className={`w-2 h-2 rounded-full ${dot} ${status === 'running' ? 'animate-pulse' : ''}`} />
      <span className={`text-xs font-semibold tracking-wide ${text}`}>{label}</span>
    </motion.div>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function Home() {
  const {
    array,
    arraySize,
    speed,
    mode,
    currentAlgorithm,
    isRunning,
    isPaused,
    isSorted,
    comparisons,
    swaps,
    setArraySize,
    setSpeed,
    setAlgorithm,
    setIsRunning,
    setIsPaused,
    setMode,
    generateNewArray,
    resetArray,
  } = useVisualizationStore();

  const [mounted, setMounted] = useState(false);
  const [selectedDS, setSelectedDS] = useState<DataStructureType>(null);
  const searchParams = useSearchParams();

  // Handle URL parameters for algorithm/data structure selection
  useEffect(() => {
    const algoParam = searchParams.get('algo');
    const dsParam = searchParams.get('ds');

    // Handle algorithm selection
    if (algoParam) {
      const algoMap: Record<string, AlgorithmType> = {
        'bubble': 'bubble',
        'bubblesort': 'bubble',
        'quick': 'quick',
        'quicksort': 'quick',
        'selection': 'selection',
        'selectionsort': 'selection',
        'insertion': 'insertion',
        'insertionsort': 'insertion',
        'merge': 'bubble',
        'mergesort': 'bubble',
        'binarysearch': 'quick',
      };

      const mappedAlgo = algoMap[algoParam.toLowerCase()];
      if (mappedAlgo && mappedAlgo !== currentAlgorithm) {
        setAlgorithm(mappedAlgo);
        setSelectedDS(null); // Clear DS when algo is selected
      }
    }

    // Handle data structure selection
    if (dsParam) {
      const dsMap: Record<string, DataStructureType> = {
        'array': 'array',
        'linkedlist': 'linkedlist',
        'tree': 'tree',
        'graph': 'graph',
        'hashtable': 'hashtable',
        'stack': 'stack',
        'stacksqueues': 'stack',
        'queue': 'stack',
      };

      const mappedDS = dsMap[dsParam.toLowerCase()];
      if (mappedDS) {
        setSelectedDS(mappedDS);
      }
    }
  }, [searchParams, setAlgorithm, currentAlgorithm]);

  useEffect(() => {
    setMounted(true);
    if (array.length === 0) {
      generateNewArray();
    }
  }, [generateNewArray, array.length]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      runAlgorithm(currentAlgorithm);
    }
  }, [isRunning, currentAlgorithm, isPaused]);

  const handlePlayPause = () => {
    if (isRunning) {
      setIsPaused(!isPaused);
    } else {
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    resetArray();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticlesBackground />
      <GridBackground />

      {/* Main Layout Container - Using consistent spacing */}
      <div className="relative z-10 h-[calc(100vh-64px)] flex flex-col lg:flex-row gap-4 p-4">

        {/* ==========================================
            LEFT SIDE - 3D CANVAS AREA (Primary Focus)
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Main Visualization Canvas */}
          <div
            className="flex-1 rounded-3xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.04) 0%, rgba(6, 182, 212, 0.02) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              boxShadow: `
                0 0 80px rgba(139, 92, 246, 0.08),
                0 20px 60px rgba(0, 0, 0, 0.3),
                inset 0 0 100px rgba(0, 0, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.03)
              `,
            }}
          >
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-purple-500/25 rounded-tl-3xl" />
            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-cyan-500/25 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-cyan-500/25 rounded-bl-3xl" />
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-purple-500/25 rounded-br-3xl" />

            {/* Current Selection Header - Shows Algorithm OR Data Structure */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              {/* Status Badge */}
              <StatusBadge isRunning={isRunning} isPaused={isPaused} isSorted={isSorted} />

              {/* Algorithm/Data Structure Info Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 px-5 py-3 rounded-2xl backdrop-blur-xl"
                style={{
                  background: 'rgba(10, 14, 39, 0.9)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
                }}
              >
                {/* Icon */}
                <div className="text-3xl">
                  {selectedDS
                    ? dataStructures.find(ds => ds.id === selectedDS)?.icon
                    : algorithms.find(a => a.id === currentAlgorithm)?.icon}
                </div>

                {/* Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">
                      {selectedDS
                        ? dataStructures.find(ds => ds.id === selectedDS)?.name
                        : algorithms.find(a => a.id === currentAlgorithm)?.name}
                    </span>
                    {!selectedDS && (
                      <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {algorithms.find(a => a.id === currentAlgorithm)?.complexity}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 max-w-xs">
                    {selectedDS
                      ? dataStructures.find(ds => ds.id === selectedDS)?.description
                      : algorithms.find(a => a.id === currentAlgorithm)?.description}
                  </span>
                </div>

                {/* Type indicator */}
                <div className="ml-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {selectedDS ? '📦 Data Structure' : '⚙️ Algorithm'}
                </div>
              </motion.div>
            </div>

            {/* Canvas Content */}
            <div className="w-full h-full pt-20">
              {mode === "3d" ? <SortingScene /> : <SortingVisualization2D />}
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none bg-gradient-to-t from-[#0a0e27] via-[#0a0e27]/50 to-transparent" />
          </div>

          {/* Bottom View Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-4 flex justify-center"
          >
            <ViewModeToggle mode={mode} onModeChange={setMode} />
          </motion.div>
        </motion.div>

        {/* ==========================================
            RIGHT SIDE - CONTROL PANEL (Secondary)
            Spacing: 4 (gap-4), 5 (p-5), 6 (p-6)
            ========================================== */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
          className="w-full lg:w-[380px] flex flex-col gap-4 overflow-y-auto scrollbar-thin pr-1"
        >
          {/* Algorithm Selector Card */}
          <div
            className="p-5 rounded-3xl group"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.12)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <SectionHeader icon={Sparkles} title="Algorithm" iconColor="text-purple-400" iconBg="bg-purple-500/10" />
            <AlgorithmSelector
              currentAlgorithm={currentAlgorithm}
              onSelect={setAlgorithm}
              disabled={isRunning}
            />
          </div>

          {/* Playback Controls Card */}
          <div
            className="p-5 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.12)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <SectionHeader icon={Zap} title="Controls" iconColor="text-cyan-400" iconBg="bg-cyan-500/10" />

            {/* Main Play Button */}
            <motion.button
              onClick={handlePlayPause}
              disabled={isSorted}
              className="w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35), 0 0 40px rgba(139, 92, 246, 0.1)',
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 30px rgba(139, 92, 246, 0.45), 0 0 60px rgba(139, 92, 246, 0.2)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <span className="relative z-10 flex items-center gap-3">
                {isRunning && !isPaused ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {isPaused ? "Resume" : "Start Visualization"}
                  </>
                )}
              </span>
            </motion.button>

            {/* Secondary Buttons - 12px gap (gap-3) */}
            <div className="flex gap-3 mt-4">
              {[
                { onClick: handleReset, icon: RotateCcw, label: "Reset", iconColor: "text-purple-400", disabled: false },
                { onClick: () => !isRunning && generateNewArray(), icon: Shuffle, label: "New Array", iconColor: "text-cyan-400", disabled: isRunning },
              ].map((btn, i) => (
                <motion.button
                  key={i}
                  onClick={btn.onClick}
                  disabled={btn.disabled}
                  className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-medium disabled:opacity-40 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  whileHover={{
                    scale: 1.02,
                    background: 'rgba(139, 92, 246, 0.15)',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.1)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <btn.icon className={`w-4 h-4 ${btn.iconColor}`} />
                  <span className="text-sm text-slate-300">{btn.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Settings Card */}
          <div
            className="p-5 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.12)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <SectionHeader icon={Settings2} title="Settings" iconColor="text-pink-400" iconBg="bg-pink-500/10" />

            {/* Sliders with 24px spacing (space-y-6) */}
            <div className="space-y-6">
              <CustomSlider
                label="Array Size"
                value={arraySize}
                min={5}
                max={50}
                onChange={(val) => !isRunning && setArraySize(val)}
                disabled={isRunning}
                unit=""
                icon={Layers}
              />
              <CustomSlider
                label="Animation Speed"
                value={speed}
                min={10}
                max={1000}
                step={10}
                onChange={setSpeed}
                disabled={false}
                unit="ms"
                icon={Gauge}
              />
            </div>
          </div>

          {/* Statistics Card */}
          <div
            className="p-5 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.12)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <SectionHeader icon={TrendingUp} title="Statistics" iconColor="text-emerald-400" iconBg="bg-emerald-500/10" />

            {/* Stats Grid - 12px gap (gap-3) */}
            <div className="grid grid-cols-2 gap-3">
              <StatsCard
                icon={Activity}
                label="Comparisons"
                value={comparisons}
                color="text-amber-400"
                gradient="from-amber-500 to-orange-500"
              />
              <StatsCard
                icon={ArrowLeftRight}
                label="Swaps"
                value={swaps}
                color="text-rose-400"
                gradient="from-rose-500 to-pink-500"
              />
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {isSorted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  className="mt-4 text-center py-4 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <span className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Array Sorted Successfully!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend Card */}
          <div
            className="p-5 rounded-3xl"
            style={{
              background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.12)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            <h3 className="text-xs font-semibold text-white tracking-wide uppercase mb-4">Color Legend</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Default', color: 'from-purple-500 to-purple-700' },
                { label: 'Comparing', color: 'from-amber-400 to-amber-600' },
                { label: 'Swapping', color: 'from-rose-400 to-rose-600' },
                { label: 'Sorted', color: 'from-emerald-400 to-emerald-600' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-md bg-gradient-to-br ${item.color}`}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                  />
                  <span className="text-xs text-slate-400 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
