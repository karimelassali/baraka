"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { X, Gift } from 'lucide-react';
import { Button } from '../ui/button';

export default function PopupOffer() {
    const [popupOffer, setPopupOffer] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [hasSeenPopup, setHasSeenPopup] = useState(false);
    const locale = useLocale();

    useEffect(() => {
        // Check if user has seen the popup in the last 4 hours
        const lastSeen = localStorage.getItem('popupLastSeen');
        if (lastSeen) {
            const timeDiff = new Date().getTime() - parseInt(lastSeen);
            if (timeDiff < 4 * 60 * 60 * 1000) { // 4 hours
                setHasSeenPopup(true);
                return;
            }
        }

        const fetchPopupOffer = async () => {
            try {
                const response = await fetch(`/api/offers?locale=${locale}&is_popup=true`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.offers && data.offers.length > 0) {
                        setPopupOffer(data.offers[0]);
                        // Delay opening slightly for better UX
                        setTimeout(() => setIsOpen(true), 2000);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch popup offer:', error);
            }
        };

        fetchPopupOffer();
    }, [locale]);

    const handleClose = () => {
        setIsOpen(false);
        setHasSeenPopup(true);
        localStorage.setItem('popupLastSeen', new Date().getTime().toString());
    };

    if (!popupOffer || hasSeenPopup) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-[#D4AF37]"
                    >
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]" />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-full text-white z-10 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Image Section */}
                        <div className="relative h-56 sm:h-64 bg-gray-100">
                            {popupOffer.image_url ? (
                                <img
                                    src={popupOffer.image_url}
                                    alt={popupOffer.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#D4AF37]/10 text-[#D4AF37]">
                                    <Gift className="h-16 w-16 opacity-50" />
                                </div>
                            )}
                            {popupOffer.badge_text && (
                                <div className="absolute top-4 left-4 bg-[#D4AF37] text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                    <Gift className="h-3 w-3" />
                                    {popupOffer.badge_text}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 text-center bg-gradient-to-b from-white to-gray-50">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                                {popupOffer.title}
                            </h3>
                            <p className="text-gray-600 mb-6 line-clamp-3">
                                {popupOffer.description}
                            </p>

                            <Button
                                onClick={() => {
                                    const message = encodeURIComponent(`Hello Baraka! I'm interested in the offer: ${popupOffer.title}`);
                                    window.open(`https://wa.me/393245668944?text=${message}`, '_blank');
                                    handleClose();
                                }}
                                className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                <Gift className="h-5 w-5" />
                                Claim Offer on WhatsApp
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
