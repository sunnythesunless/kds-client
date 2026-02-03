import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface ForgotPasswordData {
    email: string;
}

interface ResetPasswordData {
    token: string;
    password: string;
    confirmPassword: string;
}

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: async (data: ForgotPasswordData) => {
            const res = await api.post('/api/auth/forgot-password', data);
            return res.data;
        },
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: async (data: ResetPasswordData) => {
            const { token, ...body } = data;
            const res = await api.post(`/api/auth/reset-password/${token}`, body);
            return res.data;
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/api/auth/logout');
        },
        onSuccess: () => {
            // Clear all cached queries on logout
            queryClient.clear();
        },
    });
};
