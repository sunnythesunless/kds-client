"use client";

import { useState } from 'react';
import { useDocumentDetail, useDocumentVersions, useUpdateDocument } from '@/hooks/useDocumentDetail';
import { useVerifyDocument } from '@/hooks/useDocuments';
import { useRunDecayAnalysis } from '@/hooks/useDecay';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Clock,
    User,
    FileText,
    ShieldAlert,
    History,
    Edit3,
    Loader2,
    Save,
    X,
    CheckCircle2,
    ShieldCheck
} from 'lucide-react';
import { clsx } from 'clsx';

export default function DocumentDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();

    const { data: doc, isLoading, refetch } = useDocumentDetail(id);
    const { data: versions } = useDocumentVersions(id);
    const updateDocument = useUpdateDocument();
    const verifyDocument = useVerifyDocument();
    const runDecayAnalysis = useRunDecayAnalysis();

    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [changeNotes, setChangeNotes] = useState('');

    const handleEditStart = () => {
        setEditedContent(doc?.content || '');
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setEditedContent('');
        setChangeNotes('');
    };

    const handleEditSave = async () => {
        if (!editedContent.trim()) return;
        try {
            await updateDocument.mutateAsync({ id, content: editedContent });
            setIsEditing(false);
            setEditedContent('');
            setChangeNotes('');
            refetch();
        } catch (error) {
            console.error('Failed to update:', error);
        }
    };

    const handleVerify = async () => {
        try {
            await verifyDocument.mutateAsync(id);
            refetch();
        } catch (error) {
            console.error('Failed to verify:', error);
        }
    };

    const handleAnalyzeDecay = async () => {
        try {
            await runDecayAnalysis.mutateAsync(id);
            router.push('/dashboard/decay');
        } catch (error) {
            console.error('Failed to analyze:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 gap-3">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
                <p className="text-xs font-mono">LOADING ASSET...</p>
            </div>
        )
    }

    if (!doc) return <div className="text-center p-10 text-slate-500">Document not found</div>;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/documents" className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            {doc.title}
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono border border-white/5">
                                v{doc.currentVersion}
                            </span>
                            {doc.lastVerifiedAt && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 size={10} />
                                    Verified
                                </span>
                            )}
                        </h1>
                        <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">{doc.id}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <button
                                onClick={handleVerify}
                                disabled={verifyDocument.isPending}
                                className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {verifyDocument.isPending ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <ShieldCheck size={16} />
                                )}
                                Verify
                            </button>
                            <button
                                onClick={handleAnalyzeDecay}
                                disabled={runDecayAnalysis.isPending}
                                className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {runDecayAnalysis.isPending ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <ShieldAlert size={16} />
                                )}
                                Analyze Decay
                            </button>
                            <button
                                onClick={handleEditStart}
                                className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                            >
                                <Edit3 size={16} />
                                Edit Content
                            </button>
                        </>
                    )}
                    {isEditing && (
                        <>
                            <button
                                onClick={handleEditCancel}
                                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center gap-2 text-sm font-medium transition-colors"
                            >
                                <X size={16} />
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={updateDocument.isPending}
                                className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-400 flex items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                            >
                                {updateDocument.isPending ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Save size={16} />
                                )}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Content */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-8 overflow-y-auto relative custom-scrollbar">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FileText size={128} />
                    </div>
                    {isEditing ? (
                        <div className="space-y-4">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full h-[400px] bg-slate-950/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50 resize-none"
                                placeholder="Document content..."
                            />
                            <input
                                type="text"
                                value={changeNotes}
                                onChange={(e) => setChangeNotes(e.target.value)}
                                placeholder="Change notes (optional)"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                    ) : (
                        <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-headings:text-white prose-li:text-slate-300">
                            <div className="whitespace-pre-wrap font-sans leading-relaxed">
                                {doc.content}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Metadata Card */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <FileText size={14} /> Metadata
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Type</span>
                                <span className="px-2 py-1 rounded bg-slate-800 text-white text-xs border border-white/5">{doc.type}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Author</span>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <User size={14} />
                                    {doc.author}
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Last Updated</span>
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Clock size={14} />
                                    {new Date(doc.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                            {doc.lastVerifiedAt && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Last Verified</span>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <ShieldCheck size={14} />
                                        {new Date(doc.lastVerifiedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Version History Card */}
                    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <History size={14} /> Version History
                        </h3>
                        <div className="space-y-4 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-800"></div>

                            {versions?.map((ver, i) => (
                                <div key={ver.id} className="relative pl-8 group cursor-pointer">
                                    <div className={clsx(
                                        "absolute left-1 w-3 h-3 rounded-full border-2 transition-colors z-10",
                                        i === 0 ? "bg-cyan-500 border-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "bg-slate-900 border-slate-700 group-hover:border-slate-500"
                                    )}></div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={clsx(
                                                "text-sm font-bold",
                                                i === 0 ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                                            )}>v{ver.versionNumber}</span>
                                            {i === 0 && <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 rounded">LATEST</span>}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(ver.createdAt).toLocaleDateString()}</p>
                                        {ver.summary && (
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">"{ver.summary}"</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
