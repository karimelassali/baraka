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

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PAID, UNPAID, COLLECTED, NOT_COLLECTED
    const [destinationFilter, setDestinationFilter] = useState('ALL');
    const [destinations, setDestinations] = useState([]);
    const [configuredDestinations, setConfiguredDestinations] = useState([]);

    useEffect(() => {
        fetchConfiguredDestinations();
    }, []);

    const fetchConfiguredDestinations = async () => {
        try {
            const res = await fetch('/api/admin/eid/settings?type=destinations');
            if (res.ok) {
                setConfiguredDestinations(await res.json());
            }
        } catch (e) {
            console.error("Error fetching destinations", e);
        }
    };

    // Available Tags
    const [availableTags, setAvailableTags] = useState([]);
    const [tagSearch, setTagSearch] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    // Delivery Form
    const [form, setForm] = useState({
        final_weight: '',
        tag_number: '',
        tag_color: '', // For display only
        final_price: '',
        destination: '',
        is_paid: false,
        status: 'CONFIRMED'
    });

    useEffect(() => {
        // Initial load
        searchReservations(1, true);
        fetchTags();
    }, []);

    useEffect(() => {
        // Debounced search
        const timer = setTimeout(() => {
            searchReservations(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, destinationFilter]);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/admin/eid/purchases?limit=1000');
            if (res.ok) {
                const { data } = await res.json();
                setAvailableTags(data || []);
            }
        } catch (e) {
            console.error("Error fetching tags", e);
        }
    };

    const searchReservations = async (pageNum = 1, reset = false) => {
        if (loading && !reset) return;
        setLoading(true);
        try {
            let url = `/api/admin/eid/reservations?page=${pageNum}&limit=${limit}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (statusFilter !== 'ALL') url += `&statusFilter=${statusFilter}`;
            if (destinationFilter !== 'ALL') url += `&destination=${destinationFilter}`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                const newReservations = result.data || [];

                if (reset) {
                    setReservations(newReservations);
                    // Extract unique destinations from all data (or at least current batch + existing)
                    // Ideally API should return this, but for now we can accumulate from client view or fetch separately
                } else {
                    setReservations(prev => [...prev, ...newReservations]);
                }

                setHasMore(newReservations.length === limit);
                setPage(pageNum);

                // Update destinations list from current data
                const allDests = [...new Set(newReservations.map(r => r.destination).filter(Boolean))];
                setDestinations(prev => [...new Set([...prev, ...allDests])]);
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
        // Find tag color if tag exists
        const tag = availableTags.find(t => t.tag_number === res.tag_number);

        setForm({
            final_weight: res.final_weight || '',
            tag_number: res.tag_number || '',
            tag_color: tag?.tag_color || '',
            final_price: res.final_price || '',
            destination: res.destination || '',
            is_paid: res.is_paid || false,
            status: res.status
        });
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
                    final_price: form.final_price,
                    destination: form.destination,
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
                        ? {
                            ...r,
                            ...form,
                            collected_at: form.status === 'COLLECTED' ? new Date().toISOString() : null
                        }
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
    // If final_price is set, use it. Otherwise, we don't calculate automatically to avoid overwriting user input with a calculation.
    // But user asked: "always keep final price shown if i already add it , not each time add final price and calcule , if i did it ione time keep it"
    // So we rely on form.final_price.

    const remaining = (Number(form.final_price) || 0) - totalDeposit;

    const currentYear = new Date().getFullYear();

    // Filter available tags based on search
    const filteredTags = availableTags.filter(t =>
        t.tag_number.toLowerCase().includes(tagSearch.toLowerCase()) &&
        (t.animal_type === selectedReservation?.animal_type) // Only show tags of same type
    );

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

                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <Badge
                            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setStatusFilter('ALL')}
                        >
                            All
                        </Badge>
                        <Badge
                            variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                            className="cursor-pointer whitespace-nowrap bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                            onClick={() => setStatusFilter(statusFilter === 'PAID' ? 'ALL' : 'PAID')}
                        >
                            Paid
                        </Badge>
                        <Badge
                            variant={statusFilter === 'UNPAID' ? 'default' : 'outline'}
                            className="cursor-pointer whitespace-nowrap bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                            onClick={() => setStatusFilter(statusFilter === 'UNPAID' ? 'ALL' : 'UNPAID')}
                        >
                            Unpaid
                        </Badge>
                        <Badge
                            variant={statusFilter === 'COLLECTED' ? 'default' : 'outline'}
                            className="cursor-pointer whitespace-nowrap bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200"
                            onClick={() => setStatusFilter(statusFilter === 'COLLECTED' ? 'ALL' : 'COLLECTED')}
                        >
                            Collected
                        </Badge>
                        <Badge
                            variant={statusFilter === 'NOT_COLLECTED' ? 'default' : 'outline'}
                            className="cursor-pointer whitespace-nowrap bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                            onClick={() => setStatusFilter(statusFilter === 'NOT_COLLECTED' ? 'ALL' : 'NOT_COLLECTED')}
                        >
                            Not Collected
                        </Badge>
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
                                    <div className="flex gap-1">
                                        {res.is_paid && (
                                            <Badge className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full">
                                                <DollarSign className="w-3 h-3" />
                                            </Badge>
                                        )}
                                        {res.status === 'COLLECTED' && (
                                            <Badge className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full">
                                                <Truck className="w-3 h-3" />
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="font-medium">{res.customers?.first_name} {res.customers?.last_name}</div>
                                    <Badge variant="secondary">{res.animal_type}</Badge>
                                </div>
                                {res.destination && (
                                    <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                        <Truck className="w-3 h-3" /> {res.destination}
                                    </div>
                                )}
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

                            {/* Tag Selection */}
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Tag Number</label>
                                <div className="relative">
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            placeholder="Search tag..."
                                            value={tagSearch}
                                            onChange={(e) => setTagSearch(e.target.value)}
                                            className="flex-1"
                                        />
                                        {form.tag_color && (
                                            <div
                                                className="w-10 h-10 rounded border shadow-sm"
                                                style={{ backgroundColor: form.tag_color }}
                                                title="Tag Color"
                                            />
                                        )}
                                    </div>
                                    {tagSearch && (
                                        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {filteredTags.map(tag => (
                                                <div
                                                    key={tag.id}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                                    onClick={() => {
                                                        setForm({
                                                            ...form,
                                                            tag_number: tag.tag_number,
                                                            tag_color: tag.tag_color,
                                                            final_weight: form.final_weight || tag.weight // Auto-fill weight if empty
                                                        });
                                                        setTagSearch('');
                                                    }}
                                                >
                                                    <span>{tag.tag_number} ({tag.weight}kg)</span>
                                                    {tag.tag_color && (
                                                        <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: tag.tag_color }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            {filteredTags.length === 0 && (
                                                <div className="p-2 text-muted-foreground text-sm">No tags found</div>
                                            )}
                                        </div>
                                    )}
                                    {form.tag_number && !tagSearch && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-bold text-lg">{form.tag_number}</span>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setForm({ ...form, tag_number: '', tag_color: '' });
                                                setTagSearch('');
                                            }}>Change</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Final Price (€)</label>
                                <Input
                                    type="number"
                                    value={form.final_price}
                                    onChange={(e) => setForm({ ...form, final_price: e.target.value })}
                                    placeholder="Total Amount"
                                    className="focus-visible:ring-red-500 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Destination</label>
                                <Input
                                    value={form.destination}
                                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                                    placeholder="e.g. Slaughterhouse"
                                    className="focus-visible:ring-red-500"
                                    list="destinations-list"
                                />
                                <datalist id="destinations-list">
                                    {configuredDestinations.map(d => (
                                        <option key={d.id} value={d.name} />
                                    ))}
                                </datalist>
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
