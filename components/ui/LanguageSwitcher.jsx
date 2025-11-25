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
                className="bg-white text-gray-800 border border-gray-300 rounded-full shadow-md p-2.5 flex items-center justify-center hover:bg-gray-50 transition-all duration-300 z-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Language selector"
                title="Change language"
            >
                <span className="text-base mr-1">{currentLanguage.flag}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-gray-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                        <div className="py-1">
                            {languages.map((language) => (
                                <button
                                    key={language.code}
                                    onClick={() => handleLanguageChange(language.code)}
                                    className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-50 transition-colors ${currentLocale === language.code ? "bg-red-50 text-red-600 font-medium" : "text-gray-700"
                                        }`}
                                >
                                    <span className="mr-3 text-lg">{language.flag}</span>
                                    {language.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
