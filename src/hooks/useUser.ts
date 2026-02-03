import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
}

interface UpdateProfileData {
    name?: string;
    email?: string;
}

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['user', 'me'],
        queryFn: async () => {
            const { data } = await api.get<{ user: User }>('/api/users/me');
            return data.user;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateProfileData) => {
            const res = await api.put('/api/users/me', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
        },
    });
};
