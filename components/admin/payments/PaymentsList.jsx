'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { it, enUS, ar } from 'date-fns/locale';
import {
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2,
    Edit2,
    DollarSign,
    Download,
    FileSpreadsheet,
    FileText,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations, useLocale } from 'next-intl';

export default function PaymentsList({ refreshTrigger }) {
    const t = useTranslations('Admin.Payments');
    const locale = useLocale();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);
    const limit = 20;

    const dateLocale = locale === 'it' ? it : locale === 'ar' ? ar : enUS;

    const fetchPayments = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/payments?limit=${limit}&offset=${(page - 1) * limit}&sort_by=due_date&sort_order=asc`;
            if (search) url += `&recipient=${search}`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.payments) {
                setPayments(data.payments);
                setTotalPages(Math.ceil(data.total / limit));
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, search, statusFilter, refreshTrigger]);

    const handleMarkAsPaid = async (id) => {
        setActionLoading(id);
        try {
            const response = await fetch(`/api/admin/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Paid' })
            });

            if (response.ok) {
                fetchPayments();
            }
        } catch (error) {
            console.error('Error marking as paid:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('modal.confirm_delete'))) return;
        setActionLoading(id);

        try {
            const response = await fetch(`/api/admin/payments/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchPayments();
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const exportToPDF = async () => {
        const doc = new jsPDF();

        // Add Logo
        try {
            const logoUrl = '/logo.jpeg';
            const img = new Image();
            img.src = logoUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            doc.addImage(img, 'JPEG', 14, 10, 15, 15);
        } catch (e) {
            console.error("Could not load logo", e);
        }

        // Add Header
        doc.setFontSize(20);
        doc.setTextColor(220, 38, 38);
        doc.text('BARAKA', 35, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(t('report_title'), 14, 35);
        doc.text(`${t('generated_on')} ${format(new Date(), 'PPP', { locale: dateLocale })}`, 14, 41);

        const tableColumn = [
            t('table.due_date'),
            t('table.recipient'),
            t('table.amount'),
            t('table.type'),
            t('table.status'),
            t('table.notes')
        ];
        const tableRows = [];

        payments.forEach(payment => {
            const status = payment.status === 'Paid' ? t('status_paid') : t('status_pending');
            const paymentData = [
                format(parseISO(payment.due_date), 'd MMM yyyy', { locale: dateLocale }),
                payment.recipient,
                `€${payment.amount}`,
                payment.payment_type + (payment.check_number ? ` #${payment.check_number}` : ''),
                status,
                payment.notes || ''
            ];
            tableRows.push(paymentData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { fontSize: 9, font: 'helvetica' } // Use standard font to avoid issues
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(t('internal_doc'), 14, doc.internal.pageSize.height - 10);
        }

        doc.save(`report_pagamenti_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(payments.map(p => ({
            [t('table.due_date')]: format(parseISO(p.due_date), 'yyyy-MM-dd'),
            [t('table.recipient')]: p.recipient,
            [t('table.amount')]: p.amount,
            [t('table.type')]: p.payment_type,
            [t('table.check_number')]: p.check_number,
            [t('table.status')]: p.status,
            [t('table.notes')]: p.notes,
            'Paid At': p.paid_at ? format(parseISO(p.paid_at), 'yyyy-MM-dd HH:mm') : ''
        })));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, `payments_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Filters & Actions */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                    >
                        <option value="all">{t('status_all')}</option>
                        <option value="Pending">{t('status_pending')}</option>
                        <option value="Paid">{t('status_paid')}</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        onClick={exportToPDF}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('export_pdf')}
                    >
                        <FileText className="w-5 h-5" />
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t('export_excel')}
                    >
                        <FileSpreadsheet className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.due_date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.recipient')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.amount')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.type')}</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.status')}</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                                        {t('loading')}
                                    </div>
                                </td>
                            </tr>
                        ) : payments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                    {t('no_payments')}
                                </td>
                            </tr>
                        ) : (
                            payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {format(parseISO(payment.due_date), 'MMM d, yyyy', { locale: dateLocale })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {payment.recipient}
                                        {payment.notes && (
                                            <span className="block text-xs text-gray-500 font-normal truncate max-w-[200px]">{payment.notes}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        €{payment.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                            {payment.payment_type}
                                            {payment.check_number && ` #${payment.check_number}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {payment.status === 'Paid' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                <CheckCircle className="w-3 h-3" />
                                                {t('status_paid')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                <Clock className="w-3 h-3" />
                                                {t('status_pending')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {actionLoading === payment.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            ) : (
                                                <>
                                                    {payment.status !== 'Paid' && (
                                                        <button
                                                            onClick={() => handleMarkAsPaid(payment.id)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title={t('modal.mark_paid')}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(payment.id)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title={t('modal.delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 flex justify-center items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        {t('loading')}
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        {t('no_payments')}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {payments.map((payment) => (
                            <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{payment.recipient}</h3>
                                        <p className="text-xs text-gray-500">
                                            {format(parseISO(payment.due_date), 'MMM d, yyyy', { locale: dateLocale })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">€{payment.amount}</p>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {payment.payment_type}
                                        </span>
                                    </div>
                                </div>

                                {payment.notes && (
                                    <p className="text-xs text-gray-500 mb-3 italic">{payment.notes}</p>
                                )}

                                <div className="flex justify-between items-center mt-3">
                                    <div>
                                        {payment.status === 'Paid' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                <CheckCircle className="w-3 h-3" />
                                                {t('status_paid')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                <Clock className="w-3 h-3" />
                                                {t('status_pending')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {actionLoading === payment.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                        ) : (
                                            <>
                                                {payment.status !== 'Paid' && (
                                                    <button
                                                        onClick={() => handleMarkAsPaid(payment.id)}
                                                        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                                                        title={t('modal.mark_paid')}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                    title={t('modal.delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
