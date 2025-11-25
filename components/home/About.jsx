"use client";

import { motion } from "framer-motion";
import { Award, Heart, ShieldCheck } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function About() {
    const t = useTranslations('About');

    const features = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-red-600" />,
            title: t('our_mission'),
            description: t('mission_desc')
        },
        {
            icon: <Award className="w-8 h-8 text-red-600" />,
            title: t('our_vision'),
            description: t('vision_desc')
        },
        {
            icon: <Heart className="w-8 h-8 text-red-600" />,
            title: t('our_values'),
            description: t('values_desc')
        }
    ];

    return (
        <section id="about" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-black mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        {t('title')}
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-600 leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {t('description')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow duration-300"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                            whileHover={{ y: -10 }}
                        >
                            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-black mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
