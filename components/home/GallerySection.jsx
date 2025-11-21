"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

export default function GallerySection() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('/api/gallery');
                if (response.ok) {
                    const data = await response.json();
                    setImages(data);
                }
            } catch (error) {
                console.error("Failed to fetch gallery images", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    return (
        <section id="gallery" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div className="mb-6 md:mb-0">
                        <motion.h2
                            className="text-3xl md:text-4xl font-bold text-black mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            Our Gallery
                        </motion.h2>
                        <motion.p
                            className="text-gray-600 max-w-xl"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            Explore our latest products and store atmosphere.
                        </motion.p>
                    </div>
                    <motion.a
                        href="#"
                        className="text-red-600 hover:text-red-800 font-medium flex items-center group"
                        whileHover={{ x: 5 }}
                    >
                        View All
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:ml-2 transition-all" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </motion.a>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse" />
                        ))}
                    </div>
                ) : images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.slice(0, 8).map((image, index) => (
                            <motion.div
                                key={image.id}
                                className="relative group overflow-hidden rounded-xl shadow-md h-64 bg-white"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                            >
                                <img
                                    src={image.image_url}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Image+Error'; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    <h3 className="text-white font-bold text-lg">{image.title}</h3>
                                    <p className="text-gray-200 text-sm capitalize">{image.category}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No images in gallery yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
