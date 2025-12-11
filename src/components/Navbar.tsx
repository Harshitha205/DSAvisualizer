"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    BarChart3,
    BotMessageSquare,
    Sparkles,
    Database,
    GitBranch,
    Settings,
    User,
    ChevronDown,
    Menu,
    X,
    Code2,
    Binary,
    Network,
    Layers,
    TreePine,
    Hash,
    Search,
    Zap,
    ListOrdered,
    GitMerge,
    LogOut,
    IdCard,
} from "lucide-react";

// Data Structures dropdown items
const dataStructures = [
    { name: "Arrays", href: "/visualizer?ds=array", icon: Layers, description: "Linear data structure" },
    { name: "Linked Lists", href: "/visualizer?ds=linkedlist", icon: GitBranch, description: "Node-based structure" },
    { name: "Trees", href: "/visualizer?ds=tree", icon: TreePine, description: "Hierarchical structure" },
    { name: "Graphs", href: "/visualizer?ds=graph", icon: Network, description: "Network structure" },
    { name: "Hash Tables", href: "/visualizer?ds=hashtable", icon: Hash, description: "Key-value mapping" },
];

// Algorithms dropdown items
const algorithms = [
    { name: "Bubble Sort", href: "/visualizer?algo=bubble", icon: Sparkles, description: "O(n²) simple sort" },
    { name: "Quick Sort", href: "/visualizer?algo=quick", icon: Zap, description: "O(n log n) divide & conquer" },
    { name: "Merge Sort", href: "/visualizer?algo=merge", icon: GitMerge, description: "O(n log n) stable sort" },
    { name: "Selection Sort", href: "/visualizer?algo=selection", icon: Search, description: "O(n²) in-place sort" },
    { name: "Binary Search", href: "/visualizer?algo=binarysearch", icon: Binary, description: "O(log n) search" },
];

export function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        if (activeDropdown) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [activeDropdown]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            {/* Gradient line at top */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

            <div className="glass-strong backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-18">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
                            <div className="relative">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-cyan-500 flex items-center justify-center glow-purple group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-base lg:text-lg font-bold gradient-text leading-tight">
                                    DSA Visualizer
                                </h1>
                                <p className="text-[9px] lg:text-[10px] text-purple-400 tracking-wider uppercase">Pro Edition</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation - Center with 2rem gap */}
                        <div className="nav-links hidden lg:flex items-center gap-8">
                            {/* Home */}
                            <NavLink href="/" pathname={pathname} icon={Sparkles}>
                                Home
                            </NavLink>

                            {/* Data Structures Dropdown */}
                            <DropdownMenu
                                label="Data Structures"
                                icon={Database}
                                items={dataStructures}
                                isActive={activeDropdown === "ds"}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === "ds" ? null : "ds");
                                }}
                                onClose={() => setActiveDropdown(null)}
                            />

                            {/* Algorithms Dropdown */}
                            <DropdownMenu
                                label="Algorithms"
                                icon={Code2}
                                items={algorithms}
                                isActive={activeDropdown === "algo"}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === "algo" ? null : "algo");
                                }}
                                onClose={() => setActiveDropdown(null)}
                            />

                            {/* Visualizer */}
                            <NavLink href="/visualizer" pathname={pathname} icon={BarChart3}>
                                Visualizer
                            </NavLink>

                            {/* AI Tutor */}
                            <NavLink href="/ai-tutor" pathname={pathname} icon={BotMessageSquare}>
                                AI Tutor
                            </NavLink>
                        </div>

                        {/* Right side - Settings & Profile with 1.5rem gap */}
                        <div className="nav-actions hidden lg:flex items-center gap-6">
                            <button
                                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            {/* Profile Dropdown */}
                            <ProfileDropdown
                                isActive={activeDropdown === "profile"}
                                onToggle={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdown(activeDropdown === "profile" ? null : "profile");
                                }}
                            />
                        </div>

                        {/* Mobile/Tablet menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden glass-strong border-t border-slate-800/50 overflow-hidden"
                    >
                        <div className="px-4 py-4 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                            <MobileNavLink href="/" icon={Sparkles} onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </MobileNavLink>

                            {/* Mobile Data Structures Section */}
                            <div className="pt-2 pb-1">
                                <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Data Structures</p>
                            </div>
                            {dataStructures.slice(0, 3).map((item) => (
                                <MobileNavLink key={item.name} href={item.href} icon={item.icon} onClick={() => setMobileMenuOpen(false)}>
                                    {item.name}
                                </MobileNavLink>
                            ))}

                            {/* Mobile Algorithms Section */}
                            <div className="pt-2 pb-1">
                                <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Algorithms</p>
                            </div>
                            {algorithms.slice(0, 3).map((item) => (
                                <MobileNavLink key={item.name} href={item.href} icon={item.icon} onClick={() => setMobileMenuOpen(false)}>
                                    {item.name}
                                </MobileNavLink>
                            ))}

                            <div className="pt-2 pb-1">
                                <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Tools</p>
                            </div>
                            <MobileNavLink href="/visualizer" icon={BarChart3} onClick={() => setMobileMenuOpen(false)}>
                                Visualizer
                            </MobileNavLink>
                            <MobileNavLink href="/ai-tutor" icon={BotMessageSquare} onClick={() => setMobileMenuOpen(false)}>
                                AI Tutor
                            </MobileNavLink>

                            <div className="pt-2 pb-1">
                                <p className="px-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Account</p>
                            </div>
                            <MobileNavLink href="/settings" icon={Settings} onClick={() => setMobileMenuOpen(false)}>
                                Settings
                            </MobileNavLink>
                            <MobileNavLink href="/profile" icon={User} onClick={() => setMobileMenuOpen(false)}>
                                Profile
                            </MobileNavLink>

                            {/* Logout button */}
                            <button
                                onClick={() => {
                                    console.log("Logging out...");
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Log Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

// NavLink component
function NavLink({
    href,
    pathname,
    icon: Icon,
    children,
}: {
    href: string;
    pathname: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive ? "text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                }`}
        >
            {isActive && (
                <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/30 to-cyan-600/30 border border-purple-500/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{children}</span>
        </Link>
    );
}

// Dropdown Menu component
function DropdownMenu({
    label,
    icon: Icon,
    items,
    isActive,
    onToggle,
    onClose,
}: {
    label: string;
    icon: React.ElementType;
    items: { name: string; href: string; icon: React.ElementType; description: string }[];
    isActive: boolean;
    onToggle: (e: React.MouseEvent) => void;
    onClose?: () => void;
}) {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap ${isActive ? "text-white bg-slate-800/50" : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                    }`}
            >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{label}</span>
                <span className="xl:hidden">{label.split(" ")[0]}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-64 p-2 rounded-xl glass-strong border border-slate-700/50 shadow-2xl z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {items.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                onClick={() => onClose?.()}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-cyan-500/30 transition-colors">
                                    <item.icon className="w-4 h-4 text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{item.name}</div>
                                    <div className="text-xs text-slate-500">{item.description}</div>
                                </div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


// Mobile NavLink
function MobileNavLink({
    href,
    icon: Icon,
    onClick,
    children,
}: {
    href: string;
    icon: React.ElementType;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{children}</span>
        </Link>
    );
}

// Profile Dropdown
function ProfileDropdown({
    isActive,
    onToggle,
}: {
    isActive: boolean;
    onToggle: (e: React.MouseEvent) => void;
}) {
    // Mock user data - replace with real auth data
    const user = {
        name: "John Doe",
        id: "USR-2024-001",
        email: "john.doe@example.com",
    };

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-colors ${isActive
                    ? "bg-purple-500/20 border-purple-500/40"
                    : "bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border-purple-500/20"
                    } border text-white hover:border-purple-500/40`}
            >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden xl:inline">Profile</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-72 p-4 rounded-2xl glass-strong border border-slate-700/50 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* User Info */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="min-w-0">
                                <div className="font-semibold text-white truncate">{user.name}</div>
                                <div className="text-xs text-slate-400 truncate">{user.email}</div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="py-3 space-y-2 border-b border-slate-700/50">
                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                                <IdCard className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-xs text-slate-500">User ID</div>
                                    <div className="text-sm text-white font-mono truncate">{user.id}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Logging out...");
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Log Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
