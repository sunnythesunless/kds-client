"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore(state => state.setAuth);

    useEffect(() => {
        // Read the token from URL query parameter (base64 encoded)
        const token = searchParams.get('token');

        if (token) {
            try {
                // Decode base64 and parse JSON
                const authData = JSON.parse(atob(token));

                // Set auth state
                setAuth(authData.user, authData.accessToken, authData.refreshToken);

                // Clear the token from URL (security: don't leave tokens in browser history)
                window.history.replaceState({}, '', '/auth/callback');

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (error) {
                console.error('Failed to parse auth token:', error);
                router.push('/login?error=auth_failed');
            }
        } else {
            // No token found, redirect to login
            router.push('/login?error=no_auth');
        }
    }, [router, setAuth, searchParams]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Authenticating with Google...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    );
}

