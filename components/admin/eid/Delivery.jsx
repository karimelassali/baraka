import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Truck, DollarSign, ChevronLeft, Loader2, Users, AlertCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function Delivery() {
    const t = useTranslations('Admin.Eid.Delivery');
    const [searchTerm, setSearchTerm] = useState('');
    const [reservations, setReservations] = useState([]);
    const [groups, setGroups] = useState([]);
    const [combinedItems, setCombinedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Filters
    const [statusFilters, setStatusFilters] = useState(['ALL']); // ALL, PAID, UNPAID, COLLECTED, NOT_COLLECTED
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
    const [usedTags, setUsedTags] = useState(new Set());
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
        fetchUsedTags();
    }, []);

    useEffect(() => {
        // Debounced search
        const timer = setTimeout(() => {
            searchReservations(1, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilters, destinationFilter]);

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

    const fetchUsedTags = async () => {
        try {
            const [resReservations, resGroups] = await Promise.all([
                fetch('/api/admin/eid/reservations?limit=2000'),
                fetch('/api/admin/eid/cattle?limit=2000')
            ]);

            const used = new Set();

            if (resReservations.ok) {
                const { data } = await resReservations.json();
                data.forEach(r => {
                    if (r.tag_number) used.add(r.tag_number.trim());
                });
            }

            if (resGroups.ok) {
                const { data } = await resGroups.json();
                data.forEach(g => {
                    if (g.eid_cattle_members && Array.isArray(g.eid_cattle_members)) {
                        g.eid_cattle_members.forEach(m => {
                            if (m.tag_number) used.add(m.tag_number.trim());
                        });
                    }
                });
            }

            setUsedTags(used);
        } catch (e) {
            console.error("Error fetching used tags", e);
        }
    };

    const searchReservations = async (pageNum = 1, reset = false) => {
        if (loading && !reset) return;
        setLoading(true);
        try {
            let url = `/api/admin/eid/reservations?page=${pageNum}&limit=${limit}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (!statusFilters.includes('ALL')) url += `&statusFilter=${statusFilters.join(',')}`;
            if (destinationFilter !== 'ALL') url += `&destination=${destinationFilter}`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                const newReservations = result.data || [];

                // Fetch Groups as well
                let newGroups = [];
                try {
                    let groupUrl = `/api/admin/eid/cattle?page=${pageNum}&limit=${limit}`;
                    if (searchTerm) groupUrl += `&search=${searchTerm}`;

                    // Map filters for Groups
                    if (!statusFilters.includes('ALL')) {
                        const groupStatuses = [];
                        if (statusFilters.includes('PAID')) groupStatuses.push('PAID');
                        if (statusFilters.includes('UNPAID')) groupStatuses.push('PENDING');
                        if (statusFilters.includes('COLLECTED')) groupStatuses.push('COMPLETED');
                        if (statusFilters.includes('NOT_COLLECTED')) groupStatuses.push('PENDING', 'PAID', 'DELIVERED');

                        if (groupStatuses.length > 0) {
                            groupUrl += `&status=${[...new Set(groupStatuses)].join(',')}`;
                        }
                    }

                    const groupRes = await fetch(groupUrl);
                    if (groupRes.ok) {
                        const groupResult = await groupRes.json();
                        let fetchedGroups = groupResult.data || [];

                        if (statusFilters.includes('NOT_COLLECTED') && !statusFilters.includes('COLLECTED')) {
                            fetchedGroups = fetchedGroups.filter(g => g.status !== 'COMPLETED' && g.status !== 'CANCELLED');
                        }
                        newGroups = fetchedGroups;
                    }
                } catch (e) {
                    console.error("Error fetching groups", e);
                }

                if (reset) {
                    setReservations(newReservations);
                    setGroups(newGroups);
                } else {
                    setReservations(prev => [...prev, ...newReservations]);
                    setGroups(prev => [...prev, ...newGroups]);
                }

                // Combine and sort by date (newest first) - simplistic approach
                const combined = [
                    ...newReservations.map(r => ({ ...r, type: 'RESERVATION' })),
                    ...newGroups.map(g => ({ ...g, type: 'GROUP' }))
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                setCombinedItems(reset ? combined : [...combinedItems, ...combined]);


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

    const handleSelect = (item) => {
        setSelectedItem(item);

        if (item.type === 'RESERVATION') {
            // Find tag color if tag exists
            const tag = availableTags.find(t => t.tag_number === item.tag_number);

            setForm({
                final_weight: item.final_weight || '',
                tag_number: item.tag_number || '',
                tag_color: tag?.tag_color || '',
                final_price: item.final_price || '',
                destination: item.destination || '',
                is_paid: item.is_paid || false,
                status: item.status
            });
        } else {
            // Group
            setForm({
                final_weight: item.cattle_weight || '',
                tag_number: '', // Groups don't have single tag
                tag_color: '',
                final_price: item.price || '',
                destination: '', // Groups might not have destination field yet, or use generic
                is_paid: item.status === 'PAID' || item.status === 'COMPLETED',
                status: item.status
            });
        }
    };

    const handleUpdate = async () => {
        if (!selectedItem) return;
        setUpdating(true);

        try {
            let response;
            if (selectedItem.type === 'RESERVATION') {
                response = await fetch(`/api/admin/eid/reservations/${selectedItem.id}`, {
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
            } else {
                // Update Group
                let newStatus = form.status;
                if (form.is_paid && newStatus === 'PENDING') newStatus = 'PAID';
                if (!form.is_paid && newStatus === 'PAID') newStatus = 'PENDING';

                response = await fetch(`/api/admin/eid/cattle`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedItem.id,
                        cattle_weight: form.final_weight,
                        price: form.final_price,
                        status: newStatus,
                        tag_number: form.tag_number // Pass tag number for assignment
                    })
                });
            }

            if (response.ok) {
                toast.success(t('toast.updated'));

                // Update local state
                setCombinedItems(prev => prev.map(item =>
                    item.id === selectedItem.id
                        ? { ...item, ...form, status: form.status, is_paid: form.is_paid } // Simplified update
                        : item
                ));

                // Refresh used tags if tag was changed
                fetchUsedTags();

                setSelectedItem(null);
            } else {
                toast.error(t('toast.error_update'));
            }
        } catch (error) {
            toast.error(t('toast.error_update'));
        } finally {
            setUpdating(false);
        }
    };

    // Calculate financials
    const totalDeposit = selectedItem?.total_deposit || 0;
    const remaining = (Number(form.final_price) || 0) - totalDeposit;
    const currentYear = new Date().getFullYear();

    // Filter available tags based on search
    const filteredTags = availableTags.filter(t =>
        t.tag_number.toLowerCase().includes(tagSearch.toLowerCase()) &&
        (selectedItem?.type === 'RESERVATION' ? t.animal_type === selectedItem?.animal_type : true)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-red-700">{t('title')} {currentYear}</h2>
            </div>

            {!selectedItem ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-12 text-lg focus-visible:ring-red-500 border-red-200 w-full"
                        />
                        {loading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1 bg-muted/20 p-1 rounded-lg overflow-x-auto no-scrollbar">
                        {['ALL', 'PAID', 'UNPAID', 'COLLECTED', 'NOT_COLLECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    if (status === 'ALL') {
                                        setStatusFilters(['ALL']);
                                    } else {
                                        setStatusFilters(prev => {
                                            if (prev.includes('ALL')) return [status];
                                            if (prev.includes(status)) {
                                                const newFilters = prev.filter(s => s !== status);
                                                return newFilters.length === 0 ? ['ALL'] : newFilters;
                                            }
                                            return [...prev, status];
                                        });
                                    }
                                }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${statusFilters.includes(status)
                                    ? 'bg-white text-red-700 shadow-sm ring-1 ring-black/5 font-bold'
                                    : 'text-muted-foreground hover:bg-white/50'
                                    }`}
                            >
                                {t(`filters.${status.toLowerCase()}`)}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {combinedItems.map((item) => {
                            // Green only if PAID AND COLLECTED/COMPLETED
                            const isCompleted = item.status === 'COLLECTED' || item.status === 'COMPLETED';
                            const isPaid = item.is_paid || item.status === 'PAID';
                            const isGreen = isCompleted && isPaid;

                            return (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${isGreen
                                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                                        : 'bg-white border-border hover:bg-red-50 hover:border-red-200'
                                        }`}
                                    onClick={() => handleSelect(item)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            {item.type === 'GROUP' && <Users className="w-4 h-4 text-red-700" />}
                                            <span className="font-bold text-red-900">
                                                {item.type === 'GROUP' ? item.group_name : `#${item.order_number}`}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            {isPaid && (
                                                <Badge className="bg-green-500 hover:bg-green-600 text-white p-1 rounded-full">
                                                    <DollarSign className="w-3 h-3" />
                                                </Badge>
                                            )}
                                            {isCompleted && (
                                                <Badge className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full">
                                                    <Truck className="w-3 h-3" />
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="font-medium">
                                            {item.type === 'GROUP'
                                                ? t('members_count', { count: item.eid_cattle_members?.length || 0 })
                                                : `${item.customers?.first_name} ${item.customers?.last_name}`}
                                        </div>
                                        <Badge variant="secondary">{item.type === 'GROUP' ? t('group_badge') : item.animal_type}</Badge>
                                    </div>
                                    {item.destination && (
                                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                                            <Truck className="w-3 h-3" /> {item.destination}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {combinedItems.length === 0 && !loading && (
                            <div className="text-center text-muted-foreground py-8">
                                {t('no_reservations')}
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
                                {t('load_more')}
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button
                        variant="ghost"
                        className="md:col-span-2 w-fit"
                        onClick={() => setSelectedItem(null)}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        {t('back_to_list')}
                    </Button>

                    <GlassCard className={`p-6 space-y-6 border-t-4 ${(form.status === 'COLLECTED' || form.status === 'COMPLETED') && form.is_paid ? 'border-t-green-500 bg-green-50/30' : 'border-t-red-500'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-red-900">
                                    {selectedItem.type === 'GROUP'
                                        ? selectedItem.group_name
                                        : `${selectedItem.customers?.first_name} ${selectedItem.customers?.last_name}`}
                                </h3>
                                <p className="text-muted-foreground">
                                    {selectedItem.type === 'GROUP' ? t('cattle_group_label') : t('order_number', { number: selectedItem.order_number })}
                                </p>
                            </div>
                            <Badge className="text-lg px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200">
                                {selectedItem.type === 'GROUP' ? t('group_badge') : selectedItem.animal_type}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('details.requested_weight')}</label>
                                <Input value={selectedItem.type === 'GROUP' ? (selectedItem.cattle_weight || '-') : selectedItem.requested_weight} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('details.final_weight')}</label>
                                <Input
                                    type="number"
                                    value={form.final_weight}
                                    onChange={(e) => setForm({ ...form, final_weight: e.target.value })}
                                    className="font-bold text-lg focus-visible:ring-red-500"
                                />
                            </div>

                            {/* Tag Selection - For Reservations AND Groups */}
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">{t('details.tag_number')} {selectedItem.type === 'GROUP' && t('details.add_to_member')}</label>
                                <div className="relative">
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            placeholder={t('search_tag_placeholder')}
                                            value={tagSearch}
                                            onChange={(e) => setTagSearch(e.target.value)}
                                            className="flex-1"
                                        />
                                        {form.tag_color && (
                                            <div
                                                className="w-10 h-10 rounded border shadow-sm flex items-center justify-center"
                                                style={{ backgroundColor: form.tag_color + '20', borderColor: form.tag_color }}
                                                title="Tag Color"
                                            >
                                                <Tag className="w-6 h-6" style={{ color: form.tag_color }} />
                                            </div>
                                        )}
                                    </div>
                                    {tagSearch && (
                                        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {filteredTags.map(tag => {
                                                const tagNum = tag.tag_number.trim();
                                                const currentTagNum = form.tag_number ? form.tag_number.trim() : '';
                                                const isUsed = usedTags.has(tagNum) && tagNum !== currentTagNum;
                                                return (
                                                    <div
                                                        key={tag.id}
                                                        className={`p-2 flex justify-between items-center ${isUsed ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'hover:bg-gray-100 cursor-pointer'}`}
                                                        onClick={() => {
                                                            if (isUsed) return;
                                                            setForm({
                                                                ...form,
                                                                tag_number: tag.tag_number,
                                                                tag_color: tag.tag_color,
                                                                final_weight: form.final_weight || tag.weight // Auto-fill weight if empty
                                                            });
                                                            setTagSearch('');
                                                        }}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{tag.tag_number} ({tag.weight}kg)</span>
                                                            {isUsed && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {t('tag_used')}</span>}
                                                        </div>
                                                        {tag.tag_color && (
                                                            <Tag className="w-4 h-4" style={{ color: tag.tag_color }} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {filteredTags.length === 0 && (
                                                <div className="p-2 text-muted-foreground text-sm">{t('no_tags_found')}</div>
                                            )}
                                        </div>
                                    )}
                                    {form.tag_number && !tagSearch && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-bold text-lg">{form.tag_number}</span>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setForm({ ...form, tag_number: '', tag_color: '' });
                                                setTagSearch('');
                                            }}>{t('change_btn')}</Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('details.final_price')}</label>
                                <Input
                                    type="number"
                                    value={form.final_price}
                                    onChange={(e) => setForm({ ...form, final_price: e.target.value })}
                                    placeholder={t('total_amount_placeholder')}
                                    className="focus-visible:ring-red-500 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('details.destination')}</label>
                                <Input
                                    value={form.destination}
                                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                                    placeholder={t('destination_placeholder')}
                                    className="focus-visible:ring-red-500"
                                    list="destinations-list"
                                    disabled={selectedItem.type === 'GROUP'} // Disable for groups for now if not supported
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
                                <span>{t('details.deposit_paid')}</span>
                                <span className="font-bold text-green-600">{totalDeposit}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>{t('details.final_total')}</span>
                                <span className="font-bold">{form.final_price || 0}€</span>
                            </div>
                            <div className="border-t border-red-200 pt-2 flex justify-between text-lg font-bold">
                                <span>{t('details.remaining')}</span>
                                <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {remaining.toFixed(2)}€
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className={`p-6 space-y-6 flex flex-col justify-center border-t-4 ${(form.status === 'COLLECTED' || form.status === 'COMPLETED') && form.is_paid ? 'border-t-green-500 bg-green-50/30' : 'border-t-red-500'}`}>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-red-900">{t('status_updates.title')}</h4>

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
                                        <div className="font-bold">{t('status_updates.payment_status')}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {form.is_paid ? t('status_updates.paid_full') : t('status_updates.payment_pending')}
                                        </div>
                                    </div>
                                </div>
                                {form.is_paid && <CheckCircle className="w-6 h-6 text-green-500" />}
                            </div>

                            <div
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${form.status === 'COLLECTED' || form.status === 'COMPLETED'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-muted hover:border-blue-200'
                                    }`}
                                onClick={() => {
                                    const collectedStatus = selectedItem.type === 'GROUP' ? 'COMPLETED' : 'COLLECTED';
                                    const pendingStatus = selectedItem.type === 'GROUP' ? 'PENDING' : 'CONFIRMED';
                                    setForm({ ...form, status: (form.status === 'COLLECTED' || form.status === 'COMPLETED') ? pendingStatus : collectedStatus });
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(form.status === 'COLLECTED' || form.status === 'COMPLETED') ? 'bg-green-500 text-white' : 'bg-muted'
                                        }`}>
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold">{t('status_updates.collection_status')}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {(form.status === 'COLLECTED' || form.status === 'COMPLETED') ? t('status_updates.collected') : t('status_updates.not_collected')}
                                        </div>
                                    </div>
                                </div>
                                {(form.status === 'COLLECTED' || form.status === 'COMPLETED') && <CheckCircle className="w-6 h-6 text-green-500" />}
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className={`w-full ${(form.status === 'COLLECTED' || form.status === 'COMPLETED') ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            onClick={handleUpdate}
                            disabled={updating}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {t('status_updates.save_changes')}
                        </Button>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
