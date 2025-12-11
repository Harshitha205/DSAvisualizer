"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BotMessageSquare,
    Send,
    User,
    Sparkles,
    Code,
    BookOpen,
    Lightbulb,
    Loader2,
    Zap,
    MessageCircle,
} from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    "What is the difference between BFS and DFS?",
    "Explain Quick Sort with an example",
    "How does a hash table work?",
    "What is dynamic programming?",
    "Explain Big O notation",
    "When should I use a linked list vs array?",
];

export default function AITutorPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: `👋 **Welcome to the AI DSA Tutor!**

I'm here to help you master Data Structures and Algorithms. Ask me anything about:

• **Sorting & Searching** algorithms
• **Trees, Graphs, & Linked Lists**
• **Dynamic Programming** techniques
• **Time & Space complexity** analysis
• **Problem-solving strategies**

What would you like to learn today?`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: generateMockResponse(input),
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen relative">
            {/* Background particles */}
            <div className="particles-bg">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            background: i % 2 === 0 ? "#8b5cf6" : "#06b6d4",
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4"
                    >
                        <BotMessageSquare className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-purple-300">AI-Powered Learning</span>
                    </motion.div>

                    <h1 className="text-4xl sm:text-5xl font-bold mb-3">
                        <span className="gradient-text">AI DSA Tutor</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto">
                        Get instant explanations, code examples, and personalized guidance
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chat Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <div className="card-cyber h-[600px] flex flex-col overflow-hidden">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                <AnimatePresence>
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                                }`}
                                        >
                                            {message.role === "assistant" && (
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 glow-purple">
                                                    <Sparkles className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-5 py-4 ${message.role === "user"
                                                        ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white"
                                                        : "glass-strong text-slate-200"
                                                    }`}
                                            >
                                                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                                                    {message.content}
                                                </div>
                                            </div>
                                            {message.role === "user" && (
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-slate-300" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center glow-purple">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="glass-strong rounded-2xl px-5 py-4 flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                                            <span className="text-slate-400">Thinking...</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-purple-500/10 p-5">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                                        placeholder="Ask me anything about DSA..."
                                        className="flex-1 glass-strong rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border-transparent"
                                    />
                                    <motion.button
                                        onClick={handleSend}
                                        disabled={isLoading || !input.trim()}
                                        className="btn-gradient px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Send className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        {/* Suggested Questions */}
                        <div className="card-cyber p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="w-5 h-5 text-yellow-400" />
                                <span className="font-medium text-white">Try These</span>
                            </div>
                            <div className="space-y-2">
                                {suggestedQuestions.map((question, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => setInput(question)}
                                        className="w-full text-left text-sm text-slate-400 hover:text-white glass rounded-lg px-4 py-3 transition-all hover:bg-purple-500/10 hover:border-purple-500/30"
                                        whileHover={{ x: 4 }}
                                    >
                                        <MessageCircle className="w-3 h-3 inline mr-2 opacity-50" />
                                        {question}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card-cyber p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-cyan-400" />
                                <span className="font-medium text-white">Quick Actions</span>
                            </div>
                            <div className="space-y-2">
                                <motion.button
                                    className="w-full btn-glass py-3 rounded-xl flex items-center justify-start gap-3 px-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <BookOpen className="w-4 h-4 text-purple-400" />
                                    <span>Generate Quiz</span>
                                </motion.button>
                                <motion.button
                                    className="w-full btn-glass py-3 rounded-xl flex items-center justify-start gap-3 px-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Code className="w-4 h-4 text-cyan-400" />
                                    <span>Explain Code</span>
                                </motion.button>
                                <motion.button
                                    className="w-full btn-glass py-3 rounded-xl flex items-center justify-start gap-3 px-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <Sparkles className="w-4 h-4 text-yellow-400" />
                                    <span>Practice Problems</span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Mock response generator
function generateMockResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes("bubble sort")) {
        return `**Bubble Sort** is a simple comparison-based sorting algorithm.

**How it works:**
1. Compare adjacent elements
2. Swap if they're in wrong order
3. Repeat until sorted

**Complexity:**
• Time: O(n²) worst/average, O(n) best
• Space: O(1)

\`\`\`javascript
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}
\`\`\`

Want me to explain any specific part?`;
    }

    if (lowerQuestion.includes("bfs") || lowerQuestion.includes("dfs")) {
        return `**BFS vs DFS** - Two fundamental graph traversal algorithms:

**BFS (Breadth-First Search)**
• Explores level by level
• Uses a **Queue** (FIFO)
• Best for: Shortest path, level-order traversal
• Time: O(V + E)

**DFS (Depth-First Search)**
• Goes deep first, then backtracks
• Uses a **Stack** (LIFO) or recursion
• Best for: Cycle detection, topological sort
• Time: O(V + E)

Would you like code examples for either?`;
    }

    if (lowerQuestion.includes("quick sort")) {
        return `**Quick Sort** is an efficient divide-and-conquer algorithm.

**How it works:**
1. Choose a **pivot** element
2. **Partition**: Move smaller elements left, larger right
3. **Recursively** sort both partitions

**Complexity:**
• Time: O(n log n) average, O(n²) worst
• Space: O(log n) for recursion stack

**Key insight:** The pivot selection strategy affects performance!

Want to see the implementation?`;
    }

    return `Great question about "${question}"! 

This is a fundamental concept in DSA. Here's my approach:

1. **Understand the basics** - Grasp the core idea first
2. **Practice implementation** - Code it yourself
3. **Analyze complexity** - Know the trade-offs
4. **Explore variations** - Learn related algorithms

Would you like:
• A detailed explanation?
• Code examples?
• Practice problems?

Feel free to ask follow-up questions!`;
}
