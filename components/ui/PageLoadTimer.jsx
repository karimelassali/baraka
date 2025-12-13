"use client";

import { useState, useEffect } from 'react';

export default function PageLoadTimer() {
    const [loadTime, setLoadTime] = useState(null);

    useEffect(() => {
        const calculateLoadTime = () => {
            if (typeof window !== 'undefined' && window.performance) {
                // specific check for Navigation Timing API Level 2
                const navEntry = performance.getEntriesByType("navigation")[0];

                if (navEntry && navEntry.loadEventEnd > 0) {
                    // Load is complete, calculate duration
                    setLoadTime(navEntry.loadEventEnd - navEntry.startTime);
                } else {
                    // Load event hasn't finished or API not fully supported
                    // Fallback: calculate time from timeOrigin to now
                    setLoadTime(performance.now());
                }
            }
        };

        // Check if load is already complete
        if (document.readyState === 'complete') {
            calculateLoadTime();
        } else {
            // Otherwise wait for the load event
            window.addEventListener('load', calculateLoadTime);
            return () => window.removeEventListener('load', calculateLoadTime);
        }
    }, []);

    if (loadTime === null) return null;

    let colorClass = "text-green-400 border-green-500";
    if (loadTime > 2500) colorClass = "text-orange-400 border-orange-500";
    if (loadTime > 4000) colorClass = "text-red-400 border-red-500";

    return (
        <div className={`fixed top-4 left-4 z-[10000] bg-black/90 font-mono text-xs p-2 rounded border shadow-2xl pointer-events-none backdrop-blur-md ${colorClass}`}>
            <span className="font-bold">Load Time:</span> {loadTime.toFixed(0)}ms
        </div>
    );
}
