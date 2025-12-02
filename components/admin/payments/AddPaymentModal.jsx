import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, DollarSign, CreditCard, FileText, Check, AlertCircle, Hash } from 'lucide-react';

const PAYMENT_TYPES = [
    { id: 'Check', label: 'Check', icon: '🎫' },
    { id: 'Bank Transfer', label: 'Bank Transfer', icon: '🏦' },
    { id: 'Cash', label: 'Cash', icon: '💵' },
    { id: 'Credit Card', label: 'Credit Card', icon: '💳' },
    { id: 'Other', label: 'Other', icon: '📝' }
];

export default function AddPaymentModal({
    isOpen,
    onClose,
    onSuccess
}) {
    const [formData, setFormData] = useState({
        due_date: '',
        recipient: '',
        amount: '',
        payment_type: 'Check',
        check_number: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                due_date: '',
                recipient: '',
                amount: '',
                payment_type: 'Check',
                check_number: '',
                notes: ''
            });
            setError(null);
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            onSuccess(data.payment);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                    className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative p-6">
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                Add New Payment
                            </h2>
                            <p className="text-sm text-gray-600">
                                Schedule a new payment or check
                            </p>
                        </div>

                        {/* Error Alert */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2"
                                >
                                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                    <p className="text-sm text-red-700 flex-1">{error}</p>
                                    <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                                        <X className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Due Date & Amount */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Calendar className="inline h-4 w-4 mr-1 text-primary" />
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        name="due_date"
                                        value={formData.due_date}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <DollarSign className="inline h-4 w-4 mr-1 text-primary" />
                                        Amount (EUR)
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Recipient */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <User className="inline h-4 w-4 mr-1 text-primary" />
                                    Recipient / Company
                                </label>
                                <input
                                    type="text"
                                    name="recipient"
                                    value={formData.recipient}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Supplier Name"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                />
                            </div>

                            {/* Payment Type & Check Number */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <CreditCard className="inline h-4 w-4 mr-1 text-primary" />
                                        Payment Type
                                    </label>
                                    <select
                                        name="payment_type"
                                        value={formData.payment_type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                    >
                                        {PAYMENT_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.icon} {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        <Hash className="inline h-4 w-4 mr-1 text-primary" />
                                        Check Number <span className="text-gray-500 text-xs">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="check_number"
                                        value={formData.check_number}
                                        onChange={handleChange}
                                        placeholder="Check #"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    <FileText className="inline h-4 w-4 mr-1 text-primary" />
                                    Notes <span className="text-gray-500 text-xs">(Optional)</span>
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Additional details..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-white transition-all resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Save Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
