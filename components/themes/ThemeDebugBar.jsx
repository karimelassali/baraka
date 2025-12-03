'use client';

import { Palette } from 'lucide-react';

export default function ThemeDebugBar({ activeTheme, onThemeChange }) {
    const themes = ['default', 'ramadan', 'christmas', 'halloween', 'eid-adha'];

    return (
        <div className="fixed bottom-4 right-4 z-[100] bg-black/80 text-white p-2 rounded-lg shadow-lg backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <Palette className="w-4 h-4 text-gray-400" />
            <select
                value={activeTheme}
                onChange={(e) => onThemeChange(e.target.value)}
                className="bg-transparent border-none text-xs focus:ring-0 cursor-pointer"
            >
                {themes.map(t => (
                    <option key={t} value={t} className="bg-black text-white">
                        {t}
                    </option>
                ))}
            </select>
        </div>
    );
}
