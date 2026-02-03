"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResetPassword } from '@/hooks/useAuth';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, Sparkles, XCircle } from 'lucide-react';

const schema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const token = params?.token as string;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const resetPassword = useResetPassword();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setError('');
        try {
            await resetPassword.mutateAsync({
                token,
                password: data.password,
                confirmPassword: data.confirmPassword,
            });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Reset failed. Link may be expired.');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="text-emerald-400" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Password Reset!</h1>
                        <p className="text-slate-400 mb-6">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            {/* Background effects */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950"></div>
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            InsightOps
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                        <p className="text-slate-400 text-sm">
                            Enter your new password below.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
                            <XCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-rose-300 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-rose-400 text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    {...register('confirmPassword')}
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-rose-400 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={resetPassword.isPending}
                            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                        >
                            {resetPassword.isPending ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Resetting...
                                </>
                            ) : (
                                'Reset Password'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
