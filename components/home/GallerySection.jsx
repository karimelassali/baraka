"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import Image from "next/image";

export default function GallerySection() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const t = useTranslations('Gallery');

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

    // Handle body scroll locking
    useEffect(() => {
        if (selectedImageIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedImageIndex]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex === null) return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev(e);
            if (e.key === 'ArrowRight') showNext(e);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedImageIndex]);

    const visibleImages = images.slice(0, 8);

    const openLightbox = (index) => {
        setSelectedImageIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
    };

    const showNext = (e) => {
        e?.stopPropagation();
        setSelectedImageIndex((prev) => (prev + 1) % visibleImages.length);
    };

    const showPrev = (e) => {
        e?.stopPropagation();
        setSelectedImageIndex((prev) => (prev - 1 + visibleImages.length) % visibleImages.length);
    };

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
                            {t('title')}
                        </motion.h2>
                        <motion.p
                            className="text-gray-600 max-w-xl"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            {t('subtitle')}
                        </motion.p>
                    </div>
                    <motion.a
                        href="#"
                        className="text-red-600 hover:text-red-800 font-medium flex items-center group"
                        whileHover={{ x: 5 }}
                    >
                        {t('view_all')}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ltr:ml-1 rtl:mr-1 group-hover:ltr:ml-2 group-hover:rtl:mr-2 transition-all rtl:rotate-180" viewBox="0 0 20 20" fill="currentColor">
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
                        {visibleImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                className="relative group overflow-hidden rounded-xl shadow-md h-64 bg-white cursor-pointer"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -5 }}
                                onClick={() => openLightbox(index)}
                            >
                                <Image
                                    src={image.image_url}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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
                        <p className="text-gray-500">{t('no_images')}</p>
                    </div>
                )}

                {/* Lightbox Overlay */}
                <AnimatePresence>
                    {selectedImageIndex !== null && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                            onClick={closeLightbox}
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 ltr:right-4 rtl:left-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors z-50"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            {/* Navigation Buttons */}
                            <button
                                onClick={showPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-3 transition-colors z-50 hidden md:block"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>

                            <button
                                onClick={showNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-3 transition-colors z-50 hidden md:block"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* Main Image Container */}
                            <motion.div
                                key={selectedImageIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
                                    <img
                                        src={visibleImages[selectedImageIndex].image_url}
                                        alt={visibleImages[selectedImageIndex].title}
                                        className="max-h-[80vh] w-auto object-contain mx-auto"
                                    />
                                </div>

                                <div className="mt-4 text-center text-white">
                                    <h3 className="text-2xl font-bold">{visibleImages[selectedImageIndex].title}</h3>
                                    <p className="text-white/70 text-lg capitalize">{visibleImages[selectedImageIndex].category}</p>
                                    <p className="text-white/40 text-sm mt-1">{selectedImageIndex + 1} / {visibleImages.length}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
