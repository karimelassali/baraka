"use client";

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Truck, DollarSign, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';

export default function Delivery() {
    const [searchTerm, setSearchTerm] = useState('');
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    // Delivery Form
    const [form, setForm] = useState({
        final_weight: '',
        tag_number: '',
        final_price: '',
        is_paid: false,
        status: 'CONFIRMED'
    });

    useEffect(() => {
        // Initial load
        searchReservations(1, true);
    }, []);

    useEffect(() => {
        // Debounced search
        const timer = setTimeout(() => {
            searchReservations(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const searchReservations = async (pageNum = 1, reset = false) => {
        if (loading && !reset) return; // Prevent duplicate fetches unless resetting
        setLoading(true);
        try {
            const url = searchTerm
                ? `/api/admin/eid/reservations?search=${searchTerm}&page=${pageNum}&limit=${limit}`
                : `/api/admin/eid/reservations?page=${pageNum}&limit=${limit}`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                const newReservations = result.data || [];

                if (reset) {
                    setReservations(newReservations);
                } else {
                    setReservations(prev => [...prev, ...newReservations]);
                }

                setHasMore(newReservations.length === limit);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            searchReservations(page + 1, false);
        }
    };

    const handleSelect = (res) => {
        setSelectedReservation(res);
        setForm({
            final_weight: res.final_weight || '',
            tag_number: res.tag_number || '',
            final_price: res.final_price || '',
            is_paid: res.is_paid || false,
            status: res.status
        });
        // Do NOT clear reservations here, so user can go back
    };

    const handleUpdate = async () => {
        if (!selectedReservation) return;
        setUpdating(true);

        try {
            const response = await fetch(`/api/admin/eid/reservations/${selectedReservation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    final_weight: form.final_weight,
                    tag_number: form.tag_number,
                    is_paid: form.is_paid,
                    status: form.status,
                    collected_at: form.status === 'COLLECTED' ? new Date().toISOString() : null
                })
            });

            if (response.ok) {
                toast.success('Delivery updated');

                // Update the item in the local list
                setReservations(prev => prev.map(r =>
                    r.id === selectedReservation.id
                        ? { ...r, ...form, collected_at: form.status === 'COLLECTED' ? new Date().toISOString() : null }
                        : r
                ));

                setSelectedReservation(null); // Go back to list
            } else {
                toast.error('Failed to update');
            }
        } catch (error) {
            toast.error('Error updating delivery');
        } finally {
            setUpdating(false);
        }
    };

    // Calculate financials
    const totalDeposit = selectedReservation?.total_deposit || 0;
    const remaining = (Number(form.final_price) || 0) - totalDeposit;

    const currentYear = new Date().getFullYear();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-red-700">Delivery Management {currentYear}</h2>
            </div>

            {!selectedReservation ? (
                <div className="relative max-w-md mx-auto space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Customer Name or Order #..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-12 text-lg focus-visible:ring-red-500 border-red-200"
                        />
                        {loading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    <div className="space-y-2">
                        {reservations.map((res) => (
                            <div
                                key={res.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${res.status === 'COLLECTED'
                                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                    : 'bg-white border-border hover:bg-red-50 hover:border-red-200'
                                    }`}
                                onClick={() => handleSelect(res)}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-red-900">#{res.order_number}</span>
                                    <Badge variant="outline" className={
                                        res.status === 'COLLECTED'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : 'border-red-200 text-red-700'
                                    }>
                                        {res.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="font-medium">{res.customers?.first_name} {res.customers?.last_name}</div>
                                    <Badge variant="secondary">{res.animal_type}</Badge>
                                </div>
                            </div>
                        ))}

                        {reservations.length === 0 && !loading && (
                            <div className="text-center text-muted-foreground py-8">
                                No reservations found.
                            </div>
                        )}

                        {hasMore && (
                            <Button
                                variant="ghost"
                                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Load More
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button
                        variant="ghost"
                        className="md:col-span-2 w-fit"
                        onClick={() => setSelectedReservation(null)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Button>

                    <GlassCard className={`p-6 space-y-6 border-t-4 ${form.status === 'COLLECTED' ? 'border-t-green-500 bg-green-50/30' : 'border-t-red-500'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-red-900">
                                    {selectedReservation.customers?.first_name} {selectedReservation.customers?.last_name}
                                </h3>
                                <p className="text-muted-foreground">Order #{selectedReservation.order_number}</p>
                            </div>
                            <Badge className="text-lg px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200">{selectedReservation.animal_type}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Requested Weight</label>
                                <Input value={selectedReservation.requested_weight} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Final Weight (kg)</label>
                                <Input
                                    type="number"
                                    value={form.final_weight}
                                    onChange={(e) => setForm({ ...form, final_weight: e.target.value })}
                                    className="font-bold text-lg focus-visible:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tag Number</label>
                                <Input
                                    value={form.tag_number}
                                    onChange={(e) => setForm({ ...form, tag_number: e.target.value })}
                                    className="focus-visible:ring-red-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Final Price (€)</label>
                                <Input
                                    type="number"
                                    value={form.final_price}
                                    onChange={(e) => setForm({ ...form, final_price: e.target.value })}
                                    placeholder="Total Amount"
                                    className="focus-visible:ring-red-500"
                                />
                            </div>
                        </div>

                        <div className="bg-red-50/50 p-4 rounded-xl space-y-3 border border-red-100">
                            <div className="flex justify-between text-sm">
                                <span>Deposit Paid:</span>
                                <span className="font-bold text-green-600">{totalDeposit}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Final Total:</span>
                                <span className="font-bold">{form.final_price || 0}€</span>
                            </div>
                            <div className="border-t border-red-200 pt-2 flex justify-between text-lg font-bold">
                                <span>Remaining:</span>
                                <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {remaining.toFixed(2)}€
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className={`p-6 space-y-6 flex flex-col justify-center border-t-4 ${form.status === 'COLLECTED' ? 'border-t-green-500 bg-green-50/30' : 'border-t-red-500'}`}>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-red-900">Status Updates</h4>

                            <div
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${form.is_paid
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-muted hover:border-green-200'
                                    }`}
                                onClick={() => setForm({ ...form, is_paid: !form.is_paid })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.is_paid ? 'bg-green-500 text-white' : 'bg-muted'
                                        }`}>
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Payment Status</div>
                                        <div className="text-sm text-muted-foreground">
                                            {form.is_paid ? 'Paid in Full' : 'Payment Pending'}
                                        </div>
                                    </div>
                                </div>
                                {form.is_paid && <CheckCircle className="w-6 h-6 text-green-500" />}
                            </div>

                            <div
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${form.status === 'COLLECTED'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-muted hover:border-blue-200'
                                    }`}
                                onClick={() => setForm({ ...form, status: form.status === 'COLLECTED' ? 'CONFIRMED' : 'COLLECTED' })}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.status === 'COLLECTED' ? 'bg-green-500 text-white' : 'bg-muted'
                                        }`}>
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Collection Status</div>
                                        <div className="text-sm text-muted-foreground">
                                            {form.status === 'COLLECTED' ? 'Collected' : 'Not Collected'}
                                        </div>
                                    </div>
                                </div>
                                {form.status === 'COLLECTED' && <CheckCircle className="w-6 h-6 text-green-500" />}
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className={`w-full ${form.status === 'COLLECTED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            onClick={handleUpdate}
                            disabled={updating}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Save Changes
                        </Button>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
