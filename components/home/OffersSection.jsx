"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, ShoppingBag, ArrowRight, Calendar } from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export default function OffersSection() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const t = useTranslations('Offers');

    const locale = useLocale();

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch(`/api/offers?locale=${locale}`);
                if (response.ok) {
                    const data = await response.json();
                    setOffers(data.offers || []);
                }
            } catch (error) {
                console.error("Failed to fetch offers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, [locale]);

    const weeklyOffers = offers.filter(o => o.offer_type === 'WEEKLY');
    const permanentOffers = offers.filter(o => o.offer_type === 'PERMANENT');
    const otherOffers = offers.filter(o => o.offer_type !== 'WEEKLY' && o.offer_type !== 'PERMANENT');

    const OfferCard = ({ offer, isSpecial }) => {
        const title = typeof offer.title === 'object' ? offer.title.en || Object.values(offer.title)[0] : offer.title;
        const description = typeof offer.description === 'object' ? offer.description.en || Object.values(offer.description)[0] : offer.description;

        return (
            <motion.div
                className={`${isSpecial ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow duration-300 cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedOffer(offer)}
            >
                <div className="bg-gray-100 rounded-xl w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden relative">
                    {offer.image_url ? (
                        <Image
                            src={offer.image_url}
                            alt={title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 128px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Tag className="w-8 h-8" />
                        </div>
                    )}
                    {offer.badge_text && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                            {offer.badge_text}
                        </div>
                    )}
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-bold text-black line-clamp-1">{title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{description}</p>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-baseline gap-2">
                            {/* Price placeholder if we had price data */}
                            <span className="text-red-600 font-bold text-lg">{t('special_offer')}</span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/393245668944?text=Hello Baraka! I'm interested in the offer: ${title}`, '_blank');
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition duration-300 flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
                        >
                            <span>Claim</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <section id="offers" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-3xl md:text-4xl font-bold text-black mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {t('title')}
                    </motion.h2>
                    <motion.div
                        className="w-24 h-1 bg-red-600 mx-auto rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: 96 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    />
                    <motion.div
                        className="absolute right-0 top-0 hidden lg:block w-48 opacity-50"
                        initial={{ x: 100, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 0.5 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="/illus/undraw_gift-joy_kqz4.svg"
                            alt="Gift Joy"
                            width={192}
                            height={150}
                            className="w-full h-auto"
                        />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Weekly Offers */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mr-3 uppercase tracking-wide">
                                {t('weekly')}
                            </span>
                            {t('weekly_subtitle')}
                        </h3>
                        <div className="space-y-6">
                            {loading ? (
                                [...Array(2)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl h-40 animate-pulse" />
                                ))
                            ) : weeklyOffers.length > 0 ? (
                                weeklyOffers.map((offer) => (
                                    <OfferCard key={offer.id} offer={offer} />
                                ))
                            ) : (
                                <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">
                                    {t('no_weekly_offers')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permanent Offers */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full mr-3 uppercase tracking-wide">
                                {t('permanent')}
                            </span>
                            {t('permanent_subtitle')}
                        </h3>
                        <div className="space-y-6">
                            {loading ? (
                                [...Array(2)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl h-40 animate-pulse" />
                                ))
                            ) : permanentOffers.length > 0 ? (
                                permanentOffers.map((offer) => (
                                    <OfferCard key={offer.id} offer={offer} />
                                ))
                            ) : (
                                <div className="p-8 bg-gray-50 rounded-xl text-center text-gray-500">
                                    {t('no_permanent_offers')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Special/Other Offers */}
                {otherOffers.length > 0 && (
                    <div className="mt-16">
                        <h3 className="text-2xl font-bold text-black mb-8 flex items-center justify-center">
                            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mr-3 uppercase tracking-wide">
                                {t('special')}
                            </span>
                            {t('special_subtitle')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {otherOffers.map((offer) => (
                                <OfferCard key={offer.id} offer={offer} isSpecial={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Offer Details Modal */}
            <Dialog open={!!selectedOffer} onOpenChange={(open) => !open && setSelectedOffer(null)}>
                <DialogContent className="max-w-2xl overflow-hidden p-0 gap-0 border-none rounded-2xl">
                    {selectedOffer && (
                        <>
                            <div className="relative w-full h-80 bg-gray-100">
                                {selectedOffer.image_url ? (
                                    <Image
                                        src={selectedOffer.image_url}
                                        alt={typeof selectedOffer.title === 'object' ? selectedOffer.title.en || Object.values(selectedOffer.title)[0] : selectedOffer.title}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 100vw, 700px"
                                        priority
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Tag className="w-16 h-16" />
                                    </div>
                                )}
                                {selectedOffer.badge_text && (
                                    <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-3 py-1.5 rounded-full shadow-lg z-10">
                                        {selectedOffer.badge_text}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-white">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-3xl font-bold mb-2">
                                        {typeof selectedOffer.title === 'object' ? selectedOffer.title.en || Object.values(selectedOffer.title)[0] : selectedOffer.title}
                                    </DialogTitle>
                                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                                        {selectedOffer.start_date && selectedOffer.end_date && (
                                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(selectedOffer.start_date).toLocaleDateString()} - {new Date(selectedOffer.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md uppercase text-xs font-semibold tracking-wide">
                                            {selectedOffer.offer_type}
                                        </div>
                                    </div>
                                </DialogHeader>

                                <DialogDescription className="text-gray-700 text-lg leading-relaxed mb-8">
                                    {typeof selectedOffer.description === 'object' ? selectedOffer.description.en || Object.values(selectedOffer.description)[0] : selectedOffer.description}
                                </DialogDescription>

                                <button
                                    onClick={() => window.open(`https://wa.me/393245668944?text=Hello Baraka! I'm interested in the offer: ${typeof selectedOffer.title === 'object' ? selectedOffer.title.en || Object.values(selectedOffer.title)[0] : selectedOffer.title}`, '_blank')}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    <span>{t('claim')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    );
}
