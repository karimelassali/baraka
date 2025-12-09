"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, DollarSign, User, FileText, Trash2, Edit, CheckCircle, ChevronLeft, ChevronRight, Loader2, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerSearch from './CustomerSearch';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { generateEidPdf } from '@/lib/eidPdfUtils';
import { useTranslations } from 'next-intl';

export default function Reservations() {
    const t = useTranslations('Admin.Eid.Reservations');
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = Newest first, 'asc' = Oldest first
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [editingReservation, setEditingReservation] = useState(null);
    const [depositHistory, setDepositHistory] = useState([]);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    // Form States
    const [formData, setFormData] = useState({
        customer: null,
        animal_type: 'SHEEP',
        requested_weight: '40/45',
        pickup_time: '',
        deposit_amount: '',
        notes: ''
    });

    const [depositForm, setDepositForm] = useState({
        amount: '',
        notes: '',
        payment_method: 'CASH'
    });

    const weightOptions = ['-40', '40/45', '45/50', '50/55', '55/60', '60/65', '65/70', '70+'];

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // ...

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchReservations();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm, statusFilter, sortOrder]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/eid/reservations?page=${page}&limit=${limit}&sort=${sortOrder}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setReservations(result.data || []);
                setTotalPages(result.metadata?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            toast.error(t('toast.error_load'));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReservation = async () => {
        if (!formData.customer) {
            toast.error(t('toast.select_customer'));
            return;
        }

        try {
            const url = editingReservation
                ? `/api/admin/eid/reservations/${editingReservation.id}`
                : '/api/admin/eid/reservations';

            const method = editingReservation ? 'PUT' : 'POST';

            const body = {
                customer_id: formData.customer.id,
                animal_type: formData.animal_type,
                requested_weight: formData.requested_weight,
                pickup_time: formData.pickup_time,
                notes: formData.notes
            };

            if (!editingReservation) {
                body.deposit_amount = formData.deposit_amount;
            }

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                toast.success(editingReservation ? t('toast.updated') : t('toast.created'));
                setIsAddModalOpen(false);
                fetchReservations();
                resetForm();
            } else {
                toast.error(t('toast.error_save'));
            }
        } catch (error) {
            console.error('Error saving reservation:', error);
            toast.error(t('toast.error_save'));
        }
    };

    const handleEdit = (reservation) => {
        setEditingReservation(reservation);
        setFormData({
            // Robustly construct customer object. 
            // We use reservation.customer_id for the ID, and fallback to empty strings for names if the join failed.
            customer: {
                id: reservation.customer_id,
                first_name: reservation.customers?.first_name || '',
                last_name: reservation.customers?.last_name || '',
                phone_number: reservation.customers?.phone_number || ''
            },
            animal_type: reservation.animal_type,
            requested_weight: reservation.requested_weight,
            pickup_time: reservation.pickup_time ? reservation.pickup_time.slice(0, 16) : '', // Format for datetime-local
            deposit_amount: '', // Deposit not editable here, use deposit modal
            notes: reservation.notes || ''
        });
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm(t('confirm_delete'))) return;
        try {
            const response = await fetch(`/api/admin/eid/reservations/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success(t('toast.deleted'));
                fetchReservations();
            } else {
                toast.error(t('toast.error_delete'));
            }
        } catch (error) {
            toast.error(t('toast.error_delete'));
        }
    };

    const resetForm = () => {
        setEditingReservation(null);
        setFormData({
            customer: null,
            animal_type: 'SHEEP',
            requested_weight: '40/45',
            pickup_time: '',
            deposit_amount: '',
            notes: ''
        });
    };

    const handleAddDeposit = async () => {
        if (!depositForm.amount) return;

        try {
            const response = await fetch('/api/admin/eid/deposits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reservation_id: selectedReservation.id,
                    amount: depositForm.amount,
                    notes: depositForm.notes,
                    payment_method: depositForm.payment_method
                })
            });

            if (response.ok) {
                toast.success(t('toast.deposit_added'));
                fetchDeposits(selectedReservation.id);
                fetchReservations(); // Refresh main table to update total
                setDepositForm({ amount: '', notes: '', payment_method: 'CASH' });
            } else {
                toast.error(t('toast.error_deposit'));
            }
        } catch (error) {
            console.error('Error adding deposit:', error);
        }
    };

    const fetchDeposits = async (reservationId) => {
        try {
            const response = await fetch(`/api/admin/eid/deposits?reservation_id=${reservationId}`);
            if (response.ok) {
                const data = await response.json();
                setDepositHistory(data);
            }
        } catch (error) {
            console.error('Error fetching deposits:', error);
        }
    };

    const openDepositModal = (reservation) => {
        setSelectedReservation(reservation);
        fetchDeposits(reservation.id);
        setIsDepositModalOpen(true);
    };

    const handleDownloadPdf = () => {
        // Always sort Oldest to Newest for PDF
        const sortedReservations = [...reservations].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        const columns = ['Order #', 'Customer', 'Phone', 'Type', 'Weight', 'Pickup', 'Deposit', 'Status', 'Notes'];
        const data = sortedReservations.map(res => [
            res.order_number,
            `${res.customers?.first_name} ${res.customers?.last_name}`,
            res.customers?.phone_number || '-',
            res.animal_type,
            res.requested_weight,
            res.pickup_time ? new Date(res.pickup_time).toLocaleString() : '-',
            `${res.total_deposit}€`,
            res.status,
            res.notes || ''
        ]);

        generateEidPdf({
            title: t('title'),
            columns,
            data,
            filename: `reservations_${new Date().toISOString().split('T')[0]}`,
            details: {
                'Total Reservations': reservations.length,
                'Status Filter': statusFilter,
                'Sort': 'Oldest to Newest'
            }
        });
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-semibold text-red-700">{t('title')} {currentYear}</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
                        {['ALL', 'PENDING', 'CONFIRMED', 'COLLECTED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === status
                                    ? 'bg-white text-red-700 shadow-sm'
                                    : 'text-muted-foreground hover:bg-white/50'
                                    }`}
                            >
                                {t(`status.${status.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="border-red-200 text-red-700 hover:bg-red-50 px-3"
                        title={sortOrder === 'desc' ? t('sort.newest') : t('sort.oldest')}
                    >
                        {sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" onClick={handleDownloadPdf} className="border-red-200 text-red-700 hover:bg-red-50">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </Button>
                    <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('new_reservation')}
                    </Button>
                </div>
            </div>

            <GlassCard className="overflow-hidden border-t-4 border-t-red-500">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-red-50/50">
                            <TableHead className="text-red-900 font-bold">{t('table.id')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.customer')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.phone')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.type')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.weight')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.pickup')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.deposit')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.status')}</TableHead>
                            <TableHead className="text-red-900 font-bold">{t('table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : reservations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    {t('no_reservations')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            reservations.map((res) => (
                                <TableRow
                                    key={res.id}
                                    className={`hover:bg-red-50/30 transition-colors ${res.status === 'COLLECTED' && res.is_paid ? 'bg-green-50/30' : ''}`}
                                >
                                    <TableCell className="font-mono">#{res.order_number}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>
                                            {res.customers?.first_name} {res.customers?.last_name}
                                        </div>
                                        {res.notes && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <FileText className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]" title={res.notes}>{res.notes}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{res.customers?.phone_number}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={res.animal_type === 'SHEEP' ? 'border-red-200 text-red-700 bg-red-50' : 'border-orange-200 text-orange-700 bg-orange-50'}>
                                            {res.animal_type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{res.requested_weight}</TableCell>
                                    <TableCell>
                                        {res.pickup_time ? new Date(res.pickup_time).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="cursor-pointer hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                                            onClick={() => openDepositModal(res)}
                                        >
                                            {res.total_deposit}€
                                            <Plus className="w-3 h-3" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={
                                            res.status === 'COLLECTED' ? 'bg-green-500 hover:bg-green-600' :
                                                res.status === 'CONFIRMED' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'
                                        }>
                                            {res.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" className="hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(res)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(res.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="p-4 border-t flex items-center justify-between bg-muted/20">
                    <div className="text-sm text-muted-foreground">
                        {t('page')} {page} {t('of')} {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || loading}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || loading}
                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </GlassCard>

            {/* Add/Edit Reservation Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-700">{editingReservation ? t('modal.edit_title') : t('modal.new_title')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('modal.customer')}</label>
                            <CustomerSearch
                                onSelect={(c) => setFormData({ ...formData, customer: c })}
                                selectedCustomer={formData.customer}
                            />
                            {formData.customer && (
                                <div className="text-sm text-muted-foreground ml-1">
                                    {t('table.phone')}: {formData.customer.phone_number}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.type')}</label>
                                <Select
                                    value={formData.animal_type}
                                    onValueChange={(v) => setFormData({ ...formData, animal_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SHEEP">{t('types.sheep')}</SelectItem>
                                        <SelectItem value="GOAT">{t('types.goat')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.weight')}</label>
                                <Select
                                    value={formData.requested_weight}
                                    onValueChange={(v) => setFormData({ ...formData, requested_weight: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {weightOptions.map(w => (
                                            <SelectItem key={w} value={w}>{w}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {!editingReservation && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">{t('modal.initial_deposit')}</label>
                                    <Input
                                        type="number"
                                        value={formData.deposit_amount}
                                        onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
                                        className="focus-visible:ring-red-500"
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('modal.pickup_time')}</label>
                                <Input
                                    type="datetime-local"
                                    value={formData.pickup_time}
                                    onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
                                    className="focus-visible:ring-red-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('modal.notes')}</label>
                            <Input
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t('modal.cancel')}</Button>
                        <Button onClick={handleSaveReservation} className="bg-red-600 hover:bg-red-700">
                            {editingReservation ? t('modal.update') : t('modal.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deposit History Modal */}
            <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-700">{t('deposit_modal.title')}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="bg-red-50/50 p-4 rounded-lg space-y-2 border border-red-100">
                            <h4 className="font-medium text-sm text-red-900">{t('deposit_modal.add_new')}</h4>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder={t('deposit_modal.amount_placeholder')}
                                    value={depositForm.amount}
                                    onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                                    className="w-32 focus-visible:ring-red-500"
                                />
                                <Select
                                    value={depositForm.payment_method}
                                    onValueChange={(v) => setDepositForm({ ...depositForm, payment_method: v })}
                                >
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">{t('payment_methods.cash')}</SelectItem>
                                        <SelectItem value="CARD">{t('payment_methods.card')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAddDeposit} className="bg-red-600 hover:bg-red-700">{t('deposit_modal.add')}</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">{t('deposit_modal.history')}</h4>
                            <div className="border rounded-md divide-y max-h-[200px] overflow-y-auto">
                                {depositHistory.map((deposit) => (
                                    <div key={deposit.id} className="p-3 flex justify-between items-center text-sm hover:bg-muted/50">
                                        <div>
                                            <span className="font-bold text-red-700">{deposit.amount}€</span>
                                            <span className="text-muted-foreground ml-2 text-xs">
                                                {new Date(deposit.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">{deposit.payment_method}</Badge>
                                    </div>
                                ))}
                                {depositHistory.length === 0 && (
                                    <div className="p-4 text-center text-muted-foreground text-sm">{t('deposit_modal.no_deposits')}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDepositModalOpen(false)}>{t('deposit_modal.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
