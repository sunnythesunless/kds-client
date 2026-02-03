/**
 * Hooks Index
 * 
 * Central export for all API hooks.
 * Import from '@/hooks' for cleaner imports.
 */

// Auth hooks
export { useForgotPassword, useResetPassword, useLogout } from './useAuth';

// User hooks
export { useCurrentUser, useUpdateProfile } from './useUser';

// Document hooks
export {
    useDocuments,
    useDeleteDocument,
    useCreateDocument,
    useVerifyDocument
} from './useDocuments';

export {
    useDocumentDetail,
    useDocumentVersions,
    useUpdateDocument
} from './useDocumentDetail';

// Upload hooks
export { useUploadDocument, useSupportedFormats } from './useUpload';

// Decay hooks
export {
    useDecayReports,
    useDecayReportForDocument,
    useRunDecayAnalysis,
    useBatchAnalysis,
    useUpdateReviewStatus
} from './useDecay';

// Dashboard hooks
export { useDashboardStats } from './useDashboardStats';

// Chat hooks
export {
    useChatHistory,
    useSendMessage,
    useChatSearch,
    useChatFeedback,
    useChatStatus,
    type ChatMessage
} from './useChat';

// Utility hooks
export { useDebounce, useDebouncedCallback } from './useDebounce';
