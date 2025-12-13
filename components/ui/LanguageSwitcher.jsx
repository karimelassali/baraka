"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "../../navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const currentLocale = useLocale();

    const languages = [
        { code: "en", name: "English", flag: "🇺🇸" },
        { code: "it", name: "Italian", flag: "🇮🇹" },
        { code: "ar", name: "Arabic", flag: "🇸🇦" }
    ];

    const currentLanguage = languages.find(l => l.code === currentLocale) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (locale) => {
        router.replace(pathname, { locale });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group shadow-sm"
                whileTap={{ scale: 0.98 }}
            >
                <span className="text-lg leading-none">{currentLanguage.flag}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden sm:inline-block">
                    {currentLanguage.name}
                </span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 ring-1 ring-black/5 z-50 overflow-hidden py-1"
                    >
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => handleLanguageChange(language.code)}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${currentLocale === language.code
                                        ? "bg-red-50 text-red-700 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <span className="text-lg leading-none">{language.flag}</span>
                                <span>{language.name}</span>
                                {currentLocale === language.code && (
                                    <motion.div
                                        layoutId="activeCheck"
                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-red-600"
                                    />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
