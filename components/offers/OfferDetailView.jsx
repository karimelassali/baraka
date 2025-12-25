"use client";

import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowLeft, Clock, Gift, ShoppingBag, Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export default function OfferDetailView({ offer, locale }) {
    const [copied, setCopied] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 relative overflow-hidden selection:bg-red-100 selection:text-red-900">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gray-50 dark:bg-gray-800/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            {/* Floating Illustration Background */}
            <img
                src="/illus/undraw_gift-card_sfy8.svg"
                className="absolute top-20 right-0 w-96 h-96 opacity-5 pointer-events-none hidden lg:block"
                alt="Background Decoration"
            />

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-50 p-6">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <Link href="/" className="group flex items-center gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm group-hover:shadow-md transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </div>
                        <span className="font-medium hidden sm:inline-block">Back to Store</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 transition-all"
                            onClick={handleShare}
                        >
                            {copied ? <Check className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="lg:col-span-7 relative"
                    >
                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-900/10 bg-white dark:bg-neutral-900 border-8 border-white dark:border-neutral-800 aspect-[4/3] group">
                            {offer.image_url ? (
                                <img
                                    src={offer.image_url}
                                    alt={offer.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-neutral-900 dark:to-neutral-800 p-16">
                                    <img
                                        src="/illus/undraw_gift-joy_kqz4.svg"
                                        alt="Gift Illustration"
                                        className="w-full h-full object-contain drop-shadow-xl"
                                    />
                                </div>
                            )}

                            {/* Floating Badge */}
                            {offer.badge_text && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -10 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.3, type: "spring" }}
                                    className="absolute top-6 right-6 bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-red-600/30 text-lg tracking-wide"
                                >
                                    {offer.badge_text}
                                </motion.div>
                            )}
                        </div>

                        {/* Decorative Elements around image */}
                        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full -z-10 blur-xl" />
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-full -z-10 blur-xl" />
                    </motion.div>

                    {/* Right Column: Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-5 space-y-8"
                    >
                        <div>
                            <div className="flex flex-wrap gap-3 mb-6">
                                <Badge variant="secondary" className="px-4 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 rounded-full text-sm font-medium">
                                    {offer.category_name || 'Special Offer'}
                                </Badge>
                                {offer.is_popup && (
                                    <Badge variant="outline" className="px-4 py-1.5 border-orange-200 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800 rounded-full text-sm font-medium flex items-center gap-1">
                                        <Gift className="w-3 h-3" /> Featured
                                    </Badge>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                                {offer.title}
                            </h1>

                            <div className="prose prose-lg dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed">
                                <p>{offer.description}</p>
                            </div>
                        </div>

                        {/* Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-center items-center text-center group hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-red-500 mb-3 group-hover:scale-110 transition-transform">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Expires</div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                    {offer.end_date ? formatDate(offer.end_date) : 'Ongoing'}
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800 flex flex-col justify-center items-center text-center group hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-red-500 mb-3 group-hover:scale-110 transition-transform">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Type</div>
                                <div className="font-bold text-gray-900 dark:text-white capitalize">
                                    {offer.offer_type?.toLowerCase()}
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="pt-6 border-t border-gray-100 dark:border-neutral-800 space-y-4">
                            <Button
                                onClick={() => window.open(`https://wa.me/393245668944?text=Ciao Baraka! Sono interessato all'offerta: ${offer?.title}`, '_blank')}
                                className="w-full h-16 text-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20 hover:shadow-red-600/40 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ShoppingBag className="mr-2 h-6 w-6" />
                                Claim Offer Now
                            </Button>

                            <p className="text-center text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                Verified Offer • Terms & Conditions Apply
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
