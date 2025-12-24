"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Marquee } from "@/components/ui/marquee";

const ReviewCard = ({ review }) => {
    return (
        <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative w-[350px] mx-4 h-full flex flex-col justify-between"
        >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-red-100" />

            <div>
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {review.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                        <h4 className="font-bold text-black">{review.name}</h4>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 italic mb-4 line-clamp-4">
                    &quot;{review.comment}&quot;
                </p>
            </div>

            <p className="text-gray-400 text-xs font-medium mt-auto">
                {review.date}
            </p>
        </div>
    );
};

export default function ReviewsSection() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Reviews');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('/api/reviews');
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    return (
        <section id="reviews" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold text-black mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {t('title')}
                        </motion.h2>
                        <motion.p
                            className="text-gray-600"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            {t('subtitle')}
                        </motion.p>
                    </div>
                    <motion.div
                        className="hidden md:block w-48 h-48 opacity-80"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 0.8, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <img src="/illus/undraw_online-review_08y6.svg" alt="Reviews" className="w-full h-full object-contain" />
                    </motion.div>
                </div>

                <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background py-4 sm:py-20 md:py-20 xl:py-20">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl h-48 animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : reviews.length > 0 ? (
                        <Marquee pauseOnHover className="[--duration:20s]">
                            {reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))}
                        </Marquee>
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            {t('no_reviews')}
                        </div>
                    )}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
                </div>
            </div>
        </section>
    );
}
