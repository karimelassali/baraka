"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
    CheckCircle2,
    Loader2,
    Send,
    ArrowLeft,
    MessageCircle,
    Smartphone,
    User
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
    const scrollRef = useRef(null);

    useEffect(() => {
        // Load campaign data
        const data = sessionStorage.getItem(`campaign_${params.uid}`);
        if (data) {
            setCampaign(JSON.parse(data));
        } else {
            // If no data found, redirect back
            // router.push('/admin/campaigns');
        }
    }, [params.uid]);

    useEffect(() => {
        if (!campaign || completed) return;

        const interval = setInterval(() => {
            setCurrentIdx(prev => {
                const next = prev + 1;
                if (next >= campaign.users.length) {
                    clearInterval(interval);
                    setCompleted(true);
                    return prev;
                }

                // Auto scroll to keep active user in view
                if (scrollRef.current) {
                    const activeElement = scrollRef.current.children[next];
                    if (activeElement) {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }

                return next;
            });
        }, 1500); // 1.5s per user

        return () => clearInterval(interval);
    }, [campaign, completed]);

    if (!campaign) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Campaigns
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
                                            <Send className="h-8 w-8 text-indigo-600" />
                                        </motion.div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Sending Campaign...</h2>
                                        <p className="text-muted-foreground">
                                            Processing recipient {currentIdx + 1} of {campaign.users.length}
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">Campaign Completed!</h2>
                                        <p className="text-muted-foreground">
                                            Successfully sent to {campaign.users.length} recipients.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/admin/campaigns')}
                                        className="bg-green-600 hover:bg-green-700 text-white"
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
                            <MessageCircle className="h-4 w-4 text-indigo-600" />
                            Message Content
                        </h3>
                        <div className="bg-muted/30 p-4 rounded-xl text-sm whitespace-pre-wrap border border-border/50">
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
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-medium">
                                {Math.round(((currentIdx + 1) / campaign.users.length) * 100)}%
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                            {campaign.users.map((user, idx) => {
                                const status = idx < currentIdx ? 'sent' : idx === currentIdx ? 'sending' : 'pending';

                                return (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            scale: status === 'sending' ? 1.02 : 1,
                                            backgroundColor: status === 'sending' ? 'rgba(var(--primary), 0.05)' : 'transparent'
                                        }}
                                        className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${status === 'sent'
                                            ? 'border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10'
                                            : status === 'sending'
                                                ? 'border-indigo-500 shadow-md bg-indigo-50 dark:bg-indigo-900/20'
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
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate text-sm">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {user.phone_number}
                                            </div>
                                        </div>

                                        <div className="text-xs font-medium whitespace-nowrap">
                                            {status === 'sent' && (
                                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                                    Sent <CheckCircle2 className="h-3 w-3" />
                                                </span>
                                            )}
                                            {status === 'sending' && (
                                                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
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
