"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import Link from 'next/link';
import {
    LayoutDashboard,
    FileText,
    Activity,
    MessageSquare,
    Settings,
    LogOut,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, token, logout, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (_hasHydrated && !token) {
            router.push('/login');
        }
    }, [token, _hasHydrated, router]);

    if (!_hasHydrated) return null; // Or a full-screen skeleton
    if (!token) return null;

    const navItems = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Documents', href: '/dashboard/documents', icon: FileText },
        { name: 'Decay Analysis', href: '/dashboard/decay', icon: Activity },
        { name: 'Neural Chat', href: '/dashboard/chat', icon: MessageSquare },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-white">InsightOps</h1>
                        <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Governance</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 space-y-2 py-4">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-wider px-2 mb-2 block">Platform</label>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)] border border-cyan-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon size={20} className={clsx(isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white")} />
                            {item.name}
                        </Link>
                    )
                })}
            </div>


            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 mb-3 border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                    <LogOut size={16} />
                    Disconnect
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden bg-[url('/grid.svg')]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 bg-slate-950/80 backdrop-blur-md border-r border-white/5 h-screen fixed z-20">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                        />
                        <motion.div
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: "spring", damping: 20, stiffness: 100 }}
                            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-white/10 z-40"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <main className="flex-1 lg:ml-72 min-h-screen flex flex-col relative w-full">
                <div className="lg:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-cyan-400" size={24} />
                        <span className="font-bold">InsightOps</span>
                    </div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/5 rounded-lg">
                        <Menu size={24} className="text-slate-300" />
                    </button>
                </div>
                <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
