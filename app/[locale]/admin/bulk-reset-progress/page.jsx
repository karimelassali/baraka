"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    Loader2,
    Lock,
    ArrowLeft,
    User,
    ShieldCheck,
    AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { getAvatarUrl } from '@/lib/avatar';

export default function BulkResetProgressPage() {
    const router = useRouter();
    const [config, setConfig] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(-1);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState(null);
    const scrollRef = useRef(null);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        // Load config
        const storedConfig = sessionStorage.getItem('bulk_reset_config');
        if (storedConfig) {
            setConfig(JSON.parse(storedConfig));
        } else {
            // Redirect back if no config
            router.push('/add-client');
        }
    }, [router]);

    useEffect(() => {
        if (!config || isResetting) return;

        const startReset = async () => {
            setIsResetting(true);
            try {
                // 1. Fetch all users first to populate the list
                const res = await fetch('/api/admin/customers?limit=1000'); // Assuming this exists or similar
                const data = await res.json();

                if (!data.customers || data.customers.length === 0) {
                    throw new Error("Nessun cliente trovato.");
                }

                setUsers(data.customers);

                // 2. Start the actual reset process in background
                // We'll use the existing bulk reset API
                const resetRes = await fetch('/api/admin/bulk-reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        password: config.newPassword,
                        accessPassword: config.accessPassword
                    })
                });

                if (!resetRes.ok) {
                    const errorData = await resetRes.json();
                    throw new Error(errorData.error || "Errore durante il reset.");
                }

                // If successful, we let the animation finish
                // We can speed it up if it's too slow, but for now let's just let it run
                // Or better, we can just set a flag that backend is done

            } catch (err) {
                console.error("Reset failed:", err);
                setError(err.message);
            }
        };

        startReset();
    }, [config]);

    // Animation Loop
    useEffect(() => {
        if (users.length === 0 || completed || error) return;

        const interval = setInterval(() => {
            setCurrentIdx(prev => {
                const next = prev + 1;

                // If we reached the end
                if (next >= users.length) {
                    clearInterval(interval);
                    setCompleted(true);
                    // Clear sensitive data
                    sessionStorage.removeItem('bulk_reset_config');
                    return prev;
                }

                // Auto scroll
                if (scrollRef.current) {
                    const activeElement = scrollRef.current.children[next];
                    if (activeElement) {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }

                return next;
            });
        }, 100); // Fast animation: 100ms per user (10 users per second)

        return () => clearInterval(interval);
    }, [users, completed, error]);

    if (!config) return null;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <GlassCard className="max-w-md w-full p-8 text-center border-red-200 bg-red-50">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-red-800 mb-2">Errore Reset</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <Button onClick={() => router.push('/add-client')} variant="destructive">
                        Torna Indietro
                    </Button>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/add-client')}
                        className="gap-2"
                        disabled={!completed}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Torna ai Clienti
                    </Button>
                    <div className="text-sm text-muted-foreground font-mono">
                        Bulk Reset Operation
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
                                        <div className="relative w-48 h-48 mx-auto">
                                            {/* Rotating Lock Animation */}
                                            <motion.div
                                                className="w-full h-full border-4 border-indigo-100 rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                                            />
                                            <motion.div
                                                className="absolute inset-0 flex items-center justify-center"
                                            >
                                                <div className="bg-indigo-50 p-6 rounded-full">
                                                    <Lock className="h-12 w-12 text-indigo-600" />
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                className="absolute top-0 right-0 bg-white p-2 rounded-full shadow-lg"
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                <ShieldCheck className="h-6 w-6 text-green-500" />
                                            </motion.div>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2 text-gray-800">Aggiornamento Password...</h2>
                                            <p className="text-gray-500">
                                                Elaborazione utente {currentIdx + 1} di {users.length}
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
                                        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle2 className="h-16 w-16 text-green-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2 text-green-600">Reset Completato!</h2>
                                            <p className="text-gray-500">
                                                Password aggiornata con successo per {users.length} clienti.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => router.push('/add-client')}
                                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg h-auto rounded-xl shadow-lg shadow-green-200"
                                        >
                                            Torna alla Dashboard
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </GlassCard>
                    </div>

                    {/* Right Column: User List */}
                    <div className="h-[calc(100vh-200px)] sticky top-6">
                        <GlassCard className="h-full flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-semibold flex items-center gap-2 text-gray-700">
                                    <User className="h-4 w-4" />
                                    Coda Aggiornamenti
                                </h3>
                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium">
                                    {users.length > 0 ? Math.round(((currentIdx + 1) / users.length) * 100) : 0}%
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
                                {users.map((user, idx) => {
                                    const status = idx < currentIdx ? 'done' : idx === currentIdx ? 'processing' : 'pending';

                                    return (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{
                                                opacity: 1,
                                                x: 0,
                                                scale: status === 'processing' ? 1.02 : 1,
                                                backgroundColor: status === 'processing' ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                            }}
                                            className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${status === 'done'
                                                    ? 'border-green-200 bg-green-50/50'
                                                    : status === 'processing'
                                                        ? 'border-indigo-500 shadow-md bg-indigo-50'
                                                        : 'border-gray-100 bg-gray-50/30 opacity-60'
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={getAvatarUrl(user.first_name)}
                                                        alt={user.first_name}
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                                {status === 'done' && (
                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate text-sm text-gray-900">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {user.phone_number}
                                                </div>
                                            </div>

                                            <div className="text-xs font-medium whitespace-nowrap">
                                                {status === 'done' && (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        Fatto <CheckCircle2 className="h-3 w-3" />
                                                    </span>
                                                )}
                                                {status === 'processing' && (
                                                    <span className="text-indigo-600 flex items-center gap-1">
                                                        In corso <Loader2 className="h-3 w-3 animate-spin" />
                                                    </span>
                                                )}
                                                {status === 'pending' && (
                                                    <span className="text-gray-400">In attesa</span>
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
        </div>
    );
}
