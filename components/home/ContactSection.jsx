"use client";

import { motion } from "framer-motion";
import ContactOptions from "../ui/ContactOptions";
import Hours from "../ui/Hours";
import { useTranslations } from 'next-intl';
import { MapPin, Navigation } from "lucide-react";

export default function ContactSection() {
    const t = useTranslations('Contact');
    const businessInfo = {
        address: "Via Borgonovo 1, 29015 Castel San Giovanni PC, Italy",
        mapLink: "https://maps.app.goo.gl/3C6QCM",
    };

    return (
        <section id="contact" className="py-24 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-red-50/50 -skew-x-12 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-60 -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
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
                        {t('subtitle')}
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Column: Contact Info & Illustration */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <motion.div
                            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex-1 relative overflow-hidden"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="bg-red-100 p-2 rounded-lg text-red-600"><MapPin size={24} /></span>
                                    {t('info_title')}
                                </h3>

                                <div className="mb-8">
                                    <ContactOptions />
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wider opacity-70">{t('address')}</h4>
                                        <p className="text-gray-700 font-medium text-lg leading-snug">{businessInfo.address}</p>
                                        <a
                                            href={businessInfo.mapLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center mt-3 text-white bg-red-600 hover:bg-red-700 px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg gap-2 text-sm"
                                        >
                                            <Navigation size={16} />
                                            {t('open_maps')}
                                        </a>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider opacity-70">{t('working_hours')}</h4>
                                        <Hours />
                                    </div>
                                </div>
                            </div>

                            {/* Illustration Watermark */}
                            <img
                                src="/illus/undraw_location-tracking_q3yd.svg"
                                className="absolute -bottom-10 -right-10 w-64 opacity-10 pointer-events-none"
                                alt="Location"
                            />
                        </motion.div>
                    </div>

                    {/* Right Column: Large Map & Visuals */}
                    <div className="lg:col-span-7 flex flex-col">
                        <motion.div
                            className="h-full min-h-[500px] rounded-3xl overflow-hidden shadow-xl border-4 border-white relative group"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2810.663847800613!2d9.4333!3d45.0583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4781256666666667%3A0x0!2sVia%20Borgonovo%201%2C%2029015%20Castel%20San%20Giovanni%20PC!5e0!3m2!1sen!2sit!4v1620000000000!5m2!1sen!2sit"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                                title="Baraka Location"
                            ></iframe>

                            {/* Floating Card Overlay */}
                            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-white/50 hidden md:block">
                                <div className="flex gap-4 items-start">
                                    <img src="/illus/undraw_location-tracking_q3yd.svg" className="w-20 h-20 object-contain" alt="We are here" />
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm mb-1">We are here!</p>
                                        <p className="text-xs text-gray-600 leading-relaxed mb-2">Come verify the quality of our products yourself.</p>
                                        <p className="text-xs font-bold text-red-600">Castel San Giovanni, PC</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
