'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, List, Plus, Download } from 'lucide-react';
import PaymentsCalendar from '@/components/admin/payments/PaymentsCalendar';
import PaymentsList from '@/components/admin/payments/PaymentsList';
import AddPaymentModal from '@/components/admin/payments/AddPaymentModal';

export default function PaymentsPage() {
    const [view, setView] = useState('calendar'); // 'calendar' or 'list'
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handlePaymentAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments & Checks</h1>
                    <p className="text-gray-500">Track upcoming payments and deadlines</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-sm">
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'calendar'
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === 'list'
                                    ? 'bg-primary/10 text-primary shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <List className="w-4 h-4" />
                            List
                        </button>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Payment
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
                    <PaymentsCalendar key={refreshTrigger} />
                ) : (
                    <PaymentsList refreshTrigger={refreshTrigger} />
                )}
            </motion.div>

            {/* Add Payment Modal */}
            <AddPaymentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handlePaymentAdded}
            />
        </div>
    );
}
