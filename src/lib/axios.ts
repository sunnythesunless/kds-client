import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

// Default to localhost:3000 if env not set
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = useAuthStore.getState().refreshToken;

            if (refreshToken) {
                try {
                    // Call refresh endpoint
                    // Note: Using axios directly to avoid interceptor loop
                    const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
                        refreshToken,
                    });

                    if (data.success && data.accessToken) {
                        // Update store
                        const user = useAuthStore.getState().user;
                        if (user) {
                            useAuthStore.getState().setAuth(user, data.accessToken, refreshToken);
                        }

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed -> Logout
                    useAuthStore.getState().logout();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                }
            } else {
                // No refresh token -> Logout
                useAuthStore.getState().logout();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'; // Or specific error page
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
