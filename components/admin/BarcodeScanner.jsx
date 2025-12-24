"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);
    const readerId = "reader-custom";

    const startScanning = async () => {
        try {
            const html5QrCode = new Html5Qrcode(readerId);
            scannerRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 300, height: 150 },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                { facingMode: "environment" }, // Prefer back camera
                config,
                (decodedText, decodedResult) => {
                    onScanSuccess(decodedText, decodedResult);
                    stopScanning();
                },
                (errorMessage) => {
                    // connection errors etc.
                    if (onScanFailure) onScanFailure(errorMessage);
                }
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting scanner", err);
            if (onScanFailure) onScanFailure(err);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.warn("Failed to stop scanner (might not be running)", err);
            }
            try {
                scannerRef.current.clear();
            } catch (err) {
                console.warn("Failed to clear scanner", err);
            }
            setIsScanning(false);
            scannerRef.current = null;
        }
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { }).finally(() => {
                    try { scannerRef.current.clear(); } catch (e) { }
                });
            }
        };
    }, []);


    return (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
            <div id={readerId} className="w-full h-[300px] bg-black rounded-lg overflow-hidden relative">
                {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                        Camera Off
                    </div>
                )}
            </div>

            {!isScanning && (
                <Button onClick={startScanning} className="w-full">
                    Start Camera Scan
                </Button>
            )}
            {isScanning && (
                <Button variant="destructive" onClick={stopScanning} className="w-full">
                    Stop Camera
                </Button>
            )}
        </div>
    );
};

export default BarcodeScanner;
