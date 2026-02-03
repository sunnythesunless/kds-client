import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface UploadResponse {
    id: string;
    title: string;
    type: string;
    author: string;
    workspaceId: string;
    contentLength: number;
    ai: {
        summary: string;
        keyPoints: string[];
        topics: string[];
        aiGenerated: boolean;
    };
    metadata: {
        originalFilename: string;
        fileSize: number;
    };
    createdAt: string;
}

interface SupportedFormat {
    extension: string;
    mimeType: string;
    maxSize: string;
}

interface SupportedFormatsResponse {
    supportedFormats: SupportedFormat[];
    maxFileSize: number;
}

// Upload a document file
export const useUploadDocument = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ file, workspaceId, type, title }: {
            file: File;
            workspaceId: string;
            type?: string;
            title?: string;
        }) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('workspaceId', workspaceId);
            if (type) formData.append('type', type);
            if (title) formData.append('title', title);

            const { data } = await api.post<UploadResponse>('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

// Get supported file formats
export const useSupportedFormats = () => {
    return useQuery({
        queryKey: ['upload-supported-formats'],
        queryFn: async () => {
            const { data } = await api.get<SupportedFormatsResponse>('/api/upload/supported');
            return data;
        },
        staleTime: 60 * 60 * 1000, // 1 hour - these rarely change
    });
};
