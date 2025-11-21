"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function ReviewsSection() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

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
                            Customer Reviews
                        </motion.h2>
                        <motion.p
                            className="text-gray-600"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            See what our happy customers are saying.
                        </motion.p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-48 animate-pulse shadow-sm" />
                        ))
                    ) : reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
                            >
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-red-100" />

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

                                <p className="text-gray-400 text-xs font-medium">
                                    {review.date}
                                </p>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No reviews yet. Be the first to leave one!
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
