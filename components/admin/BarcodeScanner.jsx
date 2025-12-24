"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

const BarcodeScanner = ({ onScanSuccess, onScanFailure }) => {
    const scannerRef = useRef(null);
    const [scanError, setScanError] = useState(null);

    useEffect(() => {
        // Prevent multiple initializations
        if (scannerRef.current) return;

        const scannerId = "reader";

        // Initialize scanner only if element exists
        const element = document.getElementById(scannerId);
        if (element && !scannerRef.current) {
            try {
                const scanner = new Html5QrcodeScanner(
                    scannerId,
                    {
                        fps: 10,
                        qrbox: { width: 300, height: 150 },
                        aspectRatio: 1.0,
                        showTorchButtonIfSupported: true,
                        // Important: explicit formats
                        formatsToSupport: [
                            Html5QrcodeSupportedFormats.CODE_128,
                            Html5QrcodeSupportedFormats.QR_CODE
                        ]
                    },
                    /* verbose= */ false
                );

                scanner.render(
                    (decodedText, decodedResult) => {
                        scanner.clear(); // Stop automatically on success
                        onScanSuccess(decodedText, decodedResult);
                    },
                    (error) => {
                        // Suppress console logs for common failures
                        // if (onScanFailure) onScanFailure(error);
                    }
                );

                scannerRef.current = scanner;
            } catch (err) {
                console.error("Scanner init error:", err);
                setScanError(err.message);
            }
        }

        // Cleanup
        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear().catch(e => console.error(e));
                } catch (e) { }
                scannerRef.current = null;
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Custom Styles to hide the ugly header/footer of the library */}
            <style jsx global>{`
                #reader__dashboard_section_csr span, 
                #reader__status_span { 
                    display: none !important; 
                }
                #reader__dashboard_section_swaplink {
                    display: none !important;
                }
             `}</style>

            {scanError && (
                <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
                    Error starting camera: {scanError}
                </div>
            )}

            <div id="reader" className="w-full bg-gray-100 rounded-lg overflow-hidden"></div>

            <p className="text-center text-sm text-gray-500 mt-2">
                Point camera at the customer&apos;s barcode
            </p>
        </div>
    );
};

export default BarcodeScanner;
