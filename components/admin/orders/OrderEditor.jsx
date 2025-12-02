import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Save, Plus, Trash2, FileText, Check, Loader2, Printer, AlertCircle } from 'lucide-react';
import { useRouter } from '@/navigation';
import { getOrder, updateOrder, deleteOrder } from '@/lib/actions/orders';
import { getSuppliers } from '@/lib/actions/suppliers';
import { upsertOrderItem, deleteOrderItem } from '@/lib/actions/orderItems';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOrderPDF } from '@/lib/reports/generateOrderPDF';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function OrderEditor({ orderId }) {
    const t = useTranslations('OrderEditor');
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState([]);

    // Form state
    const [supplierId, setSupplierId] = useState('');
    const [internalNote, setInternalNote] = useState('');
    const [status, setStatus] = useState('draft');

    useEffect(() => {
        fetchData();
    }, [orderId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [orderData, suppliersData] = await Promise.all([
                getOrder(orderId),
                getSuppliers()
            ]);

            if (!orderData) {
                alert(t('order_not_found'));
                router.push('/admin/order-management');
                return;
            }

            setOrder(orderData);
            setSuppliers(suppliersData || []);

            // Initialize form state
            setSupplierId(orderData.supplier_id || '');
            setInternalNote(orderData.internal_note || '');
            setStatus(orderData.status);
            setItems(orderData.order_items || []);

        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-save on field changes (debounced could be better, but simple onBlur/change is ok for now)
    const handleUpdateOrder = async (updates) => {
        try {
            setSaving(true);
            await updateOrder(orderId, updates);
            // Update local state if needed (e.g. status change)
            if (updates.status) setStatus(updates.status);
        } catch (error) {
            console.error('Failed to update order', error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddItem = async () => {
        const newItem = {
            order_id: orderId,
            product_name: '',
            quantity: 1,
            notes: ''
        };

        try {
            const savedItem = await upsertOrderItem(newItem);
            setItems([...items, savedItem]);
        } catch (error) {
            console.error('Failed to add item', error);
        }
    };

    const handleUpdateItem = async (id, updates) => {
        // Optimistic update
        setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));

        try {
            // Debounce could be added here
            await upsertOrderItem({ id, ...updates });
        } catch (error) {
            console.error('Failed to update item', error);
            // Revert on error?
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await deleteOrderItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Failed to delete item', error);
        }
    };

    const handleGeneratePDF = async () => {
        if (!supplierId) {
            alert(t('select_supplier'));
            return;
        }

        const selectedSupplier = suppliers.find(s => s.id === supplierId);
        const orderData = {
            ...order,
            supplier_id: supplierId,
            internal_note: internalNote,
            status: status,
            suppliers: selectedSupplier,
            order_items: items
        };

        generateOrderPDF(orderData);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/admin/order-management')}
                        className="rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Order #{order?.order_number}
                            </h1>
                            <Badge variant={status === 'completed' ? 'default' : 'secondary'} className={
                                status === 'completed'
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'
                            }>
                                {status.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1">
                            {t('created_on')} {new Date(order?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleGeneratePDF}
                        className="flex-1 md:flex-none"
                    >
                        <Printer size={16} className="mr-2" />
                        {t('generate_pdf')}
                    </Button>

                    {status === 'draft' ? (
                        <Button
                            onClick={() => handleUpdateOrder({ status: 'completed' })}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                        >
                            <Check size={16} className="mr-2" />
                            {t('mark_completed')}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => handleUpdateOrder({ status: 'draft' })}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1 md:flex-none"
                        >
                            {t('reopen_draft')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Table */}
                    <GlassCard className="p-0 overflow-hidden border-0 shadow-xl bg-white/50 backdrop-blur-xl">
                        <div className="p-6 border-b border-gray-100 bg-white/50 flex justify-between items-center">
                            <h3 className="font-semibold text-lg">{t('items_title')}</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleAddItem}
                                className="text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-50"
                            >
                                <Plus size={16} className="mr-1" />
                                {t('add_item')}
                            </Button>
                        </div>

                        <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="w-[40%]">{t('table_product')}</TableHead>
                                        <TableHead className="w-[20%] text-center">{t('table_qty')}</TableHead>
                                        <TableHead className="w-[30%]">{t('table_notes')}</TableHead>
                                        <TableHead className="w-[10%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-32 text-center text-gray-400">
                                                {t('no_items')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id} className="group hover:bg-gray-50/50">
                                                <TableCell className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.product_name}
                                                        onChange={(e) => handleUpdateItem(item.id, { product_name: e.target.value })}
                                                        placeholder="Product name..."
                                                        className="w-full px-3 py-2 bg-transparent border border-transparent hover:border-gray-200 focus:border-black rounded-md transition-all outline-none font-medium"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                                        className="w-full px-3 py-2 text-center bg-transparent border border-transparent hover:border-gray-200 focus:border-black rounded-md transition-all outline-none"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2">
                                                    <input
                                                        type="text"
                                                        value={item.notes || ''}
                                                        onChange={(e) => handleUpdateItem(item.id, { notes: e.target.value })}
                                                        placeholder="Optional notes..."
                                                        className="w-full px-3 py-2 bg-transparent border border-transparent hover:border-gray-200 focus:border-black rounded-md transition-all outline-none text-gray-500 text-sm"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-2 text-center">
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 bg-red-300 text-white hover:bg-red-500 rounded-md transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {items.length > 0 && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30">
                                <Button
                                    variant="ghost"
                                    onClick={handleAddItem}
                                    className="w-full text-gray-500 hover:text-black border border-dashed border-gray-300 hover:border-gray-400"
                                >
                                    <Plus size={14} className="mr-2" /> {t('add_another')}
                                </Button>
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Sidebar / Settings */}
                <div className="space-y-6">

                    {/* Supplier Selection */}
                    <GlassCard className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={18} />
                            {t('supplier_details')}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('select_supplier')}</label>
                                <select
                                    value={supplierId}
                                    onChange={(e) => {
                                        setSupplierId(e.target.value);
                                        handleUpdateOrder({ supplier_id: e.target.value });
                                    }}
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 bg-white transition-all"
                                >
                                    <option value="">{t('choose_supplier')}</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {supplierId && (
                                <div className="p-4 bg-gray-50/80 rounded-xl text-sm text-gray-600 space-y-2 border border-gray-100">
                                    {(() => {
                                        const s = suppliers.find(sup => sup.id === supplierId);
                                        if (!s) return null;
                                        return (
                                            <>
                                                <p className="font-bold text-gray-900 text-base">{s.name}</p>
                                                <div className="space-y-1">
                                                    <p className="flex items-start gap-2">
                                                        <span className="text-gray-400 min-w-[60px]">Address:</span>
                                                        {s.address}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-gray-400 min-w-[60px]">Email:</span>
                                                        {s.email}
                                                    </p>
                                                    <p className="flex items-center gap-2">
                                                        <span className="text-gray-400 min-w-[60px]">Phone:</span>
                                                        {s.phone}
                                                    </p>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Internal Note */}
                    <GlassCard className="border-0 shadow-lg bg-white/80 backdrop-blur-xl">
                        <h3 className="font-semibold text-gray-900 mb-2">{t('internal_note')}</h3>
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {t('note_hint')}
                        </p>
                        <textarea
                            value={internalNote}
                            onChange={(e) => {
                                setInternalNote(e.target.value);
                            }}
                            onBlur={() => handleUpdateOrder({ internal_note: internalNote })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 min-h-[120px] resize-none text-sm"
                            placeholder="e.g. Order for Ramadan stock..."
                        ></textarea>
                    </GlassCard>

                    {/* Danger Zone */}
                    <div className="pt-4">
                        <Button
                            variant="ghost"
                            onClick={async () => {
                                if (confirm(t('delete_confirm'))) {
                                    await deleteOrder(orderId);
                                    router.push('/admin/order-management');
                                }
                            }}
                            className="w-full bg-red-500 hover:bg-red-600 text-white hover:text-red-700"
                        >
                            <Trash2 size={16} className="mr-2" />
                            {t('delete_order')}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}
