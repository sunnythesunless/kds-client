"use client";

import { useState } from 'react';
import { useDocuments, useDeleteDocument } from '@/hooks/useDocuments';
import Link from 'next/link';
import {
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Eye,
    Loader2,
    ChevronLeft,
    ChevronRight,
    File
} from 'lucide-react';
import { clsx } from 'clsx';
import * as Popover from '@radix-ui/react-popover';

export default function DocumentsPage() {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('ALL');

    const { data, isLoading } = useDocuments({ page, limit: 10, type: typeFilter });
    const deleteMutation = useDeleteDocument();

    const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation if clicking row
        if (confirm('Are you sure you want to delete this document? This cannot be undone.')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const docTypes = ['ALL', 'SOP', 'Policy', 'Guide', 'Spec'];

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Knowledge Vault</h1>
                    <p className="text-slate-400 text-sm">Manage and organize your governance assets.</p>
                </div>
                <Link
                    href="/dashboard/documents/upload"
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Upload Document</span>
                    <span className="sm:hidden">Upload</span>
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full bg-slate-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 placeholder:text-slate-600"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    {docTypes.map(t => (
                        <button
                            key={t}
                            onClick={() => { setTypeFilter(t); setPage(1); }}
                            className={clsx(
                                "px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border",
                                typeFilter === t
                                    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                    : "bg-transparent text-slate-400 border-transparent hover:bg-white/5 hover:text-slate-300"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 gap-3">
                        <Loader2 className="animate-spin text-cyan-400" size={32} />
                        <p className="text-xs font-mono">RETRIEVING ASSETS...</p>
                    </div>
                ) : data?.documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 gap-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                            <File className="text-slate-600" size={32} />
                        </div>
                        <p>No documents found matching your criteria.</p>
                        {typeFilter !== 'ALL' && (
                            <button
                                onClick={() => setTypeFilter('ALL')}
                                className="text-cyan-400 text-sm hover:underline"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 text-xs font-mono text-slate-500 uppercase tracking-wider bg-slate-950/30">
                                    <th className="p-4 rounded-tl-xl">Document Name</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Version</th>
                                    <th className="p-4">Last Updated</th>
                                    <th className="p-4 text-right rounded-tr-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data?.documents.map((doc) => (
                                    <tr key={doc.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <Link href={`/dashboard/documents/${doc.id}`} className="font-medium text-slate-200 hover:text-cyan-400 block truncate max-w-[200px] sm:max-w-xs">
                                                        {doc.title}
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs border border-white/5">
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-400 text-sm font-mono">v{doc.currentVersion}</td>
                                        <td className="p-4 text-slate-400 text-sm">{formatDate(doc.updatedAt)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">

                                                <button
                                                    onClick={(e) => handleDelete(doc.id, e)}
                                                    className="p-2 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-400 transition-colors"
                                                    title="Delete"
                                                >
                                                    {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 rounded hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm text-slate-500 font-mono">Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 rounded hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed text-slate-400"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
