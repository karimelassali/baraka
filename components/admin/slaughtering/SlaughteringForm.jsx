'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, Plus, PlusCircle, Calculator, X, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { createSlaughteringRecord, updateSlaughteringRecord } from '@/lib/actions/slaughtering';
import { getSuppliers, createSupplier } from '@/lib/actions/suppliers';

export default function SlaughteringForm({ onSuccess, initialData, onCancel }) {
    const t = useTranslations('Admin.Slaughtering');
    const tCommon = useTranslations('Common');

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        supplier_id: '',
        animal_type: 'bovine',
        quantity: 1,
        live_weight: '',
        slaughtered_weight: '',
        live_purchase_price: '',
        final_price: '',
        slaughtering_cost: '',
    });

    const [totals, setTotals] = useState({
        total_purchase_cost: 0,
        final_total_cost: 0
    });

    // New Supplier Modal State
    const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                supplier_id: initialData.supplier_id || '',
                animal_type: initialData.animal_type || 'bovine',
                quantity: initialData.quantity || 1,
                live_weight: initialData.live_weight || '',
                slaughtered_weight: initialData.slaughtered_weight || '',
                live_purchase_price: initialData.live_purchase_price || '',
                final_price: initialData.final_price || '',
                slaughtering_cost: initialData.slaughtering_cost || '',
            });
        }
    }, [initialData]);

    useEffect(() => {
        calculateTotals();
    }, [formData]);

    const fetchSuppliers = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data || []);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const calculateTotals = () => {
        const liveWeight = parseFloat(formData.live_weight) || 0;
        const livePrice = parseFloat(formData.live_purchase_price) || 0;
        const slaughteredWeight = parseFloat(formData.slaughtered_weight) || 0;
        const finalPrice = parseFloat(formData.final_price) || 0;
        const slaughterCost = parseFloat(formData.slaughtering_cost) || 0;

        const totalPurchaseCost = liveWeight * livePrice;
        const finalTotalCost = (finalPrice * slaughteredWeight) + slaughterCost;

        setTotals({
            total_purchase_cost: totalPurchaseCost,
            final_total_cost: finalTotalCost
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const record = {
                ...formData,
                ...totals,
                record_date: initialData ? initialData.record_date : new Date().toISOString()
            };

            if (initialData) {
                await updateSlaughteringRecord(initialData.id, record);
                toast.success(tCommon('save') + ' ' + t('record_added_success')); // Or generic success
            } else {
                await createSlaughteringRecord(record);
                toast.success(t('record_added_success'));

                // Reset form only if creating
                setFormData({
                    supplier_id: '',
                    animal_type: 'bovine',
                    quantity: 1,
                    live_weight: '',
                    slaughtered_weight: '',
                    live_purchase_price: '',
                    final_price: '',
                    slaughtering_cost: '',
                });
            }

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Submit error:', error);
            toast.error(t('record_added_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateSupplier = async () => {
        if (!newSupplierName.trim()) return;
        try {
            const newSupplier = await createSupplier({ name: newSupplierName });
            if (newSupplier) {
                setSuppliers(prev => [...prev, newSupplier]);
                setFormData(prev => ({ ...prev, supplier_id: newSupplier.id }));
                setIsNewSupplierOpen(false);
                setNewSupplierName('');
                toast.success('Supplier added successfully');
            }
        } catch (error) {
            console.error('Create supplier error:', error);
            toast.error('Failed to create supplier');
        }
    };

    return (
        <GlassCard className="p-6 border-l-4 border-l-red-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-red-700">
                    {initialData ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {initialData ? tCommon('edit') : t('add_new_record')}
                </h3>
                {initialData && onCancel && (
                    <button onClick={onCancel} className="p-1 hover:bg-red-50 rounded-full text-red-500">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Supplier Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('supplier')}</label>
                        <div className="flex gap-2">
                            <select
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleChange}
                                required
                                className="flex-1 p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                            >
                                <option value="">{t('select_supplier')}</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                onClick={() => setIsNewSupplierOpen(true)}
                                size="icon"
                                variant="outline"
                                className="border-red-200 hover:bg-red-50 text-red-600"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Animal Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('animal_type')}</label>
                        <div className="flex gap-2 p-1 bg-gray-100/80 rounded-xl border border-gray-200">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, animal_type: 'bovine' })}
                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.animal_type === 'bovine'
                                    ? 'bg-white shadow-sm text-red-600 ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {t('bovine')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, animal_type: 'ovine' })}
                                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${formData.animal_type === 'ovine'
                                    ? 'bg-white shadow-sm text-red-600 ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {t('ovine')}
                            </button>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('quantity')}</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            required
                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                        />
                    </div>

                    {/* Live Weight */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('live_weight')} (kg)</label>
                        <input
                            type="number"
                            name="live_weight"
                            value={formData.live_weight}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                        />
                    </div>

                    {/* Live Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('live_purchase_price')} (€/kg)</label>
                        <input
                            type="number"
                            name="live_purchase_price"
                            value={formData.live_purchase_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Auto Calculated Section 1 */}
                <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-2xl border border-red-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-red-900 font-medium flex items-center gap-2">
                            <div className="p-1.5 bg-red-100 rounded-lg">
                                <Calculator className="w-4 h-4 text-red-600" />
                            </div>
                            {t('total_purchase_cost')}
                        </span>
                        <span className="text-2xl font-bold text-red-700 tracking-tight">
                            € {totals.total_purchase_cost.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Slaughtered Weight */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('slaughtered_weight')} (kg)</label>
                        <input
                            type="number"
                            name="slaughtered_weight"
                            value={formData.slaughtered_weight}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                        />
                    </div>

                    {/* Final Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('final_price')} (€/kg)</label>
                        <input
                            type="number"
                            name="final_price"
                            value={formData.final_price}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                        />
                    </div>

                    {/* Slaughtering Cost */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">{t('slaughtering_cost')} (€)</label>
                        <input
                            type="number"
                            name="slaughtering_cost"
                            value={formData.slaughtering_cost}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            className="w-full p-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-red-100 focus:border-red-400 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Auto Calculated Section 2 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 p-5 rounded-2xl border border-green-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-xl" />

                    <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-1">
                            <span className="text-green-900 font-medium flex items-center gap-2">
                                <div className="p-1.5 bg-green-100 rounded-lg">
                                    <Calculator className="w-4 h-4 text-green-700" />
                                </div>
                                {t('final_total_cost')}
                            </span>
                            <p className="text-xs text-green-600/80 pl-9 font-medium">
                                ({t('final_price')} × {t('slaughtered_weight')}) + {t('slaughtering_cost')}
                            </p>
                        </div>
                        <span className="text-3xl font-bold text-green-700 tracking-tight">
                            € {totals.final_total_cost.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-95"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {t('saving')}
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                {t('save_record')}
                            </>
                        )}
                    </Button>
                </div>
            </form>

            {/* New Supplier Modal */}
            {isNewSupplierOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <GlassCard className="w-full max-w-md p-0 overflow-hidden border-0 shadow-2xl">
                        <div className="bg-red-600 p-4 flex justify-between items-center text-white">
                            <h4 className="font-bold text-lg flex items-center gap-2">
                                <PlusCircle className="w-5 h-5" />
                                {t('add_new_supplier')}
                            </h4>
                            <button
                                onClick={() => setIsNewSupplierOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 bg-white space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{t('supplier_name_placeholder')}</label>
                                <input
                                    type="text"
                                    value={newSupplierName}
                                    onChange={(e) => setNewSupplierName(e.target.value)}
                                    placeholder={t('supplier_name_placeholder')}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsNewSupplierOpen(false)}
                                    className="border-gray-200 hover:bg-gray-50 text-gray-700 h-11 px-6 rounded-xl"
                                >
                                    {tCommon('cancel')}
                                </Button>
                                <Button
                                    onClick={handleCreateSupplier}
                                    className="bg-red-600 hover:bg-red-700 text-white h-11 px-6 rounded-xl shadow-lg shadow-red-200"
                                >
                                    {tCommon('add')}
                                </Button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </GlassCard>
    );
}
