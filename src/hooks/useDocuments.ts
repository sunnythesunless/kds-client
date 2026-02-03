import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Document } from '@/lib/types';

interface DocumentsResponse {
    documents: Document[];
    total: number;
    limit: number;
    offset: number;
}

interface UseDocumentsParams {
    workspaceId?: string;
    type?: string;     // 'SOP', 'Policy', etc.
    page?: number;
    limit?: number;
}

interface CreateDocumentData {
    workspaceId: string;
    title: string;
    content: string;
    type?: 'SOP' | 'Policy' | 'Guide' | 'Spec' | 'Notes';
}

export const useDocuments = ({ workspaceId, type, page = 1, limit = 10 }: UseDocumentsParams) => {
    return useQuery({
        queryKey: ['documents', { workspaceId, type, page, limit }],
        queryFn: async () => {
            const offset = (page - 1) * limit;
            const params: any = { limit, offset };
            if (workspaceId) params.workspaceId = workspaceId;
            if (type && type !== 'ALL') params.type = type;

            const { data } = await api.get<DocumentsResponse>('/api/documents', { params });
            return data;
        },
        placeholderData: (prev) => prev, // Keep previous data while fetching new page
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/api/documents/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    })
}

export const useCreateDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateDocumentData) => {
            const res = await api.post<Document>('/api/documents', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

export const useVerifyDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await api.post(`/api/documents/${id}/verify`);
            return res.data;
        },
        onSuccess: (data, id) => {
            queryClient.invalidateQueries({ queryKey: ['document', id] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        }
    });
};
