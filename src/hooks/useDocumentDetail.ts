import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { DocumentDetail, DocumentVersion } from '@/lib/types';

export const useDocumentDetail = (id: string) => {
    return useQuery({
        queryKey: ['document', id],
        queryFn: async () => {
            const { data } = await api.get<DocumentDetail>(`/api/documents/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useDocumentVersions = (id: string) => {
    return useQuery({
        queryKey: ['document', id, 'versions'],
        queryFn: async () => {
            const { data } = await api.get<{ versions: DocumentVersion[] }>(`/api/documents/${id}/versions`);
            return data.versions;
        },
        enabled: !!id,
    });
};

export const useUpdateDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, content }: { id: string, content: string }) => {
            const res = await api.put(`/api/documents/${id}`, { content });
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['document', variables.id, 'versions'] });
        }
    });
}
