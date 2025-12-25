"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from 'next-intl';
import { FlipWords } from "@/components/ui/flip-words";
import { useState, useEffect } from "react";
import { quotes } from "@/lib/data/quotes";
import Image from "next/image";

export default function Hero() {
    const t = useTranslations('Hero');
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const interval = setInterval(() => {
            setCurrentQuoteIndex((prev) => {
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * quotes.length);
                } while (newIndex === prev && quotes.length > 1);
                return newIndex;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative bg-gradient-to-r from-red-50 to-white overflow-hidden">
            <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
                <motion.div
                    className="md:w-1/2 mb-12 md:mb-0 z-10"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
                        {t('welcome_to')}
                        <FlipWords
                            words={[t('flip_words.0'), t('flip_words.1'), t('flip_words.2'), t('flip_words.3')]}
                            className="text-red-600 dark:text-red-500"
                        />
                    </div>
                    <motion.p
                        className="text-lg md:text-xl text-gray-700 mt-4 mb-8 max-w-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {t('description')}
                    </motion.p>
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                    >
                        <motion.a
                            href="#gallery"
                            className="bg-red-600 hover:bg-red-800 text-white font-medium py-3 px-8 rounded-full transition duration-300 text-center shadow-lg hover:shadow-xl"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0px 8px 20px rgba(220, 38, 38, 0.4)",
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('view_products')}
                        </motion.a>
                        <motion.a
                            href="#contact"
                            className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-medium py-3 px-8 rounded-full transition duration-300 text-center"
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0px 8px 20px rgba(220, 38, 38, 0.2)",
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {t('contact_us')}
                        </motion.a>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="md:w-1/2 flex justify-center relative"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="relative w-full max-w-lg">
                        <motion.div
                            className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl w-full h-80 md:h-96 shadow-2xl overflow-hidden relative"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {/* Placeholder for a hero image - using a nice gradient/pattern instead of empty box */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>
                            <Image
                                src="/logo.jpeg"
                                alt="Baraka Store Logo"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                                className="object-cover w-full h-full"
                            />
                        </motion.div>

                        <motion.div
                            className="absolute -bottom-6 ltr:-right-6 rtl:-left-6 bg-white p-6 rounded-xl shadow-xl w-3/4 border border-gray-100"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                        >
                            <div className="min-h-[60px] flex items-center">
                                <AnimatePresence mode="wait">
                                    {isMounted && (
                                        <motion.p
                                            key={currentQuoteIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.5 }}
                                            className="text-gray-700 italic font-medium"
                                        >
                                            &quot;{t(`quotes.${quotes[currentQuoteIndex]}`)}&quot;
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex items-center mt-4">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xs ltr:mr-2 rtl:ml-2">B</div>
                                <p className="text-sm text-gray-500 font-semibold">{t('team')}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10"></div>
                </motion.div>
            </div>
        </section>
    );
}
