"use client";

import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';
import { DottedMap } from "@/components/ui/dotted-map";

export default function GlobalSourcing() {
    const t = useTranslations('GlobalSourcing');

    const markers = [
        { lat: 31.7917, lng: -7.0926, label: "Morocco", size: 0.8 }, // Morocco
        { lat: 41.8719, lng: 12.5674, label: "Italy", size: 0.8 },   // Italy
        { lat: 23.8859, lng: 45.0792, label: "Saudi Arabia", size: 0.8 }, // Saudi Arabia
        { lat: 38.9637, lng: 35.2433, label: "Turkey", size: 0.8 },  // Turkey
    ];

    return (
        <section className="py-20 bg-gray-50 text-gray-900 overflow-hidden relative">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <motion.h2
                        className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {t('title')}
                    </motion.h2>
                    <motion.p
                        className="text-gray-600 max-w-2xl mx-auto text-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        {t('description')}
                    </motion.p>
                </div>

                <div className="relative w-full h-[400px] md:h-[600px] flex items-center justify-center">
                    <DottedMap
                        markers={markers}
                        mapSamples={4000}
                        dotRadius={0.25}
                        markerColor="#EF4444"
                        className="w-full h-full max-w-5xl text-neutral-400 hover:text-neutral-500 transition-colors duration-500"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                    {markers.map((marker, index) => (
                        <motion.div
                            key={marker.label}
                            className="bg-white/80 backdrop-blur-sm border border-gray-200 p-4 rounded-xl text-center shadow-sm hover:shadow-md transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + (index * 0.1) }}
                        >
                            <h3 className="text-xl font-bold text-red-600 mb-1">{t(`countries.${marker.label.toLowerCase().replace(' ', '_')}.name`)}</h3>
                            <p className="text-sm text-gray-500">{t(`countries.${marker.label.toLowerCase().replace(' ', '_')}.product`)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Background Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50 via-transparent to-gray-50 pointer-events-none" />
        </section>
    );
}
