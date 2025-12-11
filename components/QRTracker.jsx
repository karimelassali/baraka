'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function QRTracker() {
    const searchParams = useSearchParams();
    const hasTracked = useRef(false);

    useEffect(() => {
        const code = searchParams.get('qr_code');

        if (code && !hasTracked.current) {
            // Check session storage to prevent duplicate tracking in same session
            const sessionKey = `qr_tracked_${code}`;
            if (sessionStorage.getItem(sessionKey)) {
                return;
            }

            const trackScan = async () => {
                try {
                    const res = await fetch('/api/track-qr', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ code }),
                    });

                    if (res.ok) {
                        // Mark as tracked in session
                        sessionStorage.setItem(sessionKey, 'true');
                        hasTracked.current = true;
                        // Optional: Show a toast or debug log
                        console.log('QR Code tracked:', code);
                    }
                } catch (error) {
                    console.error('Failed to track QR scan:', error);
                }
            };

            trackScan();
        }
    }, [searchParams]);

    return null;
}
