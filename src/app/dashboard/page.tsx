"use client";

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Loader2, Activity, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function DashboardPage() {
    const { data: stats, isLoading, error } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 gap-2">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
                <p className="text-xs font-mono uppercase tracking-widest">Synchronizing Workspace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 border border-rose-500/20 bg-rose-500/5 rounded-2xl flex items-center gap-4 text-rose-400">
                <AlertTriangle size={24} />
                <div>
                    <h3 className="font-bold">System Connection Failed</h3>
                    <p className="text-sm opacity-80">Could not fetch live metrics. Check backend connectivity.</p>
                </div>
            </div>
        );
    }

    // Safety fallback if data is somehow missing
    const safeStats = stats || {
        totalDocuments: 0,
        decayDetected: 0,
        byRiskLevel: { high: 0, medium: 0, low: 0 },
        averageConfidence: 1.0
    };

    const healthScore = Math.round(safeStats.averageConfidence * 100);
    const healthColor = healthScore > 80 ? 'text-cyan-400' : healthScore > 50 ? 'text-amber-400' : 'text-rose-400';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">System Overview</h1>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Workspace Metrics
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Health Score Card */}
                <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl hover:border-cyan-500/30 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-cyan-400" />
                    </div>
                    <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Workspace Confidence</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <p className={clsx("text-4xl font-bold transition-colors", healthColor)}>{healthScore}%</p>
                        <span className="text-slate-500 text-sm mb-1 font-mono">AVG TRUST</span>
                    </div>
                </div>

                {/* Decay Risk Card */}
                <div className={clsx(
                    "p-6 bg-slate-900/50 border rounded-2xl transition-colors group relative overflow-hidden",
                    safeStats.byRiskLevel.high > 0 ? "border-rose-500/30 hover:bg-rose-500/5" : "border-white/10 hover:border-amber-500/30"
                )}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={64} className={safeStats.byRiskLevel.high > 0 ? "text-rose-500" : "text-amber-500"} />
                    </div>
                    <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Critical Decay</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <p className={clsx("text-4xl font-bold transition-colors", safeStats.byRiskLevel.high > 0 ? "text-rose-400" : "text-amber-400")}>
                            {safeStats.byRiskLevel.high}
                        </p>
                        <span className="text-slate-500 text-sm mb-1 font-mono">DOCS AT RISK</span>
                    </div>
                </div>

                {/* Total Assets Card */}
                <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl hover:border-purple-500/30 transition-colors group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={64} className="text-purple-400" />
                    </div>
                    <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-2">Knowledge Base</h3>
                    <div className="flex items-end gap-3 relative z-10">
                        <p className="text-4xl font-bold text-white group-hover:text-purple-300 transition-colors">{safeStats.totalDocuments}</p>
                        <span className="text-slate-500 text-sm mb-1 font-mono">ASSETS</span>
                    </div>
                </div>
            </div>

            {/* Quick Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl">
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-400" />
                        Risk Distribution
                    </h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Low Risk (Secure)</span>
                                <span>{safeStats.byRiskLevel.low}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500/50"
                                    style={{ width: `${(safeStats.byRiskLevel.low / (safeStats.totalDocuments || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>Medium Risk (Warning)</span>
                                <span>{safeStats.byRiskLevel.medium}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500/50"
                                    style={{ width: `${(safeStats.byRiskLevel.medium / (safeStats.totalDocuments || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>High Risk (Critical)</span>
                                <span>{safeStats.byRiskLevel.high}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-rose-500/50"
                                    style={{ width: `${(safeStats.byRiskLevel.high / (safeStats.totalDocuments || 1)) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl flex items-center justify-center text-center">
                    {safeStats.totalDocuments === 0 ? (
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-white font-medium">Knowledge Base Empty</h3>
                            <p className="text-sm text-slate-400 max-w-[200px] mx-auto">Upload your first SOP or Policy to initialize the decay engine.</p>
                            <button className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-cyan-500/20">
                                Upload Document
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-4 animate-pulse">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-white font-medium">System Active</h3>
                            <p className="text-sm text-slate-400">Decay Engine monitoring {safeStats.totalDocuments} assets.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
