import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, DollarSign, CreditCard, FileText, CheckCircle, Trash2, Clock, Hash } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

export default function PaymentDetailsModal({ payment, isOpen, onClose, onMarkAsPaid, onDelete }) {
    const t = useTranslations('Payments');
    if (!isOpen || !payment) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-6 border-b border-gray-100 bg-gray-50/50">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${payment.status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {payment.status === 'Paid' ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{t('modal.details_title')}</h2>
                                <p className={`text-sm font-medium ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {payment.status === 'Paid' ? t('status_paid') : t('status_pending')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.due_date')}</label>
                                <div className="flex items-center gap-2 text-gray-900 font-medium">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {format(parseISO(payment.due_date), 'MMM d, yyyy')}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.amount')}</label>
                                <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                                    <DollarSign className="h-4 w-4 text-gray-400" />
                                    €{payment.amount}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.recipient')}</label>
                            <div className="flex items-center gap-2 text-gray-900 font-medium p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <User className="h-4 w-4 text-gray-400" />
                                {payment.recipient}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.type')}</label>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CreditCard className="h-4 w-4 text-gray-400" />
                                    {payment.payment_type}
                                </div>
                            </div>
                            {payment.check_number && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.check_number')}</label>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                        {payment.check_number}
                                    </div>
                                </div>
                            )}
                        </div>

                        {payment.notes && (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.notes')}</label>
                                <div className="flex items-start gap-2 text-gray-600 text-sm p-3 bg-yellow-50/50 rounded-lg border border-yellow-100">
                                    <FileText className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    {payment.notes}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                        <button
                            onClick={() => onDelete(payment.id)}
                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <Trash2 className="h-4 w-4" />
                            {t('modal.delete')}
                        </button>
                        {payment.status !== 'Paid' && (
                            <button
                                onClick={() => onMarkAsPaid(payment.id)}
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                            >
                                <CheckCircle className="h-4 w-4" />
                                {t('modal.mark_paid')}
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
