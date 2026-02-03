import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { DecayAnalysisResults, DecayReport } from '@/lib/types';

interface DecayReportsResponse {
    reports: DecayReport[];
    total: number;
}

interface UseDecayReportsParams {
    limit?: number;
    offset?: number;
    riskLevel?: string;
    reviewStatus?: string;
}

export const useDecayReports = ({ limit = 20, offset = 0, riskLevel, reviewStatus }: UseDecayReportsParams = {}) => {
    return useQuery({
        queryKey: ['decay-reports', { limit, offset, riskLevel, reviewStatus }],
        queryFn: async () => {
            const params: any = { limit, offset };
            if (riskLevel) params.riskLevel = riskLevel;
            if (reviewStatus) params.reviewStatus = reviewStatus;

            const { data } = await api.get<DecayReportsResponse>('/api/decay/reports', { params });
            return data;
        },
    });
};

// Get decay report for a specific document
export const useDecayReportForDocument = (documentId: string) => {
    return useQuery({
        queryKey: ['decay-report', documentId],
        queryFn: async () => {
            const { data } = await api.get<DecayReport>(`/api/decay/reports/${documentId}`);
            return data;
        },
        enabled: !!documentId,
    });
};

export const useRunDecayAnalysis = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (docId: string) => {
            const { data } = await api.post<DecayAnalysisResults>('/api/decay/analyze', { documentId: docId });
            return data;
        },
        onSuccess: (data, docId) => {
            queryClient.invalidateQueries({ queryKey: ['decay-reports'] });
            queryClient.invalidateQueries({ queryKey: ['decay-report', docId] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['document', docId] });
        }
    });
};

export const useBatchAnalysis = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/api/decay/batch');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decay-reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};

// Update review status of a decay report
export const useUpdateReviewStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ reportId, reviewStatus, reviewNotes }: {
            reportId: string;
            reviewStatus: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
            reviewNotes?: string;
        }) => {
            const { data } = await api.put(`/api/decay/reports/${reportId}/review`, {
                reviewStatus,
                reviewNotes
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decay-reports'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });
};
