'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, List, Plus } from 'lucide-react';
import PaymentsCalendar from '@/components/admin/payments/PaymentsCalendar';
import PaymentsList from '@/components/admin/payments/PaymentsList';
import AddPaymentModal from '@/components/admin/payments/AddPaymentModal';
import { useTranslations } from 'next-intl';

export default function PaymentsPage() {
    const t = useTranslations('Payments');
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handlePaymentAdded = () => {
        setRefreshTrigger(prev => prev + 1);
        setIsAddModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
                    <p className="text-gray-500 mt-1">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-sm">
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'calendar'
                                ? 'bg-red-50 text-red-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            {t('calendar_view')}
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list'
                                ? 'bg-red-50 text-red-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            {t('list_view')}
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-200 font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        {t('add_payment')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <motion.div
                key={view}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {view === 'calendar' ? (
                    <PaymentsCalendar refreshTrigger={refreshTrigger} />
                ) : (
                    <PaymentsList refreshTrigger={refreshTrigger} />
                )}
            </motion.div>

            <AddPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handlePaymentAdded}
            />
        </div>
    );
}
