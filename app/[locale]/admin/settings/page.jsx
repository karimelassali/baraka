'use client';

import ThemeManager from '@/components/admin/settings/ThemeManager';

export default function SettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="grid gap-6">
                <ThemeManager />

                {/* Future settings sections can be added here */}
            </div>
        </div>
    );
}
