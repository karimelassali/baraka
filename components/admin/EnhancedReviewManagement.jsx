"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Star,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  EyeOff,
  Plus,
  X,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { getReviews, updateReviewApproval, deleteReview } from '../../lib/supabase/review';
import { useTranslations } from 'next-intl';

function SkeletonRow() {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border"
    >
      <td className="py-4 px-6">
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-8 w-16 bg-muted rounded"></div>
      </td>
    </motion.tr>
  );
}

function AddReviewModal({ isOpen, onClose, onSave }) {
  const t = useTranslations('Admin.Reviews');
  const [formData, setFormData] = useState({
    reviewer_name: '',
    content: '',
    rating: 5,
    approved: true
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        reviewer_name: '',
        content: '',
        rating: 5,
        approved: true
      });
      setStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Review added successfully' });
        onSave && onSave();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to add review' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-xl shadow-2xl w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>{t('form.title')}</CardTitle>
            <button onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            {status.message && (
              <div className={`mb-4 p-3 rounded-lg ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.name')}</label>
                <Input
                  value={formData.reviewer_name}
                  onChange={(e) => setFormData({ ...formData, reviewer_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.rating')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`p-1 rounded-full transition-colors ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('form.content')}</label>
                <textarea
                  className="w-full p-2 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter review text..."
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approved"
                  checked={formData.approved}
                  onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="approved" className="text-sm">{t('form.approve')}</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>{t('form.cancel')}</Button>
                <Button type="submit" disabled={loading}>{t('form.submit')}</Button>
              </div>
            </form>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function EnhancedReviewManagement() {
  const t = useTranslations('Admin.Reviews');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await getReviews();
      setReviews(result.data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproved = async (reviewId, currentStatus) => {
    try {
      const updatedReview = await updateReviewApproval(reviewId, !currentStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
      );
    } catch (error) {
      console.error('Failed to update review:', error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm(t('delete_confirm') || 'Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const toggleReviewDetails = (reviewId) => {
    setExpandedReviewId(expandedReviewId === reviewId ? null : reviewId);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t('title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search')}
                  className="pl-10 pr-4 py-2 min-w-[240px]"
                />
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-red-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('add')}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{t('total')}: <span className="font-medium">{reviews.length}</span></span>
            <span className="text-xs">{t('last_updated')}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.content')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.rating')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <AnimatePresence>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonRow key={`skeleton-${index}`} />
                    ))}
                  </AnimatePresence>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <React.Fragment key={review.id}>
                      <tr
                        className={`hover:bg-accent transition-colors ${expandedReviewId === review.id ? 'bg-muted/30' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate">
                            <div className="font-medium">{review.reviewer_name || (review.customers ? `${review.customers.first_name} ${review.customers.last_name}` : 'Anonymous')}</div>
                            <div className="text-sm text-muted-foreground truncate mt-1">{review.content || review.review_text}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                  }`}
                              />
                            ))}
                            <span className="ml-1 text-sm font-medium">{review.rating}.0</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={review.is_approved ? 'default' : 'secondary'} className={review.is_approved ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                            {review.is_approved ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('table.approved')}
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                {t('table.pending')}
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleReviewDetails(review.id)}
                              title={expandedReviewId === review.id ? "Hide details" : "Show details"}
                            >
                              {expandedReviewId === review.id ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant={review.is_approved ? "outline" : "default"}
                              className={review.is_approved ? "border-input hover:bg-red-50 hover:text-red-700" : "bg-primary hover:bg-red-700"}
                              onClick={() => handleToggleApproved(review.id, review.is_approved)}
                            >
                              {review.is_approved ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  {t('details.hide')}
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {t('details.approve')}
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(review.id)}
                              title={t('delete') || "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded details row */}
                      <AnimatePresence>
                        {expandedReviewId === review.id && (
                          <motion.tr
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td colSpan="5" className="px-6 py-4">
                              <div className="bg-muted/30 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">{t('details.content')}</h4>
                                    <p className="text-sm text-muted-foreground">{review.content || review.review_text}</p>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">{t('details.details')}</h4>
                                    <div className="space-y-1 text-sm">
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">{t('details.rating')}</span>
                                        <span>
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 inline ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                                                }`}
                                            />
                                          ))}
                                        </span>
                                      </div>
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">{t('details.status')}</span>
                                        <span>{review.is_approved ? t('table.approved') : t('table.pending')}</span>
                                      </div>
                                      <div className="flex">
                                        <span className="w-32 text-muted-foreground">{t('details.date')}</span>
                                        <span>{new Date(review.created_at).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-muted-foreground">
                      {t('table.no_reviews')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddReviewModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={fetchReviews}
      />
    </motion.div>
  );
}