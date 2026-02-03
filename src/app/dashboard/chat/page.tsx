"use client";

import { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { useSendMessage, useChatFeedback, useChatStatus, useChatHistory, ChatMessage } from '@/hooks/useChat';
import {
    Send,
    Bot,
    User,
    Sparkles,
    AlertTriangle,
    FileText,
    Loader2,
    MessageCircle,
    Zap,
    ThumbsUp,
    ThumbsDown,
    CheckCircle2
} from 'lucide-react';
import { clsx } from 'clsx';

interface MessageWithId extends ChatMessage {
    id?: string;
    feedbackGiven?: boolean;
}

// Isolated input component - prevents parent re-renders on typing
const ChatInput = memo(function ChatInput({
    onSend,
    isPending,
    initialValue = ''
}: {
    onSend: (message: string) => void;
    isPending: boolean;
    initialValue?: string;
}) {
    const [localInput, setLocalInput] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync initial value when it changes (e.g., from suggested questions)
    useEffect(() => {
        if (initialValue) {
            setLocalInput(initialValue);
            // Focus the input after setting value
            inputRef.current?.focus();
        }
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!localInput.trim() || isPending) return;
        onSend(localInput);
        setLocalInput('');
    };

    return (
        <div className="p-4 bg-slate-900/50 border-t border-white/5">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    placeholder="Ask anything about your documents..."
                    className="w-full bg-slate-800/50 border border-white/10 hover:border-white/20 focus:border-purple-500/50 rounded-2xl pl-5 pr-14 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 placeholder:text-slate-500"
                />
                <button
                    type="submit"
                    disabled={!localInput.trim() || isPending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-400 disabled:opacity-40 disabled:from-slate-700 disabled:to-slate-700 transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:shadow-none"
                >
                    <Send size={18} />
                </button>
            </form>
            <p className="text-center text-xs text-slate-500 mt-3">
                Responses are generated from your uploaded documents
            </p>
        </div>
    );
});

// Memoized message bubble - prevents re-renders of unchanged messages
const MessageBubble = memo(function MessageBubble({
    msg,
    onFeedback,
    isFeedbackPending
}: {
    msg: MessageWithId;
    onFeedback: (id: string, feedback: 'helpful' | 'not_helpful') => void;
    isFeedbackPending: boolean;
}) {
    return (
        <div className={clsx(
            "flex gap-4",
            msg.role === 'user' ? "justify-end" : "justify-start"
        )}>
            {/* Avatar - Only for assistant */}
            {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                    <Bot size={20} className="text-white" />
                </div>
            )}

            {/* Message Bubble */}
            <div className={clsx(
                "max-w-[70%] rounded-2xl p-4",
                msg.role === 'user'
                    ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-br-md shadow-lg shadow-purple-500/20"
                    : "bg-slate-800/80 text-slate-100 border border-white/10 rounded-bl-md"
            )}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {typeof msg.content === 'string' ? msg.content : msg.content?.message || JSON.stringify(msg.content)}
                </p>

                {/* Warnings */}
                {msg.warnings && msg.warnings.length > 0 && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={14} className="text-amber-400" />
                            <span className="text-amber-400 text-xs font-semibold uppercase tracking-wide">Warning</span>
                        </div>
                        <ul className="space-y-1">
                            {msg.warnings.map((w, i) => (
                                <li key={i} className="text-xs text-amber-200/80 flex items-start gap-2">
                                    <span className="text-amber-400 mt-1">•</span>
                                    {typeof w === 'string' ? w : w?.message || JSON.stringify(w)}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                            <FileText size={12} />
                            Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-xs text-slate-300 border border-white/5 flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                    <FileText size={12} className="text-purple-400" />
                                    {src.title}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback Buttons - Only for assistant with ID */}
                {msg.role === 'assistant' && msg.id && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                        {msg.feedbackGiven ? (
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <CheckCircle2 size={14} />
                                Thanks for your feedback!
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Was this helpful?</span>
                                <button
                                    onClick={() => onFeedback(msg.id!, 'helpful')}
                                    disabled={isFeedbackPending}
                                    className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 transition-colors"
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                <button
                                    onClick={() => onFeedback(msg.id!, 'not_helpful')}
                                    disabled={isFeedbackPending}
                                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                                >
                                    <ThumbsDown size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Avatar - Only for user */}
            {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center shrink-0">
                    <User size={20} className="text-slate-300" />
                </div>
            )}
        </div>
    );
});

export default function ChatPage() {
    const [messages, setMessages] = useState<MessageWithId[]>([]);
    const [suggestedInput, setSuggestedInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const sendMessage = useSendMessage();
    const chatFeedback = useChatFeedback();
    const { data: chatStatus } = useChatStatus();
    const { data: history, isLoading: isLoadingHistory } = useChatHistory();

    // Load history when available - use transition to avoid blocking
    useEffect(() => {
        if (history && history.length > 0) {
            // Transform history items (question/answer pairs) into flat message list
            // API returns newest first, so we reverse to show oldest first (chronological)
            const formattedMessages: MessageWithId[] = history
                .slice()
                .reverse()
                .flatMap(item => [
                    {
                        role: 'user',
                        content: item.question
                    },
                    {
                        id: item.id,
                        role: 'assistant',
                        content: item.answer,
                        sources: item.sources,
                        warnings: item.warnings,
                        feedbackGiven: !!item.feedback
                    }
                ]);
            // Use functional update to batch with React
            setMessages(formattedMessages);
        }
    }, [history]);

    // Scroll to bottom - use RAF to avoid forced reflow
    useEffect(() => {
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            });
        }
    }, [messages, isLoadingHistory]);

    // Now accepts message directly from ChatInput component
    const handleSend = useCallback(async (messageText: string) => {
        if (!messageText.trim() || sendMessage.isPending) return;

        // Clear suggested input after sending
        setSuggestedInput('');

        const userMsg: MessageWithId = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMsg]);

        try {
            const response = await sendMessage.mutateAsync(messageText);

            const aiMsg: MessageWithId = {
                id: response.id,
                role: 'assistant',
                content: response.answer,
                sources: response.sources,
                warnings: response.warnings,
                feedbackGiven: false
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: MessageWithId = {
                role: 'assistant',
                content: "I'm having trouble connecting to the Neural Core. Please try again."
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    }, [sendMessage]);

    const handleFeedback = useCallback(async (msgId: string, feedback: 'helpful' | 'not_helpful') => {
        try {
            await chatFeedback.mutateAsync({ id: msgId, feedback });
            setMessages(prev => prev.map(msg =>
                msg.id === msgId ? { ...msg, feedbackGiven: true } : msg
            ));
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        }
    }, [chatFeedback]);

    const suggestedQuestions = useMemo(() => [
        "What are our security protocols?",
        "Summarize the latest policy updates",
        "What's the onboarding process?"
    ], []);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
                        <MessageCircle className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            InsightOps Chat
                            <span className={clsx(
                                "px-2 py-0.5 rounded-full text-xs font-medium border",
                                chatStatus?.aiEnabled
                                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30"
                                    : "bg-slate-700/50 text-slate-400 border-slate-600"
                            )}>
                                {chatStatus?.aiEnabled ? 'AI Powered' : 'Basic Mode'}
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm">Ask questions about your documents, SOPs, and policies</p>
                    </div>
                </div>
            </div>

            {/* Main Chat Container */}
            <div className="flex-1 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl shadow-purple-500/5">

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoadingHistory ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500">
                            <Loader2 className="animate-spin text-purple-500" size={32} />
                            <p className="text-xs font-mono">RESTORING HISTORY...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-6 py-12">
                            {/* Empty State Icon */}
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center border border-purple-500/20">
                                    <Bot size={48} className="text-purple-400" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                    <Zap size={16} className="text-white" />
                                </div>
                            </div>

                            <div className="text-center max-w-md">
                                <h2 className="text-xl font-semibold text-white mb-2">Ready to help you</h2>
                                <p className="text-slate-400 text-sm">
                                    I can answer questions about your uploaded documents, find specific information, and provide insights from your knowledge base.
                                </p>
                            </div>

                            {/* Suggested Questions */}
                            <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-2">
                                {suggestedQuestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSuggestedInput(q)}
                                        className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 hover:border-purple-500/30 rounded-xl text-sm text-slate-300 hover:text-white transition-all duration-200"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <MessageBubble
                                key={msg.id || idx}
                                msg={msg}
                                onFeedback={handleFeedback}
                                isFeedbackPending={chatFeedback.isPending}
                            />
                        ))
                    )}

                    {/* Loading State with Bouncing Dots */}
                    {sendMessage.isPending && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20 animate-pulse">
                                <Loader2 className="animate-spin text-white" size={20} />
                            </div>
                            <div className="bg-slate-800/80 border border-white/10 rounded-2xl rounded-bl-md p-4 flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                                    <span className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                                </div>
                                <span className="text-sm text-slate-400">Analyzing your documents...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area - Isolated component to prevent re-renders */}
                <ChatInput
                    onSend={handleSend}
                    isPending={sendMessage.isPending}
                    initialValue={suggestedInput}
                />
            </div>
        </div>
    );
}
