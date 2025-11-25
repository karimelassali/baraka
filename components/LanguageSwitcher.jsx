'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition, useState, useRef, useEffect } from 'react';
import ReactCountryFlag from "react-country-flag";
import { ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'en', name: 'English', country: 'GB' },
        { code: 'it', name: 'Italiano', country: 'IT' },
        { code: 'ar', name: 'العربية', country: 'SA' }
    ];

    const currentLanguage = languages.find(l => l.code === locale) || languages[0];

    const handleSelect = (code) => {
        setIsOpen(false);
        if (code === locale) return;

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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isPending}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm w-full justify-between group"
            >
                <div className="flex items-center space-x-2">
                    <ReactCountryFlag
                        countryCode={currentLanguage.country}
                        svg
                        style={{
                            width: '1.2em',
                            height: '1.2em',
                        }}
                        className="rounded-sm shadow-sm"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{currentLanguage.name}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50"
                    >
                        <div className="p-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleSelect(lang.code)}
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${locale === lang.code
                                            ? 'bg-red-50 text-red-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <ReactCountryFlag
                                        countryCode={lang.country}
                                        svg
                                        style={{
                                            width: '1.2em',
                                            height: '1.2em',
                                        }}
                                        className="rounded-sm shadow-sm"
                                    />
                                    <span>{lang.name}</span>
                                    {locale === lang.code && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
