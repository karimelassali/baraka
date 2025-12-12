'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Check, X, Heart, Sparkles } from 'lucide-react';

export default function WishlistRequest({ user }) {
    const t = useTranslations();
    const supabase = createClient();
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myRequests, setMyRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        if (user) {
            fetchMyRequests();
        }
    }, [user]);

    const fetchMyRequests = async () => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const userId = user?.id;

            if (!userId) {
                setErrorMsg("No user found. Please refresh or log in again.");
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('wishlists')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMyRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setErrorMsg(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productName.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_name: productName, description }),
            });

            if (!response.ok) throw new Error('Failed to submit');

            const newItem = await response.json();
            setMyRequests([newItem, ...myRequests]);
            setProductName('');
            setDescription('');
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error submitting request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        }
    };

    return (
        <div id="dashboard-wishlist" className="space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-pink-600 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </div>
                        <h2 className="text-2xl font-bold">{t('Wishlist.Title')}</h2>
                    </div>
                    <p className="text-red-100 max-w-xl text-lg">
                        {t('Wishlist.Subtitle')}
                    </p>
                </div>

                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-orange-500/30 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submission Form */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-6"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-red-500" />
                            {t('Wishlist.NewRequest')}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('Wishlist.ProductName')}
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                                    placeholder={t('Wishlist.ProductNamePlaceholder')}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {t('Wishlist.Description')}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder={t('Wishlist.DescriptionPlaceholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : showSuccess ? (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {t('Wishlist.Sent')}
                                    </>
                                ) : (
                                    <>
                                        <Heart className="w-5 h-5" />
                                        {t('Wishlist.Submit')}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Requests List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 min-h-[400px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {t('Wishlist.MyRequests')}
                            </h3>
                            <button
                                onClick={fetchMyRequests}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Refresh
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
                                {errorMsg}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                            </div>
                        ) : myRequests.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-10 h-10 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    {t('Wishlist.NoRequests')}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                    {t('Wishlist.NoRequestsDesc')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                <AnimatePresence>
                                    {myRequests.map((request) => (
                                        <motion.div
                                            key={request.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="group relative bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800 transition-all"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                                                        {request.product_name}
                                                    </h4>
                                                    {request.description && (
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                                            {request.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                        {t(`Wishlist.Status.${request.status}`)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
