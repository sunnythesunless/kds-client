"use client";

import { useDecayReports, useBatchAnalysis, useUpdateReviewStatus } from '@/hooks/useDecay';
import {
    Activity,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Play,
    Loader2,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

export default function DecayPage() {
    const { data, isLoading, refetch } = useDecayReports();
    const batchAnalysis = useBatchAnalysis();
    const updateReviewStatus = useUpdateReviewStatus();
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');

    // Deduplicate reports - only show latest per document
    const uniqueReports = data?.reports ? (() => {
        const seen = new Map();
        for (const report of data.reports) {
            if (!seen.has(report.documentId)) {
                seen.set(report.documentId, report);
            }
        }
        return Array.from(seen.values());
    })() : [];

    // Filter reports
    const filteredReports = uniqueReports.filter(report => {
        if (filter === 'all') return true;
        if (filter === 'pending') return report.reviewStatus !== 'reviewed';
        if (filter === 'reviewed') return report.reviewStatus === 'reviewed';
        return true;
    });

    const handleBatchRun = async () => {
        await batchAnalysis.mutateAsync();
    };

    const handleMarkReviewed = async (reportId: string) => {
        try {
            await updateReviewStatus.mutateAsync({ reportId, reviewStatus: 'reviewed' });
            refetch();
        } catch (error) {
            console.error('Failed to update review status:', error);
        }
    };

    const handleMarkPending = async (reportId: string) => {
        try {
            await updateReviewStatus.mutateAsync({ reportId, reviewStatus: 'pending' });
            refetch();
        } catch (error) {
            console.error('Failed to update review status:', error);
        }
    };

    const pendingCount = uniqueReports.filter(r => r.reviewStatus !== 'reviewed').length;
    const reviewedCount = uniqueReports.filter(r => r.reviewStatus === 'reviewed').length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <Activity className="text-rose-500" />
                        Decay Intelligence Center
                    </h1>
                    <p className="text-slate-400 text-sm">Monitor and remediate knowledge obsolescence.</p>
                </div>
                <button
                    onClick={handleBatchRun}
                    disabled={batchAnalysis.isPending}
                    className="bg-rose-500 hover:bg-rose-400 text-white font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {batchAnalysis.isPending ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
                    <span className="hidden sm:inline">Run System Scan</span>
                    <span className="sm:hidden">Scan</span>
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={clsx(
                        "p-4 rounded-xl border transition-all text-left",
                        filter === 'all'
                            ? "bg-slate-800 border-cyan-500/50"
                            : "bg-slate-900/50 border-white/10 hover:border-white/20"
                    )}
                >
                    <p className="text-2xl font-bold text-white">{uniqueReports.length}</p>
                    <p className="text-xs text-slate-400">Total Reports</p>
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={clsx(
                        "p-4 rounded-xl border transition-all text-left",
                        filter === 'pending'
                            ? "bg-amber-500/10 border-amber-500/50"
                            : "bg-slate-900/50 border-white/10 hover:border-white/20"
                    )}
                >
                    <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
                    <p className="text-xs text-slate-400">Needs Review</p>
                </button>
                <button
                    onClick={() => setFilter('reviewed')}
                    className={clsx(
                        "p-4 rounded-xl border transition-all text-left",
                        filter === 'reviewed'
                            ? "bg-emerald-500/10 border-emerald-500/50"
                            : "bg-slate-900/50 border-white/10 hover:border-white/20"
                    )}
                >
                    <p className="text-2xl font-bold text-emerald-400">{reviewedCount}</p>
                    <p className="text-xs text-slate-400">Reviewed</p>
                </button>
            </div>

            {/* Reports Feed */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/30">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <RefreshCw size={12} /> Live Analysis Feed
                        {filter !== 'all' && (
                            <span className="text-cyan-400">• Filtered: {filter}</span>
                        )}
                    </h3>
                    <button onClick={() => refetch()} className="text-slate-500 hover:text-white transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 gap-3">
                        <Loader2 className="animate-spin text-rose-500" size={32} />
                        <p className="text-xs font-mono">CALCULATING VECTORS...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 gap-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-500" size={32} />
                        </div>
                        <p>{filter === 'all' ? 'No decay issues detected. System is healthy.' : `No ${filter} reports.`}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="p-4 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        {report.riskLevel === 'high' && <ShieldAlert size={16} className="text-rose-500" />}
                                        {report.riskLevel === 'medium' && <AlertTriangle size={16} className="text-amber-500" />}
                                        {report.riskLevel === 'low' && <CheckCircle2 size={16} className="text-emerald-500" />}

                                        <h4 className="font-medium text-slate-200">
                                            {report.document?.title || 'Unknown Document'}
                                        </h4>
                                        <span className={clsx(
                                            "text-[10px] px-1.5 py-0.5 rounded border uppercase",
                                            report.riskLevel === 'high' ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
                                                report.riskLevel === 'medium' ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                                                    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                        )}>
                                            {report.riskLevel} Risk
                                        </span>
                                        {report.reviewStatus === 'reviewed' && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                                                <Eye size={10} />
                                                Reviewed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono">
                                        Confidence: {((report.confidenceScore || 0) * 100).toFixed(1)}% | Analyzed: {new Date(report.analyzedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <div className="hidden md:block flex-1 h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={clsx(
                                                "h-full rounded-full",
                                                report.riskLevel === 'high' ? "bg-rose-500" :
                                                    report.riskLevel === 'medium' ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${(1 - (report.confidenceScore || 0)) * 100}%` }}
                                        ></div>
                                    </div>

                                    {report.reviewStatus === 'reviewed' ? (
                                        <button
                                            onClick={() => handleMarkPending(report.id)}
                                            disabled={updateReviewStatus.isPending}
                                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5 transition-colors whitespace-nowrap flex items-center gap-1.5"
                                        >
                                            <EyeOff size={12} />
                                            Unreview
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkReviewed(report.id)}
                                            disabled={updateReviewStatus.isPending}
                                            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors whitespace-nowrap flex items-center gap-1.5"
                                        >
                                            {updateReviewStatus.isPending ? (
                                                <Loader2 className="animate-spin" size={12} />
                                            ) : (
                                                <CheckCircle2 size={12} />
                                            )}
                                            Mark Reviewed
                                        </button>
                                    )}

                                    <Link
                                        href={`/dashboard/documents/${report.documentId}`}
                                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 transition-colors whitespace-nowrap"
                                    >
                                        View Doc
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
