"use client";

import React, { useEffect, useRef, useState } from 'react';

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const videoRef = useRef(null);
    const [manualCode, setManualCode] = useState("");
    const [cameraError, setCameraError] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    useEffect(() => {
        let stream = null;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                }
            } catch (err) {
                console.error("Camera error:", err);
                setCameraError(err.message || "Camera access denied");
            }
        };

        startCamera();

        // Cleanup
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleManualSubmit = () => {
        if (manualCode.trim()) {
            onScanSuccess(manualCode.trim(), null);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6">
            {/* Camera Preview */}
            <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-square">
                {cameraError ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-400 text-center p-4">
                        <p>Camera Error: {cameraError}</p>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
                {!cameraActive && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                        Loading camera...
                    </div>
                )}
            </div>

            <p className="text-center text-xs text-gray-400">
                La scansione automatica non è disponibile. Usa l'inserimento manuale.
            </p>

            {/* Manual Input */}
            <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow border border-gray-200">
                <p className="text-sm font-medium text-gray-700">Inserisci ID Cliente:</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="ID Cliente..."
                        value={manualCode}
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                        onChange={(e) => setManualCode(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleManualSubmit();
                        }}
                    />
                    <button
                        className="px-4 py-2 bg-black text-white text-sm font-bold rounded-md disabled:opacity-50"
                        onClick={handleManualSubmit}
                        disabled={!manualCode.trim()}
                    >
                        Cerca
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarcodeScanner;
