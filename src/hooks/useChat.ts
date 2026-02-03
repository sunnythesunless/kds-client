import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string | { type?: string; message?: string };
    sources?: any[];
    warnings?: (string | { type?: string; message?: string })[];
}

interface ChatHistoryItem {
    id: string;
    question: string;
    answer: string;
    confidence?: number;
    sources: any[];
    warnings: any[];
    feedback?: 'helpful' | 'not_helpful';
    responseTimeMs?: number;
    createdAt: string;
}

interface ChatStatusResponse {
    aiEnabled: boolean;
    provider: string;
    capabilities: string[];
}

interface SearchResult {
    documentId: string;
    title: string;
    type: string;
    similarity: number;
    excerpt?: string;
}

// Chat history expiry time (20 minutes)
const CHAT_EXPIRY_MS = 20 * 60 * 1000;

export const useChatHistory = (workspaceId: string = 'default-workspace') => {
    return useQuery({
        queryKey: ['chat-history', workspaceId],
        queryFn: async () => {
            const { data } = await api.get<{ history: ChatHistoryItem[]; count: number }>('/api/chat/history', {
                params: { workspaceId }
            });
            // Filter out messages older than 20 minutes (client-side double-check)
            const now = Date.now();
            const recentHistory = (data.history || []).filter(item => {
                const createdTime = new Date(item.createdAt).getTime();
                return (now - createdTime) < CHAT_EXPIRY_MS;
            });
            return recentHistory;
        },
        enabled: !!workspaceId,
        staleTime: 30 * 1000, // Refresh every 30 seconds
        refetchInterval: 60 * 1000, // Auto-refetch every minute to clear old messages
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (message: string) => {
            const { data } = await api.post('/api/chat', {
                question: message,
                workspaceId: 'default-workspace' // TODO: Get from workspace context
            });
            return data; // { answer, sources, warnings }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-history'] });
        },
    });
};

// Search documents semantically
export const useChatSearch = () => {
    return useMutation({
        mutationFn: async ({ query, workspaceId = 'default-workspace', limit = 5 }: {
            query: string;
            workspaceId?: string;
            limit?: number;
        }) => {
            const { data } = await api.post<{ query: string; results: SearchResult[]; count: number }>('/api/chat/search', {
                query,
                workspaceId,
                limit
            });
            return data;
        },
    });
};

// Submit feedback for a chat response
export const useChatFeedback = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, feedback }: { id: string; feedback: 'helpful' | 'not_helpful' }) => {
            const { data } = await api.put(`/api/chat/${id}/feedback`, { feedback });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-history'] });
        },
    });
};

// Check AI/Chat status
export const useChatStatus = () => {
    return useQuery({
        queryKey: ['chat-status'],
        queryFn: async () => {
            const { data } = await api.get<ChatStatusResponse>('/api/chat/status');
            return data;
        },
        staleTime: 60 * 1000, // 1 minute
    });
};
