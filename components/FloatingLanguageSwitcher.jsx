'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition, useState, useRef, useEffect } from 'react';
import ReactCountryFlag from "react-country-flag";
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingLanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English', country: 'GB' },
        { code: 'it', name: 'Italiano', country: 'IT' },
        { code: 'ar', name: 'العربية', country: 'SA' }
    ];

    const currentLanguage = languages.find(l => l.code === locale) || languages[0];

    const handleSelect = (code) => {
        if (code === locale) return;

        // Close immediately for better UX
        setIsOpen(false);

        startTransition(() => {
            const currentPath = window.location.pathname;
            const segments = currentPath.split('/');
            segments[1] = code;
            const newPath = segments.join('/');
            router.push(newPath);
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-[100]" ref={containerRef}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden min-w-[200px]"
                    >
                        <div className="p-2 space-y-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${locale === lang.code
                                            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ReactCountryFlag
                                            countryCode={lang.country}
                                            svg
                                            style={{ width: '1.5em', height: '1.5em' }}
                                            className="rounded-full shadow-sm"
                                        />
                                        <span>{lang.name}</span>
                                    </div>
                                    {locale === lang.code && (
                                        <motion.div layoutId="activeLang">
                                            <Check className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 ${isOpen
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                    }`}
            >
                <Globe className={`w-5 h-5 ${isOpen ? 'animate-spin-slow' : ''}`} />
                <span className="font-medium pr-1">{currentLanguage.name}</span>
            </motion.button>
        </div>
    );
}
