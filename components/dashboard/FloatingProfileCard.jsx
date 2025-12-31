"use client";

import { useState, useMemo } from "react";
import Barcode from "react-barcode";
import { X, Scan, Barcode as BarcodeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingProfileCard({ user, profile, labels }) {
    // Use passed labels or fallback to simple English
    const memberLabel = labels?.member || "Member";
    const scanLabel = labels?.scanAtRegister || "Scan at Register";

    const [isOpen, setIsOpen] = useState(false);

    // Prefer profile data (db) over user_metadata (auth)
    const firstName = profile?.first_name || user?.user_metadata?.first_name || "";
    const lastName = profile?.last_name || user?.user_metadata?.last_name || "";
    // Robust display name generation
    const displayName = (firstName || lastName)
        ? `${firstName} ${lastName}`.trim()
        : (user?.email?.split('@')[0] || memberLabel);

    // The value to scan. In admin/scan it looks up by ID or barcode_value.
    // We use the first 8 characters of the UUID (Short Code) which matches the API's prefix search logic.
    // Memoized to prevent recalculation on renders
    const scanValue = useMemo(() => {
        if (!user) return "";
        // If a custom barcode is set, use it. Otherwise, use the first 8 chars of the UUID.
        // The API /api/admin/scan/user specifically handles this 8-char UUID prefix.
        return profile?.barcode_value || user.id.split('-')[0].toUpperCase();
    }, [profile, user]);

    if (!user) return null;

    return (
        <>
            <AnimatePresence mode="wait">
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[60] bg-black/60 touch-none"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 z-[70] pointer-events-none flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 flex flex-col items-center w-full max-w-[320px] relative overflow-hidden pointer-events-auto ring-1 ring-black/5"
                                onClick={(e) => e.stopPropagation()}
                                style={{ willChange: "transform, opacity" }}
                            >
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                                {/* Rotated Barcode Section */}
                                {/* Container height fixed to ensure space. Barcode centered. */}
                                <div className="relative w-full h-[320px] flex items-center justify-center shrink-0 mt-4 mb-2">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="transform rotate-90 origin-center bg-white rounded-lg p-2 flex items-center justify-center">
                                            <Barcode
                                                value={scanValue}
                                                width={2.2} /* Restored width slightly for 8 chars */
                                                height={80}
                                                format="CODE128"
                                                displayValue={false}
                                                background="#ffffff"
                                                lineColor="#000000"
                                                margin={5}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Text Info Section */}
                                <div className="flex flex-col justify-center w-full z-10 text-center pb-2 space-y-2 bg-white/50 backdrop-blur-sm rounded-xl">
                                    <h3 className="text-xl font-bold text-gray-900 truncate px-2 leading-tight">
                                        {displayName}
                                    </h3>

                                    {/* Manual Entry Code */}
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] uppercase text-gray-400 font-semibold tracking-wider">Codice Cliente</span>
                                        <p className="font-mono text-2xl font-black text-gray-800 tracking-widest select-all">
                                            {scanValue}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-red-600 bg-red-50 py-2.5 px-5 rounded-full w-fit mx-auto ring-1 ring-red-100 mt-2">
                                        <Scan className="w-4 h-4" />
                                        {scanLabel}
                                    </div>
                                </div>

                                {/* Close Button - Larger touch target */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-600 rounded-full transition-colors z-20 backdrop-blur-sm"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <div id="floating-barcode-btn" className="fixed bottom-24 lg:bottom-6 right-8 md:right-6 z-[70] flex flex-col items-end gap-4 pointer-events-auto">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full shadow-lg shadow-red-500/30 flex items-center justify-center transition-all duration-300 transform active:scale-95 ${isOpen ? "bg-gray-900 text-white rotate-90" : "bg-red-600 text-white rotate-0"
                        }`}
                    aria-label={isOpen ? "Close Scan Card" : "Open Scan Card"}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <BarcodeIcon className="w-6 h-6" />}
                </button>
            </div>
        </>
    );
}

