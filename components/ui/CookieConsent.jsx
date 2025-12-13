"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Cookie, ShieldCheck, Settings } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('baraka_cookie_consent');
        if (!consent) {
            // Add a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('baraka_cookie_consent', 'accepted_all');
        setIsVisible(false);
        // Here you would typically initialize analytics/pixels
    };

    const handleRejectAll = () => {
        localStorage.setItem('baraka_cookie_consent', 'rejected_all');
        setIsVisible(false);
    };

    const handleSavePreferences = (prefs) => {
        localStorage.setItem('baraka_cookie_consent', JSON.stringify(prefs));
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                    className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-4 md:max-w-md"
                >
                    <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-6 overflow-hidden relative">
                        {/* Background decoration */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                        {!showDetails ? (
                            // Main View
                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-50 rounded-xl text-red-600">
                                            <Cookie className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Informativa sui Cookie</h3>
                                    </div>
                                    <button
                                        onClick={handleRejectAll}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        aria-label="Chiudi e rifiuta"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                                    Noi e terze parti selezionate utilizziamo cookie o tecnologie simili per finalità tecniche e, con il tuo consenso, anche per altre finalità come specificato nella <Link href="/privacy" className="text-red-600 hover:underline font-medium">cookie policy</Link>.
                                    Il rifiuto del consenso può rendere non disponibili le relative funzioni.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAcceptAll}
                                            className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95 text-sm"
                                        >
                                            Accetta tutti
                                        </button>
                                        <button
                                            onClick={handleRejectAll}
                                            className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95 text-sm"
                                        >
                                            Rifiuta tutti
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowDetails(true)}
                                        className="text-xs text-gray-500 hover:text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors text-center mt-1"
                                    >
                                        Personalizza preferenze
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Details/Preferences View
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                                    >
                                        ← Indietro
                                    </button>
                                    <h3 className="text-lg font-bold text-gray-900 ml-auto">Preferenze</h3>
                                </div>

                                <div className="space-y-4 mb-6 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm text-gray-900">Necessari</span>
                                                <span className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Sempre attivi</span>
                                            </div>
                                            <p className="text-xs text-gray-500">Questi cookie sono indispensabili per il funzionamento del sito.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 opacity-60 cursor-not-allowed">
                                        <Settings className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm text-gray-900">Analitici & Marketing</span>
                                                <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200">
                                                    <span className="inline-block h-3 w-3 transform rounded-full bg-white transition translate-x-1" />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">Permettono di analizzare l'uso del sito e mostrare contenuti personalizzati. (Disabilitati in questa demo)</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleRejectAll}
                                        className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95 text-sm"
                                    >
                                        Salva selezione
                                    </button>
                                    <button
                                        onClick={handleAcceptAll}
                                        className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-900/20 active:scale-95 text-sm"
                                    >
                                        Accetta tutti
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
