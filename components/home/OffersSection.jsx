"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tag, ShoppingBag } from "lucide-react";

export default function OffersSection() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await fetch('/api/admin/offers');
                if (response.ok) {
                    const data = await response.json();
                    // Filter active offers
                    const activeOffers = data.filter(offer => offer.is_active);
                    setOffers(activeOffers);
                }
            } catch (error) {
                console.error("Failed to fetch offers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOffers();
    }, []);

    const weeklyOffers = offers.filter(o => o.offer_type === 'WEEKLY');
    const permanentOffers = offers.filter(o => o.offer_type === 'PERMANENT');

    const OfferCard = ({ offer }) => {
        const title = typeof offer.title === 'object' ? offer.title.en || Object.values(offer.title)[0] : offer.title;
        const description = typeof offer.description === 'object' ? offer.description.en || Object.values(offer.description)[0] : offer.description;

        return (
            <motion.div
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="bg-gray-100 rounded-xl w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden relative">
                    {offer.image_url ? (
                        <img src={offer.image_url} alt={title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Tag className="w-8 h-8" />
                        </div>
                    )}
                    {offer.badge_text && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
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
                            <span className="text-red-600 font-bold text-lg">Special Offer</span>
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition duration-300">
                            <ShoppingBag className="w-5 h-5" />
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
                        Special Offers
                    </motion.h2>
                    <motion.div
                        className="w-24 h-1 bg-red-600 mx-auto rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: 96 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Weekly Offers */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mr-3 uppercase tracking-wide">
                                Weekly
                            </span>
                            Limited Time Deals
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
                                    No weekly offers available at the moment.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Permanent Offers */}
                    <div>
                        <h3 className="text-2xl font-bold text-black mb-8 flex items-center">
                            <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full mr-3 uppercase tracking-wide">
                                Permanent
                            </span>
                            Always Great Value
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
                                    No permanent offers available at the moment.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
