
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function RevenueEntryForm({ isOpen, onClose, onSuccess, initialData = null }) {
    const t = useTranslations('Admin.Revenue');
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        total_revenue: '',
        cash: '',
        card: '',
        ticket: '',
        revenue_annule: ''
    });
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                date: initialData.date,
                total_revenue: initialData.total_revenue,
                cash: initialData.cash,
                card: initialData.card,
                ticket: initialData.ticket,
                revenue_annule: initialData.revenue_annule
            });
        } else {
            setFormData({
                date: format(new Date(), 'yyyy-MM-dd'),
                total_revenue: '',
                cash: '',
                card: '',
                ticket: '',
                revenue_annule: ''
            });
        }
        setError(null);
        setWarning(null);
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Validation check for totals
    useEffect(() => {
        const total = parseFloat(formData.total_revenue) || 0;
        const cash = parseFloat(formData.cash) || 0;
        const card = parseFloat(formData.card) || 0;
        const ticket = parseFloat(formData.ticket) || 0;
        const sum = cash + card + ticket;

        if (total > 0 && Math.abs(total - sum) > 0.01) {
            setWarning(t('warning_total_mismatch', { total: total.toFixed(2), sum: sum.toFixed(2) }));
        } else {
            setWarning(null);
        }
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const url = '/api/admin/revenue';
            const method = initialData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save revenue entry');
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden"
                >
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 className="text-lg font-semibold">
                            {initialData ? t('edit_entry') : t('add_entry')}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('date')}</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('total_revenue')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="total_revenue"
                                    value={formData.total_revenue}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">{t('cash')}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="cash"
                                    value={formData.cash}
                                    onChange={handleChange}
                                    className="w-full px-2 py-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">{t('card')}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="card"
                                    value={formData.card}
                                    onChange={handleChange}
                                    className="w-full px-2 py-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">{t('ticket')}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="ticket"
                                    value={formData.ticket}
                                    onChange={handleChange}
                                    className="w-full px-2 py-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground text-red-500">Annule</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="revenue_annule"
                                    value={formData.revenue_annule}
                                    onChange={handleChange}
                                    className="w-full px-2 py-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-red-500"
                                />
                            </div>
                        </div>

                        {warning && (
                            <div className="flex items-start gap-2 p-3 text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{warning}</span>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? t('saving') : t('save')}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
