'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function QRTracker() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const trackedRef = useRef(false);

    useEffect(() => {
        const qrCode = searchParams.get('qr_code');

        if (qrCode && !trackedRef.current) {
            trackedRef.current = true;

            // Track the scan
            fetch('/api/track-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: qrCode }),
            }).catch(err => console.error('Failed to track QR code:', err));

            // Optional: Clean up URL
            // const newParams = new URLSearchParams(searchParams);
            // newParams.delete('qr_code');
            // router.replace(`?${newParams.toString()}`, { scroll: false });
        }
    }, [searchParams, router]);

    return null;
}
