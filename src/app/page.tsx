"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  BotMessageSquare,
  Play,
  Code2,
  Sparkles,
  Zap,
  ArrowRight,
  Database,
  GitBranch,
  TreePine,
  Network,
  ChevronRight,
  BookOpen,
  Cpu,
  Layers,
  TrendingUp,
  Hash,
  ListOrdered,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <Navbar />

      {/* Main Content Container - offset for fixed navbar */}
      <main className="relative" style={{ paddingTop: "80px" }}>

        {/* Animated Background - Simplified */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-[80px]" />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              {/* Badge */}
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs sm:text-sm mb-6"
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Interactive Learning Platform</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] sm:text-xs">v2.0</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
              >
                <span className="text-white">Master </span>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Data Structures
                </span>
                <br className="sm:hidden" />
                <span className="text-white"> & </span>
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Algorithms
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeInUp}
                className="text-sm sm:text-base md:text-lg text-slate-400 max-w-xl mx-auto mb-6 sm:mb-8 px-4"
              >
                Visualize, learn, and master algorithms with stunning 3D animations,
                AI-powered explanations, and interactive challenges.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
              >
                <Link
                  href="/visualizer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
                >
                  <Play className="w-4 h-4" />
                  Start Visualizing
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/ai-tutor"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/60 border border-slate-700 text-white font-semibold text-sm sm:text-base hover:bg-slate-800 transition-colors"
                >
                  <BotMessageSquare className="w-4 h-4" />
                  Try AI Tutor
                </Link>
              </motion.div>
            </motion.div>

            {/* Hero Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 sm:mt-14 max-w-4xl mx-auto"
            >
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 bg-slate-900/80 shadow-2xl">
                {/* Preview Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-400">Live Preview</span>
                  </div>
                  <span className="text-xs text-purple-400">Quick Sort • O(n log n)</span>
                </div>

                {/* Animated Bars */}
                <div className="p-6 sm:p-8 flex items-end justify-center gap-1 sm:gap-2 h-40 sm:h-52 bg-gradient-to-b from-slate-900 to-slate-800">
                  {[40, 75, 30, 85, 55, 20, 65, 90, 35, 70, 50, 45, 80, 25, 60].map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-3 sm:w-5 md:w-7 rounded-t"
                      style={{
                        background: `linear-gradient(to top, ${i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#06b6d4" : "#f43f5e"
                          }, ${i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#22d3ee" : "#fb7185"
                          })`,
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { value: "15+", label: "Algorithms", icon: Code2 },
                { value: "8+", label: "Data Structures", icon: Database },
                { value: "3D", label: "Visualizations", icon: Layers },
                { value: "AI", label: "Powered Tutor", icon: Cpu },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 sm:p-5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-center hover:border-purple-500/30 transition-colors"
                >
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-purple-400" />
                  <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
                Powerful <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Features</span>
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 max-w-lg mx-auto">
                Everything you need to master data structures and algorithms
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[
                {
                  icon: BarChart3,
                  title: "3D Visualizations",
                  description: "Watch algorithms come to life with stunning 3D animations.",
                  color: "from-purple-500 to-violet-500",
                },
                {
                  icon: BotMessageSquare,
                  title: "AI Tutor",
                  description: "Get personalized explanations and interactive quizzes.",
                  color: "from-cyan-500 to-blue-500",
                },
                {
                  icon: Code2,
                  title: "Code Runner",
                  description: "Write and test your own sorting algorithms.",
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  icon: Zap,
                  title: "Step-by-Step",
                  description: "Control playback and understand every operation.",
                  color: "from-amber-500 to-orange-500",
                },
                {
                  icon: TrendingUp,
                  title: "Live Statistics",
                  description: "Track comparisons, swaps, and metrics in real-time.",
                  color: "from-rose-500 to-pink-500",
                },
                {
                  icon: BookOpen,
                  title: "Pseudocode Sync",
                  description: "See code highlighted in sync with the visualization.",
                  color: "from-indigo-500 to-purple-500",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 sm:p-5 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-purple-500/30 transition-all hover:-translate-y-1"
                >
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                    <feature.icon className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-1.5">{feature.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Data Structures & Algorithms Section */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Data Structures Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-5 sm:p-6 rounded-xl bg-slate-800/50 border border-purple-500/20"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Data Structures</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400">Fundamental building blocks</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { name: "Arrays", icon: Layers },
                    { name: "Linked Lists", icon: GitBranch },
                    { name: "Trees", icon: TreePine },
                    { name: "Graphs", icon: Network },
                    { name: "Stacks & Queues", icon: ListOrdered },
                    { name: "Hash Tables", icon: Hash },
                  ].map((ds, i) => (
                    <Link
                      key={i}
                      href={`/visualizer?ds=${ds.name.toLowerCase().replace(/\s|&/g, "")}`}
                      className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-slate-900/50 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-all group"
                    >
                      <ds.icon className="w-4 h-4 text-purple-400" />
                      <span className="text-xs sm:text-sm text-white group-hover:text-purple-300">{ds.name}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600 ml-auto group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Algorithms Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-5 sm:p-6 rounded-xl bg-slate-800/50 border border-cyan-500/20"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">Algorithms</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400">Sorting, searching & more</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {[
                    { name: "Bubble Sort", complexity: "O(n²)" },
                    { name: "Quick Sort", complexity: "O(n log n)" },
                    { name: "Merge Sort", complexity: "O(n log n)" },
                    { name: "Binary Search", complexity: "O(log n)" },
                    { name: "Selection Sort", complexity: "O(n²)" },
                    { name: "Insertion Sort", complexity: "O(n²)" },
                  ].map((algo, i) => (
                    <Link
                      key={i}
                      href={`/visualizer?algo=${algo.name.toLowerCase().replace(" ", "")}`}
                      className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-slate-900/50 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all group"
                    >
                      <span className="text-xs sm:text-sm text-white group-hover:text-cyan-300">{algo.name}</span>
                      <span className="text-[9px] sm:text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{algo.complexity}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 sm:p-10 rounded-2xl bg-gradient-to-br from-purple-600/20 via-slate-800/60 to-cyan-600/20 border border-purple-500/20"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                Ready to <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">Learn</span>?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-5 sm:mb-6 max-w-md mx-auto">
                Start your journey to mastering data structures and algorithms with our interactive visualizations.
              </p>
              <Link
                href="/visualizer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
              >
                <Play className="w-4 h-4" />
                Start Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-8 sm:py-10 px-4 sm:px-6 border-t border-slate-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">DSA Visualizer</span>
                  <span className="text-purple-400 text-xs ml-1">Pro</span>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-500">
                <Link href="/visualizer" className="hover:text-purple-400 transition-colors">Visualizer</Link>
                <Link href="/ai-tutor" className="hover:text-purple-400 transition-colors">AI Tutor</Link>
                <Link href="/about" className="hover:text-purple-400 transition-colors">About</Link>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500">
                © 2024 DSA Visualizer Pro
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
