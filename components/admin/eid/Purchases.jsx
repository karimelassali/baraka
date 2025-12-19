"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Scale, ChevronLeft, ChevronRight, Loader2, Edit, Trash2, X, Tag, Search, Download, Folder, ArrowLeft, Calendar, Pin, PinOff, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { generateEidPdf } from '@/lib/eidPdfUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { getAvatarUrl } from '@/lib/avatar';

export default function Purchases() {
    const t = useTranslations('Admin.Eid.Purchases');
    // View State: 'SUPPLIERS' -> 'BATCHES' -> 'ANIMALS'
    const [viewMode, setViewMode] = useState('SUPPLIERS');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState(null);

    // Data State
    const [configuredSuppliers, setConfiguredSuppliers] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [batches, setBatches] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [allTags, setAllTags] = useState([]); // Array of { number, color }
    const [recentColors, setRecentColors] = useState([]);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    // Loading State
    const [loading, setLoading] = useState(false);

    // Pagination & Filters (for Animals view)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilters, setTypeFilters] = useState(['ALL']);

    // Forms
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchForm, setBatchForm] = useState({ id: null, batch_number: '', notes: '' });

    const [form, setForm] = useState({
        tag_number: '',
        tag_color: '#000000',
        weight: '',
        animal_type: 'SHEEP',
        supplier: '',
        destination: ''
    });
    const [editingPurchase, setEditingPurchase] = useState(null);

    // Initial Load
    useEffect(() => {
        fetchConfiguredSuppliers();
        fetchDestinations();
        fetchAllTags();
        const savedColors = localStorage.getItem('eid_recent_colors');
        if (savedColors) {
            setRecentColors(JSON.parse(savedColors));
        }
    }, []);

    // Fetch Suppliers
    const fetchConfiguredSuppliers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/eid/settings?type=suppliers');
            if (res.ok) {
                setConfiguredSuppliers(await res.json());
            }
        } catch (e) {
            console.error("Error fetching suppliers", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const res = await fetch('/api/admin/eid/settings?type=destinations');
            if (res.ok) {
                setDestinations(await res.json());
            }
        } catch (e) {
            console.error("Error fetching destinations", e);
        }
    };

    // Fetch All Tags for Suggestions
    const fetchAllTags = async () => {
        try {
            const res = await fetch('/api/admin/eid/purchases?limit=1000');
            if (res.ok) {
                const { data } = await res.json();
                const uniqueTags = [];
                const seen = new Set();
                data.forEach(p => {
                    if (p.tag_number && !seen.has(p.tag_number)) {
                        seen.add(p.tag_number);
                        uniqueTags.push({ number: p.tag_number, color: p.tag_color || '#000000' });
                    }
                });
                setAllTags(uniqueTags);
            }
        } catch (e) {
            console.error("Error fetching tags", e);
        }
    };

    // Fetch Batches when Supplier Selected
    useEffect(() => {
        if (selectedSupplier) {
            fetchBatches();
        }
    }, [selectedSupplier]);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/eid/batches?supplier_id=${selectedSupplier.id}`);
            if (res.ok) {
                let data = await res.json();
                // Sort by pinned (desc) then created_at (desc)
                data.sort((a, b) => {
                    if (a.is_pinned === b.is_pinned) {
                        return new Date(b.created_at) - new Date(a.created_at);
                    }
                    return a.is_pinned ? -1 : 1;
                });
                setBatches(data);
            }
        } catch (e) {
            console.error("Error fetching batches", e);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Purchases when Batch Selected (or filters change)
    useEffect(() => {
        if (selectedBatch) {
            // Debounce search
            const timer = setTimeout(() => {
                fetchPurchases();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [selectedBatch, page, searchTerm, typeFilters]);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/eid/purchases?page=${page}&limit=${limit}&batch_id=${selectedBatch.id}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (!typeFilters.includes('ALL')) url += `&type=${typeFilters.join(',')}`;

            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setPurchases(result.data || []);
                setTotalPages(result.metadata?.totalPages || 1);
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---

    const handleSupplierClick = (supplier) => {
        setSelectedSupplier(supplier);
        setViewMode('BATCHES');
    };

    const handleBatchClick = (batch) => {
        setSelectedBatch(batch);
        setViewMode('ANIMALS');
        setPage(1); // Reset page
    };

    const handleBack = () => {
        if (viewMode === 'ANIMALS') {
            setViewMode('BATCHES');
            setSelectedBatch(null);
            setPurchases([]);
        } else if (viewMode === 'BATCHES') {
            setViewMode('SUPPLIERS');
            setSelectedSupplier(null);
            setBatches([]);
        }
    };

    const handleSaveBatch = async () => {
        if (!batchForm.batch_number) return;
        try {
            const url = batchForm.id
                ? `/api/admin/eid/batches/${batchForm.id}`
                : '/api/admin/eid/batches';

            const method = batchForm.id ? 'PUT' : 'POST';

            const body = {
                batch_number: batchForm.batch_number,
                notes: batchForm.notes
            };

            if (!batchForm.id) {
                body.supplier_id = selectedSupplier.id;
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(batchForm.id ? t('toast.batch_updated') : t('toast.batch_created'));
                setIsBatchModalOpen(false);
                setBatchForm({ id: null, batch_number: '', notes: '' });
                fetchBatches();
            } else {
                toast.error(t('toast.error_save_batch'));
            }
        } catch (e) {
            toast.error(t('toast.error_save_batch'));
        }
    };

    const handlePinBatch = async (e, batch) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/admin/eid/batches/${batch.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_pinned: !batch.is_pinned })
            });
            if (res.ok) {
                fetchBatches();
                toast.success(batch.is_pinned ? t('toast.batch_unpinned') : t('toast.batch_pinned'));
            }
        } catch (e) {
            toast.error(t('toast.error_update_batch'));
        }
    };

    const handleDeleteBatch = async (e, batchId) => {
        e.stopPropagation();
        if (!confirm(t('confirm_delete_batch'))) return;
        try {
            const res = await fetch(`/api/admin/eid/batches/${batchId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(t('toast.batch_deleted'));
                fetchBatches();
            }
        } catch (e) {
            toast.error(t('toast.error_delete_batch'));
        }
    };

    const openEditBatchModal = (e, batch) => {
        e.stopPropagation();
        setBatchForm({ id: batch.id, batch_number: batch.batch_number, notes: batch.notes || '' });
        setIsBatchModalOpen(true);
    };

    const handleSavePurchase = async () => {
        if (!form.tag_number || !form.weight) {
            toast.error(t('toast.fill_required'));
            return;
        }

        try {
            const url = editingPurchase
                ? `/api/admin/eid/purchases/${editingPurchase.id}`
                : '/api/admin/eid/purchases';

            const method = editingPurchase ? 'PUT' : 'POST';

            const payload = {
                ...form,
                supplier: selectedSupplier.name, // Legacy field
                batch_id: selectedBatch.id
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 409) {
                toast.error(t('toast.tag_exists', { tag: form.tag_number }));
                return;
            }

            if (response.ok) {
                toast.success(editingPurchase ? t('toast.purchase_updated') : t('toast.purchase_added'));
                fetchPurchases();
                // Update tag list if new
                if (!allTags.some(t => t.number === form.tag_number)) {
                    setAllTags(prev => [...prev, { number: form.tag_number, color: form.tag_color }]);
                }

                // Save color to recent
                if (form.tag_color) {
                    const newColors = [form.tag_color, ...recentColors.filter(c => c !== form.tag_color)].slice(0, 5);
                    setRecentColors(newColors);
                    localStorage.setItem('eid_recent_colors', JSON.stringify(newColors));
                }

                resetForm();
            } else {
                toast.error(t('toast.error_save_purchase'));
            }
        } catch (error) {
            toast.error(t('toast.error_save_purchase'));
        }
    };

    const handleDeletePurchase = async (id) => {
        if (!confirm(t('confirm_delete'))) return;
        try {
            const res = await fetch(`/api/admin/eid/purchases/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(t('toast.deleted'));
                fetchPurchases();
                // Refresh tags to make the deleted tag available again
                fetchAllTags();
            }
        } catch (e) {
            toast.error(t('toast.error_delete'));
        }
    };

    const handleEdit = (purchase) => {
        setEditingPurchase(purchase);
        setForm({
            tag_number: purchase.tag_number,
            tag_color: purchase.tag_color || '#000000',
            weight: purchase.weight,
            animal_type: purchase.animal_type,
            supplier: purchase.supplier || '',
            destination: purchase.destination || ''
        });
    };

    const resetForm = () => {
        setEditingPurchase(null);
        setForm({
            tag_number: '',
            tag_color: '#000000',
            weight: '',
            animal_type: 'SHEEP',
            supplier: '',
            destination: ''
        });
    };

    const handleDownloadPdf = () => {
        const columns = [t('pdf.tag'), t('pdf.color'), t('pdf.type'), t('pdf.weight')];
        const data = purchases.map(p => [
            p.tag_number,
            p.tag_color || '-',
            p.animal_type,
            `${p.weight} kg`
        ]);

        generateEidPdf({
            title: `${t('pdf.title')} - ${selectedBatch?.batch_number}`,
            columns,
            data,
            filename: `acquisti_${selectedBatch?.batch_number}_${new Date().toISOString().split('T')[0]}`,
            details: {
                [t('pdf.supplier')]: selectedSupplier?.name,
                [t('pdf.group')]: selectedBatch?.batch_number,
                [t('pdf.total_animals')]: purchases.length
            },
            colorColumnIndex: 1
        });
    };

    // --- Render Views ---

    if (viewMode === 'SUPPLIERS') {
        return (
            <div className="space-y-6">
                <h2 className="text-xl font-semibold text-red-700">{t('title')}</h2>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {configuredSuppliers.map(s => (
                            <GlassCard
                                key={s.id}
                                className="p-6 cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-red-500 flex flex-col items-center justify-center gap-4 group"
                                onClick={() => handleSupplierClick(s)}
                            >
                                <div className="relative">
                                    <img
                                        src={getAvatarUrl(s.name, 'initials')}
                                        alt={s.name}
                                        className="w-16 h-16 rounded-full border-2 border-red-100 shadow-sm group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{s.name}</h3>
                                    <p className="text-sm text-muted-foreground">{s.contact_info || t('no_contact')}</p>
                                </div>
                            </GlassCard>
                        ))}
                        {configuredSuppliers.length === 0 && (
                            <div className="col-span-full text-center text-muted-foreground p-8">
                                {t('no_suppliers')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (viewMode === 'BATCHES') {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Button variant="ghost" onClick={handleBack} className="shrink-0"><ArrowLeft className="mr-2 h-4 w-4" /> {t('batches.back')}</Button>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img
                                src={getAvatarUrl(selectedSupplier?.name, 'initials')}
                                alt={selectedSupplier?.name}
                                className="w-10 h-10 rounded-full border border-red-100 shrink-0"
                            />
                            <h2 className="text-xl font-semibold text-red-700 truncate">{t('batches.title', { name: selectedSupplier?.name })}</h2>
                        </div>
                    </div>
                    <Button onClick={() => { setBatchForm({ id: null, batch_number: '', notes: '' }); setIsBatchModalOpen(true); }} className="w-full sm:w-auto sm:ml-auto bg-red-600 hover:bg-red-700">
                        <Plus className="mr-2 h-4 w-4" /> {t('batches.new_batch')}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-500" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {batches.map(b => (
                            <GlassCard
                                key={b.id}
                                className={`p-6 cursor-pointer hover:shadow-lg transition-all border-t-4 group relative ${b.is_pinned ? 'border-t-yellow-500 bg-yellow-50/30' : 'border-t-red-500'}`}
                                onClick={() => handleBatchClick(b)}
                            >
                                <div className="absolute top-4 right-4 flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-yellow-100 text-yellow-600"
                                        onClick={(e) => handlePinBatch(e, b)}
                                        title={b.is_pinned ? t('batches.unpin') : t('batches.pin')}
                                    >
                                        {b.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-blue-100 text-blue-600"
                                        onClick={(e) => openEditBatchModal(e, b)}
                                        title={t('batches.edit')}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-red-100 text-red-600"
                                        onClick={(e) => handleDeleteBatch(e, b.id)}
                                        title={t('batches.delete')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="flex justify-between items-start mb-2 pr-24">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {b.is_pinned && <Pin className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                                        {b.batch_number}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{b.notes || t('batches.no_notes')}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(b.created_at).toLocaleDateString()}
                                </div>
                            </GlassCard>
                        ))}
                        {batches.length === 0 && (
                            <div className="col-span-full text-center text-muted-foreground p-8">
                                {t('batches.no_batches')}
                            </div>
                        )}
                    </div>
                )}

                <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{batchForm.id ? t('batch_modal.edit_title') : t('batch_modal.create_title')}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('batch_modal.number_name')}</label>
                                <Input
                                    value={batchForm.batch_number}
                                    onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                                    placeholder={t('batch_modal.name_placeholder')}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('batch_modal.notes')}</label>
                                <Input
                                    value={batchForm.notes}
                                    onChange={(e) => setBatchForm({ ...batchForm, notes: e.target.value })}
                                    placeholder={t('batch_modal.notes_placeholder')}
                                />
                            </div>
                            <Button onClick={handleSaveBatch} className="w-full bg-red-600 hover:bg-red-700">
                                {batchForm.id ? t('batch_modal.update_btn') : t('batch_modal.create_btn')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // ANIMALS VIEW (Existing Logic)
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleBack}><ArrowLeft className="mr-2 h-4 w-4" /> {t('animals.back')}</Button>
                <div>
                    <h2 className="text-xl font-semibold text-red-700">{selectedSupplier?.name} / {selectedBatch?.batch_number}</h2>
                    <p className="text-sm text-muted-foreground">{t('animals.subtitle')}</p>
                </div>
            </div>

            <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between gap-4">
                <div className="grid grid-cols-1 gap-4 w-full md:w-auto">
                    <GlassCard className="p-4 flex items-center justify-between border-l-4 border-l-red-500 w-full md:w-64">
                        <div>
                            <p className="text-sm text-muted-foreground">{t('animals.total_animals')}</p>
                            <p className="text-2xl font-bold text-red-900">{purchases.length} ({t('animals.page')})</p>
                        </div>
                        <Scale className="h-8 w-8 text-red-500 opacity-50" />
                    </GlassCard>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('animals.search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="flex gap-1 bg-muted/20 p-1 rounded-lg overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
                            {['ALL', 'SHEEP', 'GOAT', 'CATTLE'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        if (type === 'ALL') {
                                            setTypeFilters(['ALL']);
                                        } else {
                                            setTypeFilters(prev => {
                                                if (prev.includes('ALL')) return [type];
                                                if (prev.includes(type)) {
                                                    const newFilters = prev.filter(t => t !== type);
                                                    return newFilters.length === 0 ? ['ALL'] : newFilters;
                                                }
                                                return [...prev, type];
                                            });
                                        }
                                    }}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${typeFilters.includes(type)
                                        ? 'bg-white text-red-700 shadow-sm ring-1 ring-black/5 font-bold'
                                        : 'text-muted-foreground hover:bg-white/50'
                                        }`}
                                >
                                    {t(`animals.types.${type.toLowerCase()}`)}
                                </button>
                            ))}
                        </div>
                        <Button variant="outline" onClick={handleDownloadPdf} className="border-red-200 text-red-700 hover:bg-red-50 px-3">
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3">
                    <GlassCard className="p-6 space-y-5 border-t-4 border-t-red-500 sticky top-4 shadow-lg">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-red-900">{editingPurchase ? t('animals.form.edit_title') : t('animals.form.add_title')}</h3>
                            {editingPurchase && (
                                <Button variant="ghost" size="sm" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('animals.form.type')}</label>
                            <Select
                                value={form.animal_type}
                                onValueChange={(v) => setForm({ ...form, animal_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SHEEP">{t('animals.types.sheep')}</SelectItem>
                                    <SelectItem value="GOAT">{t('animals.types.goat')}</SelectItem>
                                    <SelectItem value="CATTLE">{t('animals.types.cattle')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium">{t('animals.form.tag_number')}</label>
                            <Input
                                value={form.tag_number}
                                onChange={(e) => {
                                    setForm({ ...form, tag_number: e.target.value });
                                    setShowTagSuggestions(true);
                                }}
                                onFocus={() => setShowTagSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                                placeholder={t('animals.form.tag_placeholder')}
                                className="focus-visible:ring-red-500"
                                autoComplete="off"
                            />
                            {showTagSuggestions && form.tag_number && (
                                <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                                    {allTags
                                        .filter(t => t.number.toLowerCase().includes(form.tag_number.toLowerCase()))
                                        .map(tag => {
                                            const isEditingCurrent = editingPurchase && editingPurchase.tag_number === tag.number;
                                            const isTaken = true; // allTags contains only used tags
                                            const isDisabled = isTaken && !isEditingCurrent;

                                            return (
                                                <div
                                                    key={tag.number}
                                                    className={`px-3 py-2 flex items-center justify-between gap-2 border-b last:border-0 ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'hover:bg-gray-100 cursor-pointer'}`}
                                                    onClick={() => {
                                                        if (!isDisabled) {
                                                            setForm({ ...form, tag_number: tag.number, tag_color: tag.color });
                                                            setShowTagSuggestions(false);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4" style={{ fill: tag.color, color: tag.color }} />
                                                        <span className={`font-medium ${isDisabled ? 'text-muted-foreground' : ''}`}>{tag.number}</span>
                                                    </div>
                                                    {isDisabled && (
                                                        <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                                                            {t('animals.form.tag_used')}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    {allTags.filter(t => t.number.toLowerCase().includes(form.tag_number.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-sm text-green-600 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            {t('animals.form.tag_available')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('animals.form.tag_color')}</label>
                            <div className="flex gap-2 items-center">
                                <div className="relative">
                                    <Input
                                        type="color"
                                        value={form.tag_color}
                                        onChange={(e) => setForm({ ...form, tag_color: e.target.value })}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                </div>
                                <Input
                                    value={form.tag_color}
                                    onChange={(e) => setForm({ ...form, tag_color: e.target.value })}
                                    placeholder={t('animals.form.color_placeholder')}
                                    className="flex-1 focus-visible:ring-red-500"
                                />
                            </div>
                            {recentColors.length > 0 && (
                                <div className="flex gap-2 mt-2 flex-wrap">
                                    {recentColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setForm({ ...form, tag_color: color })}
                                            className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {form.tag_color === color && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('animals.form.destination')}</label>
                            <Select
                                value={form.destination}
                                onValueChange={(v) => setForm({ ...form, destination: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('animals.form.dest_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {destinations.map(d => (
                                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                    ))}
                                    {destinations.length === 0 && <SelectItem value="none" disabled>{t('no_destinations')}</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('animals.form.weight')}</label>
                            <Input
                                type="number"
                                value={form.weight}
                                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                placeholder={t('animals.form.weight_placeholder')}
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                        <Button onClick={handleSavePurchase} className="w-full bg-red-600 hover:bg-red-700">
                            {editingPurchase ? t('animals.form.update_btn') : t('animals.form.add_btn')}
                        </Button>
                    </GlassCard>
                </div>

                <div className="lg:col-span-8 xl:col-span-9">
                    <GlassCard className="overflow-hidden border-t-4 border-t-red-500">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-red-50/50">
                                        <TableHead className="text-red-900 font-bold">#</TableHead>
                                        <TableHead className="text-red-900 font-bold">{t('animals.table.tag')}</TableHead>
                                        <TableHead className="text-red-900 font-bold">{t('animals.table.type')}</TableHead>
                                        <TableHead className="text-red-900 font-bold">{t('animals.table.weight')}</TableHead>
                                        <TableHead className="text-red-900 font-bold">{t('animals.table.destination')}</TableHead>
                                        <TableHead className="text-red-900 font-bold">{t('animals.table.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-red-500 mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : purchases.map((p, i) => (
                                        <TableRow key={p.id} className="hover:bg-red-50/30">
                                            <TableCell>{(page - 1) * limit + i + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-foreground">{p.tag_number}</span>
                                                    {p.tag_color && (
                                                        <Tag
                                                            className="w-5 h-5"
                                                            style={{ fill: p.tag_color, color: p.tag_color }}
                                                            title={p.tag_color}
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{p.animal_type}</TableCell>
                                            <TableCell className="font-bold">{p.weight} kg</TableCell>
                                            <TableCell className="text-muted-foreground">{p.destination || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(p)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDeletePurchase(p.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3 p-4">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                                </div>
                            ) : purchases.map((p, i) => (
                                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
                                                {(page - 1) * limit + i + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-lg">{p.tag_number}</span>
                                                    {p.tag_color && (
                                                        <Tag
                                                            className="w-4 h-4"
                                                            style={{ fill: p.tag_color, color: p.tag_color }}
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{p.animal_type}</div>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-sm font-bold border-red-200 bg-red-50 text-red-900">
                                            {p.weight} kg
                                        </Badge>
                                    </div>

                                    {p.destination && (
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 bg-gray-50 p-2 rounded">
                                            <Truck className="w-3 h-3" />
                                            {t('animals.table.destination')}: {p.destination}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
                                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50 flex-1 sm:flex-none justify-center" onClick={() => handleEdit(p)}>
                                            <Edit className="w-4 h-4 mr-1" /> {t('animals.form.edit_title')}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:bg-red-50 flex-1 sm:flex-none justify-center" onClick={() => handleDeletePurchase(p.id)}>
                                            <Trash2 className="w-4 h-4 mr-1" /> {t('delete')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="p-4 border-t flex items-center justify-between bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                {t('animals.page')} {page} {t('of')} {totalPages}
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
                </div>
            </div >
        </div >
    );
}
