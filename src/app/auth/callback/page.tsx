"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();
    const setAuth = useAuthStore(state => state.setAuth);

    useEffect(() => {
        // Read the auth_transport cookie set by the backend
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(c => c.trim().startsWith('auth_transport='));

        if (authCookie) {
            try {
                const cookieValue = authCookie.split('=')[1];
                const authData = JSON.parse(decodeURIComponent(cookieValue));

                // Set auth state
                setAuth(authData.user, authData.accessToken, authData.refreshToken);

                // Clear the cookie
                document.cookie = 'auth_transport=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (error) {
                console.error('Failed to parse auth cookie:', error);
                router.push('/login?error=auth_failed');
            }
        } else {
            // No cookie found, redirect to login
            router.push('/login?error=no_auth');
        }
    }, [router, setAuth]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Authenticating with Google...</p>
            </div>
        </div>
    );
}
