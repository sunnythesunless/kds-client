export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    provider?: 'local' | 'google';
    isVerified: boolean;
}

export interface LoginResponse {
    success: boolean;
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface Document {
    id: string;
    workspaceId: string;
    title: string;
    type: 'SOP' | 'Policy' | 'Guide' | 'Spec' | 'Notes';
    author: string;
    currentVersion: number;
    updatedAt: string;
    createdAt: string;
}

export interface DocumentDetail extends Document {
    content: string;
    aiSummary?: string;
    keyPoints?: string[];
    versions?: DocumentVersion[];
    lastVerifiedAt?: string;
}

export interface DocumentVersion {
    id: string;
    versionNumber: number;
    summary: string;
    author: string;
    createdAt: string;
}

export interface DecayAnalysis {
    analysisId?: string;
    documentId?: string;
    decay_detected: boolean;
    confidence_score: number;
    risk_level: 'low' | 'medium' | 'high';
    decay_reasons: Array<{
        type?: string;
        description?: string; // Backend sends description? Audit said strings or objects. 
        // Audit response in route: "decayReasons": result.decay_reasons
        // The previous summary said ["Time > 90 days"] (strings). 
        // Just in case, let's type as any for now or check backend service service. 
        // Checking decayEngine output... usually structured.
        // Spec says: decay_reasons: string[] in proposal. 
        // Backend service creates DecayAnalysis model where decayReasons is JSON.
    }> | string[];

    update_recommendations: Array<{
        section: string;
        suggested_text: string;
        reasoning?: string;
    }>;
    citations?: string[];
}

export interface ChatResponse {
    id?: string;
    question?: string;
    answer: string;
    confidence?: number;
    sources: Array<{
        documentId?: string;
        title: string;
        type?: string;
        similarity?: number;
        stale?: boolean; // Inferred from warnings or explicit?
        updatedAt?: string;
    }>;
    warnings: Array<{
        type: string;
        message: string;
        documentId?: string;
    }>;
    aiEnabled: boolean;
    responseTimeMs?: number;
}

export interface DecayReport {
    id: string;
    documentId: string;
    decayDetected: boolean;
    confidenceScore: number;
    confidence_score: number; // Backend returns snake_case
    riskLevel: string;
    risk_level: string; // Backend returns snake_case
    decayReasons: any[];
    whatChangedSummary?: string;
    updateRecommendations?: any[];
    citations?: string[];
    analyzedAt: string;
    analyzedBy?: string;
    reviewStatus: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
    reviewedAt?: string;
    reviewedBy?: string;
    reviewNotes?: string;
    document?: {
        id: string;
        title: string;
        type: string;
        author?: string;
        updatedAt: string;
    };
}

export interface DecayAnalysisResults {
    analysisId: string;
    documentId: string;
    documentTitle: string;
    decay_detected: boolean;
    confidence_score: number;
    risk_level: 'low' | 'medium' | 'high';
    decay_reasons: string[];
    what_changed_summary?: string;
    update_recommendations: Array<{
        section: string;
        suggested_text: string;
        reasoning?: string;
    }>;
    citations?: string[];
}

