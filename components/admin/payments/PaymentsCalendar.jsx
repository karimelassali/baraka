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
    addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import AddPaymentModal from './AddPaymentModal';

export default function PaymentsCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
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

    const handlePaymentClick = (payment) => {
        // For now, just log or simple alert. Ideally open a details modal.
        // We can reuse AddPaymentModal in edit mode later.
        console.log('Clicked payment:', payment);
        // TODO: Open details modal
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
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
                        Today
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
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
                {days.map((day, dayIdx) => {
                    const dayPayments = payments.filter(p => isSameDay(parseISO(p.due_date), day));

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] bg-white p-2 transition-colors hover:bg-gray-50/50 relative group",
                                !isSameMonth(day, currentMonth) && "bg-gray-50/30 text-gray-400"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span
                                    className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                        isToday(day)
                                            ? "bg-primary text-white"
                                            : "text-gray-700"
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                                {dayPayments.length > 0 && (
                                    <span className="text-xs font-medium text-gray-500">
                                        {dayPayments.length} due
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                {dayPayments.map(payment => (
                                    <button
                                        key={payment.id}
                                        onClick={() => handlePaymentClick(payment)}
                                        className={cn(
                                            "w-full text-left px-2 py-1 rounded text-xs font-medium border truncate transition-all flex items-center gap-1.5",
                                            getPaymentStatusColor(payment)
                                        )}
                                    >
                                        {payment.status === 'Paid' ? (
                                            <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                        ) : (
                                            <Clock className="h-3 w-3 flex-shrink-0" />
                                        )}
                                        <span className="truncate">{payment.recipient}</span>
                                        <span className="opacity-75 ml-auto">€{payment.amount}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Add button on hover (optional) */}
                            <button
                                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Open add modal pre-filled with this date
                                }}
                            >
                                <div className="w-4 h-4 flex items-center justify-center font-bold">+</div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
        </div>
    );
}
