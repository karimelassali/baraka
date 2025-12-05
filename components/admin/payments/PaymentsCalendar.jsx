'use client';

import { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO,
    isBefore,
    addDays,
    isSameWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import PaymentDetailsModal from './PaymentDetailsModal';
import { useTranslations } from 'next-intl';

export default function PaymentsCalendar({ refreshTrigger }) {
    const t = useTranslations('Payments');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const start = startOfMonth(currentMonth).toISOString();
            const end = endOfMonth(currentMonth).toISOString();

            // Fetch a bit more to cover the full calendar view (previous/next month days)
            const calendarStart = startOfWeek(startOfMonth(currentMonth)).toISOString();
            const calendarEnd = endOfWeek(endOfMonth(currentMonth)).toISOString();

            const response = await fetch(`/api/admin/payments?start_date=${calendarStart}&end_date=${calendarEnd}&limit=1000`);
            const data = await response.json();

            if (data.payments) {
                setPayments(data.payments);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [currentMonth, refreshTrigger]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    // Group days into weeks
    const weeks = [];
    let currentWeek = [];
    days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    const getPaymentStatusColor = (payment) => {
        if (payment.status === 'Paid') return 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200';

        const dueDate = parseISO(payment.due_date);
        const today = new Date();

        if (isBefore(dueDate, today) && !isSameDay(dueDate, today)) {
            return 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'; // Overdue
        }

        if (isBefore(dueDate, addDays(today, 7))) {
            return 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'; // Due soon
        }

        return 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'; // Pending
    };

    const handleMarkAsPaid = async (id) => {
        try {
            const response = await fetch(`/api/admin/payments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Paid' })
            });

            if (response.ok) {
                fetchPayments();
                setSelectedPayment(null);
            }
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(t('modal.confirm_delete'))) return;

        try {
            const response = await fetch(`/api/admin/payments/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchPayments();
                setSelectedPayment(null);
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
        }
    };

    const getWeeklyTotal = (weekDays) => {
        const weekStart = weekDays[0];
        const weekEnd = weekDays[6];

        const weeklyPayments = payments.filter(p => {
            const date = parseISO(p.due_date);
            return date >= weekStart && date <= weekEnd;
        });

        const total = weeklyPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        return total > 0 ? total : null;
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200 shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(new Date())}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {t('modal.add_title').includes('Nuovo') ? 'Oggi' : 'Today'} {/* Simple fallback, ideally use localization for 'Today' too if needed, but not critical */}
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.charAt(0)}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-auto bg-gray-200">
                {weeks.map((week, weekIdx) => {
                    const weeklyTotal = getWeeklyTotal(week);

                    return (
                        <div key={weekIdx} className="contents">
                            <div className="grid grid-cols-7 gap-px">
                                {week.map((day) => {
                                    const dayPayments = payments.filter(p => isSameDay(parseISO(p.due_date), day));
                                    const isCurrentMonth = isSameMonth(day, currentMonth);

                                    return (
                                        <div
                                            key={day.toString()}
                                            className={cn(
                                                "min-h-[100px] sm:min-h-[120px] bg-white p-1 sm:p-2 transition-colors hover:bg-gray-50/50 relative group flex flex-col gap-1",
                                                !isCurrentMonth && "bg-gray-50/30 text-gray-400"
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={cn(
                                                        "text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full",
                                                        isToday(day)
                                                            ? "bg-red-600 text-white"
                                                            : "text-gray-700"
                                                    )}
                                                >
                                                    {format(day, 'd')}
                                                </span>
                                                {dayPayments.length > 0 && (
                                                    <span className="hidden sm:inline text-xs font-medium text-gray-500">
                                                        {dayPayments.length} due
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px] sm:max-h-none custom-scrollbar">
                                                {dayPayments.map(payment => (
                                                    <button
                                                        key={payment.id}
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className={cn(
                                                            "w-full text-left px-1.5 py-1 rounded text-[10px] sm:text-xs font-medium border truncate transition-all flex items-center gap-1.5",
                                                            getPaymentStatusColor(payment)
                                                        )}
                                                    >
                                                        <div className="hidden sm:block">
                                                            {payment.status === 'Paid' ? (
                                                                <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                                            ) : (
                                                                <Clock className="h-3 w-3 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <span className="truncate">{payment.recipient}</span>
                                                        <span className="opacity-75 ml-auto hidden sm:inline">€{payment.amount}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Mobile dot indicator if too many items */}
                                            {dayPayments.length > 2 && (
                                                <div className="sm:hidden flex justify-center pb-1">
                                                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Weekly Total Row */}
                            {weeklyTotal !== null && (
                                <div className="bg-red-50/80 border-b border-gray-200 px-4 py-2 flex justify-end items-center gap-2 mb-px">
                                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">{t('weekly_total')}:</span>
                                    <span className="text-sm font-bold text-red-700">€{weeklyTotal.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                </div>
            )}

            <PaymentDetailsModal
                payment={selectedPayment}
                isOpen={!!selectedPayment}
                onClose={() => setSelectedPayment(null)}
                onMarkAsPaid={handleMarkAsPaid}
                onDelete={handleDelete}
            />
        </div>
    );
}
