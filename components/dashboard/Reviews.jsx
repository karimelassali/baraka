"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { checkUserReviewStatus, submitReview } from '@/lib/supabase/review';

export default function Reviews({ user }) {
    const t = useTranslations('Dashboard.Reviews');
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null); // { eligible, lastReview, daysRemaining }
    const [formData, setFormData] = useState({ rating: 5, content: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    const [tipIndex, setTipIndex] = useState(1);
    const [isRotating, setIsRotating] = useState(false);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const result = await checkUserReviewStatus();
            setStatus(result);
        } catch (err) {
            console.error(err);
            setError('Failed to load review status');
        } finally {
            setLoading(false);
        }
    };

    const rotateTip = () => {
        setIsRotating(true);
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * 10) + 1;
        } while (newIndex === tipIndex);

        setTimeout(() => {
            setTipIndex(newIndex);
            setIsRotating(false);
        }, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await submitReview(formData);
            setSubmitSuccess(true);
            // Reload status after short delay to show the "wait" screen
            setTimeout(() => {
                loadStatus();
                setSubmitSuccess(false);
                setFormData({ rating: 5, content: '' });
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <div className="text-red-600 mb-2 font-medium">{error}</div>
                <Button onClick={loadStatus} variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div id="reviews-header" className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-2">{t('title')}</h2>
                    <p className="text-red-100 text-lg">{t('subtitle')}</p>
                </div>
                <div className="absolute right-0 bottom-0 w-64 h-64 opacity-50 pointer-events-none">
                    <img
                        src="/illus/review_illustration.svg"
                        alt="Reviews"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div id="reviews-content" className="lg:col-span-2 space-y-6">
                    {status?.eligible ? (
                        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                                    <MessageSquare className="h-5 w-5 text-red-600" />
                                    {t('eligible_title')}
                                </CardTitle>
                                <p className="text-gray-500">{t('eligible_desc')}</p>
                            </CardHeader>
                            <CardContent>
                                {submitSuccess ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-green-50 border border-green-200 rounded-xl p-8 text-center"
                                    >
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-green-800 mb-2">{t('submit_success')}</h3>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {error && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('rating_label')}
                                            </label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, rating: star })}
                                                        className="focus:outline-none transition-transform hover:scale-110"
                                                    >
                                                        <Star
                                                            className={`w-8 h-8 ${formData.rating >= star
                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('comment_label')}
                                            </label>
                                            <textarea
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                rows={5}
                                                className="w-full rounded-xl border-gray-200 shadow-sm focus:border-red-500 focus:ring-red-500 resize-none p-4"
                                                placeholder={t('placeholder')}
                                                required
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={submitting}
                                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/40"
                                            >
                                                {submitting ? t('submitting') : t('submit_btn')}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm overflow-hidden">
                            <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-10 w-10 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('ineligible_title')}</h3>
                                <p className="text-gray-500 mb-6">{t('ineligible_desc')}</p>

                                <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
                                    <span className="text-2xl font-bold text-red-600">
                                        {status?.daysRemaining}
                                    </span>
                                    <span className="text-gray-600 font-medium">days</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar / Last Review */}
                <div id="reviews-sidebar" className="space-y-6">
                    {status?.lastReview && (
                        <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm h-fit">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                                <CardTitle className="text-lg font-semibold text-gray-800">
                                    {t('your_last_review')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < status.lastReview.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-600 italic mb-4">"{status.lastReview.review_text}"</p>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(status.lastReview.created_at).toLocaleDateString()}
                                </div>

                                <div className={`mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.lastReview.is_approved
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {status.lastReview.is_approved ? 'Published' : 'Pending Approval'}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg relative group">
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-lg">{t('did_you_know_title')}</h4>
                            <button
                                onClick={rotateTip}
                                className={`text-gray-400 hover:text-white transition-all p-1 rounded-full hover:bg-white/10 ${isRotating ? 'animate-spin' : ''}`}
                                title="Next Tip"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        <motion.p
                            key={tipIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-sm text-gray-300 min-h-[3rem] leading-relaxed"
                        >
                            {t(`tips.${tipIndex}`)}
                        </motion.p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
