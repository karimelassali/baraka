
"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import RevenueEntryForm from './RevenueEntryForm';

export default function RevenueArchive({
    data,
    isLoading,
    onRefresh,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear
}) {
    const t = useTranslations('Admin.Revenue');
    const [editingEntry, setEditingEntry] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const months = [
        t('months.january'), t('months.february'), t('months.march'),
        t('months.april'), t('months.may'), t('months.june'),
        t('months.july'), t('months.august'), t('months.september'),
        t('months.october'), t('months.november'), t('months.december')
    ];

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('confirm_delete'))) return;

        setDeletingId(id);
        try {
            const response = await fetch(`/api/admin/revenue?id=${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onRefresh();
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/5">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {t('monthly_archive')}
                </h2>

                <div className="flex items-center gap-2">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="h-9 px-2 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1">
                        <button
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-accent text-foreground rounded-md transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium min-w-[100px] text-center">
                            {months[selectedMonth - 1]}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-accent text-foreground rounded-md transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-medium">{t('date')}</th>
                            <th className="px-6 py-3 font-medium">{t('total')}</th>
                            <th className="px-6 py-3 font-medium">{t('cash')}</th>
                            <th className="px-6 py-3 font-medium">{t('card')}</th>
                            <th className="px-6 py-3 font-medium">{t('ticket')}</th>
                            <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 bg-card">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        {t('loading')}
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <AlertCircle className="w-8 h-8 opacity-20" />
                                        {t('no_entries')}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((entry) => (
                                <motion.tr
                                    key={entry.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-muted/30 transition-colors group bg-card"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {format(new Date(entry.date), 'dd MMM yyyy')}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">
                                        €{Number(entry.total_revenue).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        €{Number(entry.cash).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        €{Number(entry.card).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        €{Number(entry.ticket).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingEntry(entry)}
                                                className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all shadow-sm"
                                                title={t('edit')}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={deletingId === entry.id}
                                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                                                title={t('delete')}
                                            >
                                                {deletingId === entry.id ? (
                                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RevenueEntryForm
                isOpen={!!editingEntry}
                onClose={() => setEditingEntry(null)}
                initialData={editingEntry}
                onSuccess={() => {
                    setEditingEntry(null);
                    onRefresh();
                }}
            />
        </div>
    );
}
