"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/axios';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState('');
    const setAuth = useAuthStore(state => state.setAuth);
    const [successMsg, setSuccessMsg] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema)
    });

    useEffect(() => {
        const verified = searchParams.get('verified');
        if (verified === 'true') {
            setSuccessMsg("Email verified successfully! You can now login.");
        }
    }, [searchParams]);

    const onSubmit = async (data: FormData) => {
        setError('');
        setSuccessMsg('');
        try {
            const res = await api.post('/api/auth/login', data);
            const { user, accessToken, refreshToken } = res.data;
            setAuth(user, accessToken, refreshToken);
            router.push('/dashboard');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401 && err.response.data.message?.includes("verified")) {
                setError("Please verify your email address before logging in.");
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid credentials. Please try again.');
            }
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            {/* Top decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                    InsightOps
                </h1>
                <p className="text-slate-400 text-sm">Knowledge Decay Governance System</p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {successMsg && (
                <div className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={16} />
                    <span>{successMsg}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Email</label>
                    <input
                        {...register('email')}
                        type="email"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="analyst@insightops.com"
                    />
                    {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Password</label>
                    <input
                        {...register('password')}
                        type="password"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="••••••••"
                    />
                    {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate'}
                </button>
            </form>

            <div className="mt-6 flex flex-col gap-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-slate-900 px-2 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <a
                    href="http://localhost:3000/api/auth/google"
                    className="w-full bg-slate-800/50 hover:bg-slate-800 border border-white/10 text-slate-200 font-medium py-3 rounded-lg flex items-center justify-center gap-3 transition-colors"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Google
                </a>
            </div>

            <div className="mt-8 text-center text-xs text-slate-500">
                <p>Don't have an account? <Link href="/register" className="text-cyan-400 hover:text-cyan-300">Sign up</Link></p>
            </div>

        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="text-cyan-400">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}
