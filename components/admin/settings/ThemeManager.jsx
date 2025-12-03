'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Moon, Gift, Ghost, Check } from 'lucide-react';

const THEMES = [
    { id: 'default', name: 'Default', icon: Palette, color: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'ramadan', name: 'Ramadan', icon: Moon, color: 'bg-emerald-100 dark:bg-emerald-900' },
    { id: 'christmas', name: 'Christmas', icon: Gift, color: 'bg-red-100 dark:bg-red-900' },
    { id: 'halloween', name: 'Halloween', icon: Ghost, color: 'bg-orange-100 dark:bg-orange-900' },
    { id: 'eid-adha', name: 'Eid Adha', icon: Moon, color: 'bg-blue-100 dark:bg-blue-900' },
];

export default function ThemeManager() {
    const [activeTheme, setActiveTheme] = useState('default');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const handleThemeChange = async (themeId) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings/theme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: themeId }),
            });

            if (res.ok) {
                setActiveTheme(themeId);
            }
        } catch (error) {
            console.error('Error updating theme:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Loading settings...</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Settings
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
                Select the active theme for the home page. This will apply visual effects and styles globally.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {THEMES.map((theme) => {
                    const Icon = theme.icon;
                    const isActive = activeTheme === theme.id;

                    return (
                        <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id)}
                            disabled={saving}
                            className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                flex flex-col items-center gap-3
                ${isActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                }
              `}
                        >
                            <div className={`p-3 rounded-full ${theme.color}`}>
                                <Icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                            </div>
                            <span className="font-medium text-sm">{theme.name}</span>

                            {isActive && (
                                <div className="absolute top-2 right-2">
                                    <div className="bg-blue-500 text-white p-1 rounded-full">
                                        <Check className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
