import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export interface DashboardStats {
    totalDocuments: number;
    analyzedDocuments?: number; // How many documents have been analyzed
    decayDetected: number;
    byRiskLevel: {
        high: number;
        medium: number;
        low: number;
    };
    byReviewStatus: {
        pending: number;
        reviewed: number;
        dismissed: number;
        actioned: number;
    };
    averageConfidence: number;
}

export const useDashboardStats = (workspaceId?: string) => {
    return useQuery({
        queryKey: ['dashboard-stats', workspaceId],
        queryFn: async () => {
            const params = workspaceId ? { workspaceId } : {};
            const { data } = await api.get<DashboardStats>('/api/decay/summary', { params });
            return data;
        },
        refetchInterval: 30000, // Refresh every 30s
    });
};
