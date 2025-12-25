"use client";

import React, { useState } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner'; // Assuming you use sonner or similar for toasts



const RobustScanner = ({ onScanSuccess }) => {
    const [manualCode, setManualCode] = useState("");
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState(null);

    // Gestione scansione
    const handleScan = (detectedCodes) => {
        if (detectedCodes.length > 0 && !isPaused) {
            const code = detectedCodes[0].rawValue;
            if (code) {
                setIsPaused(true);
                const audio = new Audio('/sounds/beep.mp3');
                audio.play().catch(() => { });

                console.log("Scan Success:", code);
                onScanSuccess(code);
            }
        }
    };

    const handleError = (error) => {
        console.warn("Scanner Log:", error);
        if (error instanceof Error && error.name === 'NotAllowedError') {
            setError("Per favore abilita l'accesso alla fotocamera.");
        }
    };

    const handleManualSubmit = (e) => {
        e?.preventDefault();
        if (manualCode.trim()) {
            setIsPaused(true);
            onScanSuccess(manualCode.trim());
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">

            {/* Camera Area */}
            <div className="relative rounded-2xl overflow-hidden shadow-inner bg-black aspect-square ring-4 ring-black/5">
                {!isPaused ? (
                    <Scanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            facingMode: 'environment',
                            aspectRatio: 1.0
                        }}
                        formats={[
                            'linear_codes',
                            'matrix_codes'
                        ]}
                        components={{
                            audio: false,
                            onOff: false,
                            torch: true,
                            zoom: true,
                            finder: true,
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' },
                            video: { objectFit: 'cover' },
                            finderBorder: 2,
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <p className="font-bold text-lg">Scansione Completata</p>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="mt-6 px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors"
                        >
                            Scansiona di nuovo
                        </button>
                    </div>
                )}

                {/* Error Overlay */}
                {error && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-white p-6 text-center">
                        <div>
                            <p className="text-red-400 font-bold mb-2 text-lg">Attenzione</p>
                            <p className="text-sm text-gray-300 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors"
                            >
                                Ricarica Pagina
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-center text-sm text-gray-500 font-medium">
                Inquadra il codice a barre (Code 128 / QR)
            </p>

            {/* Manual Input Fallback */}
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><path d="M7 7h3" /><path d="M7 12h3" /><path d="M7 17h3" /><path d="M14 7h3" /><path d="M14 12h3" /><path d="M14 17h3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="O inserisci ID manuale..."
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!manualCode.trim()}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cerca
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RobustScanner;