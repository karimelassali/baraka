"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "../ui/dialog";

const LANGUAGES = [
    { code: "en", name: "English", nativeName: "English", flagCode: "us", greeting: "Hello!" },
    { code: "it", name: "Italian", nativeName: "Italiano", flagCode: "it", greeting: "Ciao!" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flagCode: "sa", greeting: "مرحباً!" }
];

const TEXTS = {
    en: {
        title: "Choose your language",
        subtitle: "Select your preferred language",
        continue: "Continue"
    },
    it: {
        title: "Scegli la tua lingua",
        subtitle: "Seleziona la tua lingua preferita",
        continue: "Continua"
    },
    ar: {
        title: "اختر لغتك",
        subtitle: "حدد لغتك المفضلة",
        continue: "يكمل"
    }
};

export default function LanguageSelectionModal({ isOpen, onSelect, currentLocale }) {
    const [selectedLang, setSelectedLang] = useState(currentLocale || 'en');

    const handleConfirm = () => {
        onSelect(selectedLang);
    };

    const t = TEXTS[selectedLang] || TEXTS.en;

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                <div className="relative h-40 bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>
                    <div className="relative z-10 w-48 h-48 mt-10">
                        <img
                            src="/illus/undraw_around-the-world_vgcy.svg"
                            alt="Languages"
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                </div>

                <div className="p-6 pt-12">
                    <div className="text-center mb-8">
                        <motion.div
                            key={selectedLang}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {t.title}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {t.subtitle}
                            </p>
                        </motion.div>
                    </div>

                    <div className="space-y-3">
                        {LANGUAGES.map((lang) => (
                            <motion.button
                                key={lang.code}
                                onClick={() => setSelectedLang(lang.code)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full p-4 pr-12 rounded-xl border-2 flex items-center gap-4 transition-all relative ${selectedLang === lang.code
                                    ? 'border-red-500 bg-red-50 shadow-md'
                                    : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm shrink-0">
                                    <img
                                        src={`https://flagcdn.com/w80/${lang.flagCode}.png`}
                                        alt={lang.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="font-bold text-gray-900">{lang.nativeName}</div>
                                    <div className="text-xs text-gray-500">{lang.name}</div>
                                </div>
                                <div className="text-sm font-medium text-red-600">
                                    {lang.greeting}
                                </div>
                                {selectedLang === lang.code && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>

                    <motion.button
                        onClick={handleConfirm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-8 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/40 transition-all"
                    >
                        {t.continue}
                    </motion.button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
