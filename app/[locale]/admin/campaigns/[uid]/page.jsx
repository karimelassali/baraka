"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    CheckCircle2,
    Loader2,
    Send,
    ArrowLeft,
    MessageSquare,
    User,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { getAvatarUrl } from '@/lib/avatar';

export default function CampaignExecutionPage() {
    const params = useParams();
    const router = useRouter();
    const [campaign, setCampaign] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(-1);
    const [completed, setCompleted] = useState(false);
    const [results, setResults] = useState([]); // Track individual results
    const [stats, setStats] = useState({ sent: 0, failed: 0 });
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);
    const sendingRef = useRef(false); // Prevent double-sending

    useEffect(() => {
        // Load campaign data
        const data = sessionStorage.getItem(`campaign_${params.uid}`);
        if (data) {
            const parsed = JSON.parse(data);

            // Safety Check: Ensure users array exists (handles corrupted session data)
            if (!parsed.users || !Array.isArray(parsed.users)) {
                console.error("Campaign data missing users:", parsed);
                router.push('/admin/campaigns');
                return;
            }

            setCampaign(parsed);
            // Initialize results array
            setResults(parsed.users.map(u => ({ id: u.id, status: 'pending' })));
        } else {
            // If no data found, redirect back
            router.push('/admin/campaigns');
        }
    }, [params.uid, router]);

    // Function to send SMS to a single user
    const sendSmsToUser = useCallback(async (user, message, imageUrl) => {
        try {
            const response = await fetch('/api/admin/campaigns/send-one', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: user.phone_number,
                    message: message,
                    customerId: user.id,
                    customerName: `${user.first_name} ${user.last_name}`,
                    imageUrl: imageUrl // Pass Optional Image
                }),
            });

            const result = await response.json();
            return { success: result.success, error: result.error || null };
        } catch (error) {
            console.error(`Error sending to ${user.phone_number}:`, error);
            return { success: false, error: error.message };
        }
    }, []);

    // Start sending when campaign is loaded
    useEffect(() => {
        if (!campaign || isSending || sendingRef.current) return;

        const startSending = async () => {
            if (sendingRef.current) return;
            sendingRef.current = true;
            setIsSending(true);

            for (let i = 0; i < campaign.users.length; i++) {
                const user = campaign.users[i];

                // Update current index to show "sending" state
                setCurrentIdx(i);

                // Auto scroll to keep active user in view
                if (scrollRef.current && scrollRef.current.children[i]) {
                    scrollRef.current.children[i].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }

                // Actually send the SMS
                const result = await sendSmsToUser(user, campaign.message, campaign.imageUrl);

                // Update results with error message if failed
                setResults(prev => {
                    const updated = [...prev];
                    updated[i] = {
                        id: user.id,
                        status: result.success ? 'sent' : 'failed',
                        error: result.error
                    };
                    return updated;
                });

                // Update stats
                setStats(prev => ({
                    sent: result.success ? prev.sent + 1 : prev.sent,
                    failed: result.success ? prev.failed : prev.failed + 1
                }));

                // Small delay before next to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            setCompleted(true);
            setIsSending(false);

            // Clean up sessionStorage
            sessionStorage.removeItem(`campaign_${params.uid}`);
        };

        startSending();
    }, [campaign, isSending, sendSmsToUser, params.uid]);

    // Get status for a user
    const getUserStatus = (idx) => {
        if (idx < currentIdx) return results[idx]?.status || 'pending';
        if (idx === currentIdx && !completed) return 'sending';
        return 'pending';
    };

    if (!campaign) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/admin/campaigns')}
                    className="gap-2"
                    disabled={isSending}
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isSending ? 'Sending in progress...' : 'Back to Campaigns'}
                </Button>
                <div className="text-sm text-muted-foreground font-mono">
                    ID: {params.uid}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Animation & Status */}
                <div className="space-y-6">
                    <GlassCard className="p-8 text-center space-y-6 min-h-[400px] flex flex-col items-center justify-center">
                        <AnimatePresence mode="wait">
                            {!completed ? (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="space-y-6"
                                >
                                    <div className="relative w-64 h-64 mx-auto">
                                        <img
                                            src="/illus/undraw_processing_bto8.svg"
                                            alt="Processing"
                                            className="w-full h-full object-contain"
                                        />
                                        <motion.div
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-4 rounded-full shadow-xl"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <Send className="h-8 w-8 text-blue-600" />
                                        </motion.div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">📱 Sending SMS...</h2>
                                        <p className="text-muted-foreground">
                                            Sending to recipient {currentIdx + 1} of {campaign.users.length}
                                        </p>
                                        <div className="mt-4 flex justify-center gap-4 text-sm">
                                            <span className="text-green-600 flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4" /> {stats.sent} sent
                                            </span>
                                            {stats.failed > 0 && (
                                                <span className="text-red-600 flex items-center gap-1">
                                                    <XCircle className="h-4 w-4" /> {stats.failed} failed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className={`w-32 h-32 ${stats.failed === 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                        {stats.failed === 0 ? (
                                            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <AlertTriangle className="h-16 w-16 text-amber-600 dark:text-amber-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-bold mb-2 ${stats.failed === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                            Campaign Completed!
                                        </h2>
                                        <p className="text-muted-foreground">
                                            ✅ {stats.sent} sent successfully
                                            {stats.failed > 0 && <>, ❌ {stats.failed} failed</>}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/admin/campaigns')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Start New Campaign
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </GlassCard>

                    {/* Message Preview */}
                    <GlassCard className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                            SMS Message
                        </h3>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-sm whitespace-pre-wrap border border-blue-200 dark:border-blue-800">
                            {campaign.message}
                        </div>
                    </GlassCard>
                </div>

                {/* Right Column: User List */}
                <div className="h-[calc(100vh-200px)] sticky top-6">
                    <GlassCard className="h-full flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
                            <h3 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Recipients Queue
                            </h3>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
                                {Math.round(((currentIdx + 1) / campaign.users.length) * 100)}%
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                            {campaign.users.map((user, idx) => {
                                const status = getUserStatus(idx);
                                const errorReason = results[idx]?.error;

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            scale: status === 'sending' ? 1.02 : 1,
                                        }}
                                        className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${status === 'sent'
                                            ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10'
                                            : status === 'failed'
                                                ? 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10'
                                                : status === 'sending'
                                                    ? 'border-blue-500 shadow-md bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-border/50 bg-muted/10 opacity-60'
                                            }`}
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={getAvatarUrl(user.first_name)}
                                                    alt={user.first_name}
                                                    className="w-full h-full"
                                                />
                                            </div>
                                            {status === 'sent' && (
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
                                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            {status === 'failed' && (
                                                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-white dark:border-gray-900">
                                                    <XCircle className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate text-sm">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {user.phone_number}
                                            </div>
                                            {status === 'failed' && errorReason && (
                                                <div className="text-xs text-red-500 truncate mt-0.5" title={errorReason}>
                                                    ⚠️ {errorReason.length > 50 ? errorReason.substring(0, 50) + '...' : errorReason}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-xs font-medium whitespace-nowrap">
                                            {status === 'sent' && (
                                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                                    Sent <CheckCircle2 className="h-3 w-3" />
                                                </span>
                                            )}
                                            {status === 'failed' && (
                                                <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                                    Failed <XCircle className="h-3 w-3" />
                                                </span>
                                            )}
                                            {status === 'sending' && (
                                                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                    Sending <Loader2 className="h-3 w-3 animate-spin" />
                                                </span>
                                            )}
                                            {status === 'pending' && (
                                                <span className="text-muted-foreground">Pending</span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
