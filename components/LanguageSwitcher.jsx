'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // Replace the locale in the URL
            // This assumes the URL structure is /[locale]/...
            // A more robust way is to use next-intl's Link or useRouter/usePathname
            // But for now, we can just reload or use window.location
            // Or better, use next-intl's navigation APIs if configured
            // Since we didn't configure navigation.ts yet, let's do a simple path replacement

            const currentPath = window.location.pathname;
            const segments = currentPath.split('/');
            // segments[0] is empty, segments[1] is locale
            segments[1] = nextLocale;
            const newPath = segments.join('/');
            router.push(newPath);
        });
    };

    return (
        <select
            defaultValue={locale}
            onChange={onSelectChange}
            disabled={isPending}
            className="bg-white border border-gray-300 text-gray-700 py-1 px-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="en">English</option>
            <option value="it">Italiano</option>
            <option value="ar">العربية</option>
        </select>
    );
}
