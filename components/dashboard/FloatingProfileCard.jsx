"use client";

import { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { QrCode, X, Maximize2, Minimize2, Scan, Barcode as BarcodeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingProfileCard({ user, profile, labels }) {
    // Use passed labels or fallback to simple English
    const memberLabel = labels?.member || "Member";
    const scanLabel = labels?.scanAtRegister || "Scan at Register";

    const [isOpen, setIsOpen] = useState(false);
    const [isBright, setIsBright] = useState(false);

    // Toggle brightness effect
    useEffect(() => {
        if (isOpen) {
            // Simulate max brightness by using a white overlay and potentially CSS filters
            setIsBright(true);
        } else {
            setIsBright(false);
        }
    }, [isOpen]);

    if (!user) return null;

    // Prefer profile data (db) over user_metadata (auth)
    const firstName = profile?.first_name || user.user_metadata?.first_name || "";
    const lastName = profile?.last_name || user.user_metadata?.last_name || "";
    const displayName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || memberLabel);

    // The value to scan. In admin/scan it looks up by ID or barcode_value (first 12 chars of stripped ID). 
    // We use the shorter barcode_value for better scanability.
    const scanValue = profile?.barcode_value || user.id.toUpperCase().replace(/-/g, '').substring(0, 12);

    return (
        <>
            {/* Brightness Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Modal Card Container */}
            <div className={`fixed inset-0 z-[70] pointer-events-none flex items-center justify-center ${!isOpen ? 'hidden' : ''}`}>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 flex flex-col items-center gap-8 w-auto h-auto max-h-[90vh] relative overflow-visible ring-4 ring-black/5 pointer-events-auto mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            {/* Rotated Barcode Section - Placed in a fixed height container to handle rotation space cleanly */}
                            <div className="relative w-64 h-[400px] flex items-center justify-center shrink-0">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="transform rotate-90 origin-center p-4 bg-white shadow-sm border-2 border-dashed border-gray-200 rounded-lg">
                                        <Barcode
                                            value={scanValue}
                                            width={2.2}
                                            height={100}
                                            format="CODE128"
                                            displayValue={false}
                                            background="#ffffff"
                                            lineColor="#000000"
                                            margin={10}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Text Info Section - Moved to bottom */}
                            <div className="flex flex-col justify-center w-full z-10 text-center pb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate px-2 max-w-[300px] mx-auto">
                                    {displayName}
                                </h3>
                                <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 py-2 px-4 rounded-full w-fit mx-auto">
                                    <Scan className="w-4 h-4" />
                                    {scanLabel}
                                </div>
                            </div>

                            {/* Close Button Mobile */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-3 right-3 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 z-20"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Action Button */}
            <div id="floating-barcode-btn" className="fixed bottom-24 lg:bottom-6 right-8 md:right-6 z-[70] flex flex-col items-end gap-4 pointer-events-auto">
                <motion.button
                    layout
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-colors ${isOpen ? "bg-gray-900 text-white" : "bg-red-600 text-white"}`}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <BarcodeIcon className="w-6 h-6" />}
                </motion.button>
            </div>
        </>
    );
}
