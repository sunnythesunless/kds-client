"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useUser';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Save,
    Loader2,
    CheckCircle2,
    Settings,
    Shield,
    Bell,
    LogOut,
    Key
} from 'lucide-react';
import { clsx } from 'clsx';

interface ProfileFormData {
    name: string;
    email: string;
}

export default function SettingsPage() {
    const router = useRouter();
    const { data: user, isLoading } = useCurrentUser();
    const updateProfile = useUpdateProfile();
    const logout = useLogout();
    const clearAuth = useAuthStore((state) => state.logout);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<ProfileFormData>();

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || '',
                email: user.email || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: ProfileFormData) => {
        try {
            await updateProfile.mutateAsync(data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout.mutateAsync();
        } catch (error) {
            // Continue even if API fails
        }
        clearAuth();
        router.push('/login');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="animate-spin text-cyan-400" size={32} />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl">
                        <Settings className="text-slate-300" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Settings</h1>
                        <p className="text-slate-400 text-sm">Manage your account preferences</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                        activeTab === tab.id
                                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                            <hr className="border-white/10 my-3" />
                            <button
                                onClick={handleLogout}
                                disabled={logout.isPending}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                                {logout.isPending ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <LogOut size={18} />
                                )}
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-1">Profile Information</h2>
                                    <p className="text-slate-400 text-sm">Update your personal details.</p>
                                </div>

                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{user?.name}</p>
                                        <p className="text-slate-400 text-sm">{user?.email}</p>
                                        {user?.isVerified && (
                                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1">
                                                <CheckCircle2 size={12} />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <hr className="border-white/10" />

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    {...register('name', { required: 'Name is required' })}
                                                    type="text"
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
                                                />
                                            </div>
                                            {errors.name && (
                                                <p className="text-rose-400 text-xs">{errors.name.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                <input
                                                    {...register('email')}
                                                    type="email"
                                                    disabled
                                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-slate-500 cursor-not-allowed"
                                                />
                                            </div>
                                            <p className="text-slate-500 text-xs">Email cannot be changed</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={!isDirty || updateProfile.isPending}
                                            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                                        >
                                            {updateProfile.isPending ? (
                                                <Loader2 className="animate-spin" size={16} />
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            Save Changes
                                        </button>
                                        {saved && (
                                            <span className="text-emerald-400 text-sm flex items-center gap-1 animate-in fade-in">
                                                <CheckCircle2 size={14} />
                                                Saved successfully
                                            </span>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-1">Security Settings</h2>
                                    <p className="text-slate-400 text-sm">Manage your password and security preferences.</p>
                                </div>

                                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                                <Key className="text-slate-300" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Password</p>
                                                <p className="text-slate-400 text-sm">Last changed: Unknown</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                                            Change Password
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                                <Shield className="text-slate-300" size={18} />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">Two-Factor Authentication</p>
                                                <p className="text-slate-400 text-sm">Add an extra layer of security</p>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-slate-700 text-slate-400 text-xs rounded-full">
                                            Coming Soon
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-white mb-1">Notification Preferences</h2>
                                    <p className="text-slate-400 text-sm">Configure how you receive notifications.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { label: 'Email notifications for decay alerts', enabled: true },
                                        { label: 'Weekly digest of document changes', enabled: false },
                                        { label: 'Chat response notifications', enabled: true },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 border border-white/5 rounded-xl">
                                            <span className="text-white">{item.label}</span>
                                            <button
                                                className={clsx(
                                                    "w-12 h-6 rounded-full relative transition-colors",
                                                    item.enabled ? "bg-cyan-500" : "bg-slate-700"
                                                )}
                                            >
                                                <span
                                                    className={clsx(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                                        item.enabled ? "left-7" : "left-1"
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
