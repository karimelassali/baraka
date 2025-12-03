'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import RamadanTheme from './RamadanTheme';
import ChristmasTheme from './ChristmasTheme';
import HalloweenTheme from './HalloweenTheme';
import EidAdhaTheme from './EidAdhaTheme';
import ThemeDebugBar from './ThemeDebugBar';

export default function ThemeWrapper({ children }) {
    const [activeTheme, setActiveTheme] = useState('default');
    const pathname = usePathname();

    // Only show theme effects on home page
    // Adjust logic if you want themes on other pages too
    const isHomePage = pathname === '/' || pathname === '/en' || pathname === '/it' || pathname === '/ar';

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/admin/settings/theme');
            const data = await res.json();
            if (data.theme) {
                setActiveTheme(data.theme);
            }
        } catch (error) {
            console.error('Error fetching theme:', error);
        }
    };

    return (
        <div className="relative min-h-screen">
            {isHomePage && (
                <>
                    {activeTheme === 'ramadan' && <RamadanTheme />}
                    {activeTheme === 'christmas' && <ChristmasTheme />}
                    {activeTheme === 'halloween' && <HalloweenTheme />}
                    {activeTheme === 'eid-adha' && <EidAdhaTheme />}
                </>
            )}

            {children}

            {/* Debug bar only in development */}
            {process.env.NODE_ENV === 'development' && isHomePage && (
                <ThemeDebugBar activeTheme={activeTheme} onThemeChange={setActiveTheme} />
            )}
        </div>
    );
}
