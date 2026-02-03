"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useForm } from 'react-hook-form';
import {
    UploadCloud,
    FileText,
    X,
    Loader2,
    CheckCircle2,
    ArrowLeft,
    Cpu
} from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface UploadFormData {
    title: string;
    type: string;
}

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [aiResult, setAiResult] = useState<any>(null); // To store AI summary

    const { register, handleSubmit, formState: { errors } } = useForm<UploadFormData>();

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const onSubmit = async (data: UploadFormData) => {
        if (!file) return;
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', data.title);
        formData.append('type', data.type);
        formData.append('workspaceId', 'default-workspace'); // Hardcoded until multi-tenant

        try {
            // Simulate progress for UX (since axios progress is fast on local)
            const interval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 300);

            const res = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(interval);
            setProgress(100);
            setAiResult(res.data);

        } catch (error) {
            console.error(error);
            alert('Upload failed');
            setUploading(false);
        }
    };

    if (aiResult) {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Upload Complete</h1>
                        <p className="text-slate-400">Document analyzed and indexed.</p>
                    </div>
                </div>

                {/* AI Summary Card */}
                <div className="bg-slate-900/50 border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Cpu size={64} className="text-cyan-400" />
                    </div>

                    <h3 className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Cpu size={16} /> AI Generated Summary
                    </h3>

                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-slate-300 leading-relaxed mb-6">{aiResult.ai.summary}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-white text-xs font-bold uppercase mb-2 text-slate-500">Key Points</h4>
                                <ul className="space-y-1">
                                    {aiResult.ai.keyPoints?.map((kp: string, i: number) => (
                                        <li key={i} className="text-slate-400 text-xs flex gap-2">
                                            <span className="text-cyan-500">•</span> {kp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-white text-xs font-bold uppercase mb-2 text-slate-500">Topics</h4>
                                <div className="flex flex-wrap gap-2">
                                    {aiResult.ai.topics?.map((topic: string, i: number) => (
                                        <span key={i} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] border border-white/5">
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link
                        href="/dashboard/documents"
                        className="px-6 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                    >
                        Return to Vault
                    </Link>
                    <Link
                        href={`/dashboard/documents/${aiResult.id}`}
                        className="px-6 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                        View Document
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            <Link href="/dashboard/documents" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={16} />
                <span>Back to Documents</span>
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-1">Upload Document</h1>
                <p className="text-slate-400 text-sm">Add a new asset to the Knowledge Vault.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* File Upload Zone */}
                <label className={clsx(
                    "border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer relative",
                    file ? "border-cyan-500/50 bg-cyan-500/5" : "border-slate-700 hover:border-cyan-500/50 bg-slate-900/30"
                )}>
                    {!file ? (
                        <>
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <UploadCloud className="text-cyan-400" size={32} />
                            </div>
                            <p className="text-slate-200 font-medium mb-2">Click to upload or drag and drop</p>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">PDF</span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">DOCX</span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">TXT</span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs font-mono">MD</span>
                                <span className="text-slate-600 ml-2">up to 10MB</span>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.docx,.txt,.md"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={onFileChange}
                            />
                        </>
                    ) : (
                        <div className="flex items-center gap-4 w-full max-w-md bg-slate-800/80 p-4 rounded-xl border border-cyan-500/20">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                                <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); setFile(null); }}
                                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}
                </label>

                {/* Method 2: Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Document Title</label>
                        <input
                            {...register('title', { required: true })}
                            type="text"
                            placeholder="e.g. Server Security Policy"
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        {errors.title && <span className="text-rose-400 text-xs">Required</span>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Type</label>
                        <select
                            {...register('type', { required: true })}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                        >
                            <option value="SOP">SOP</option>
                            <option value="Policy">Policy</option>
                            <option value="Guide">Guide</option>
                            <option value="Spec">Spec</option>
                        </select>
                    </div>
                </div>

                {/* Submit Action */}
                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            {progress < 100 ? `Uploading... ${progress}%` : 'Analyzing Content...'}
                        </>
                    ) : (
                        <>
                            <UploadCloud size={20} />
                            Start Upload & Analysis
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
