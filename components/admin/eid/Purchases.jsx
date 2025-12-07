"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Scale, ChevronLeft, ChevronRight, Loader2, Edit, Trash2, X, Tag, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GlassCard from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { generateEidPdf } from '@/lib/eidPdfUtils';

export default function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        tag_number: '',
        tag_color: '#000000',
        weight: '',
        animal_type: 'SHEEP'
    });
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [stats, setStats] = useState({
        total_animals: 0,
        total_weight: 0,
        avg_weight: 0
    });

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchPurchases();
        }, 500);
        return () => clearTimeout(timer);
    }, [page, searchTerm, typeFilter]);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/eid/purchases?page=${page}&limit=${limit}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (typeFilter !== 'ALL') url += `&type=${typeFilter}`;

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

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/eid/stats');
            if (response.ok) {
                // const data = await response.json();
                // setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSavePurchase = async () => {
        if (!form.tag_number || !form.weight) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const url = editingPurchase
                ? `/api/admin/eid/purchases/${editingPurchase.id}`
                : '/api/admin/eid/purchases';

            const method = editingPurchase ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                toast.success(editingPurchase ? 'Purchase updated' : 'Purchase added');
                fetchPurchases();
                resetForm();
            } else {
                toast.error('Failed to save purchase');
            }
        } catch (error) {
            toast.error('Error saving purchase');
        }
    };

    const handleDeletePurchase = async (id) => {
        if (!confirm('Are you sure you want to delete this purchase?')) return;
        try {
            const response = await fetch(`/api/admin/eid/purchases/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('Purchase deleted');
                fetchPurchases();
            } else {
                toast.error('Failed to delete purchase');
            }
        } catch (error) {
            toast.error('Error deleting purchase');
        }
    };

    const handleEdit = (purchase) => {
        setEditingPurchase(purchase);
        setForm({
            tag_number: purchase.tag_number,
            tag_color: purchase.tag_color || '#000000',
            weight: purchase.weight,
            animal_type: purchase.animal_type
        });
    };

    const resetForm = () => {
        setEditingPurchase(null);
        setForm({
            tag_number: '',
            tag_color: '#000000',
            weight: '',
            animal_type: 'SHEEP'
        });
    };

    const handleDownloadPdf = () => {
        const columns = ['Tag', 'Colore', 'Tipo', 'Peso'];
        const data = purchases.map(p => [
            p.tag_number,
            p.tag_color || '-',
            p.animal_type,
            `${p.weight} kg`
        ]);

        generateEidPdf({
            title: 'Rapporto Acquisti',
            columns,
            data,
            filename: `acquisti_${new Date().toISOString().split('T')[0]}`,
            details: {
                'Totale Animali': purchases.length,
                'Filtro Tipo': typeFilter === 'ALL' ? 'Tutti' : typeFilter
            },
            colorColumnIndex: 1 // The 'Color' column is at index 1
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="grid grid-cols-1 gap-4 w-full md:w-auto">
                    <GlassCard className="p-4 flex items-center justify-between border-l-4 border-l-red-500 w-full md:w-64">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Animals</p>
                            <p className="text-2xl font-bold text-red-900">{purchases.length} (Page)</p>
                        </div>
                        <Scale className="h-8 w-8 text-red-500 opacity-50" />
                    </GlassCard>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search tag number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="SHEEP">Sheep</SelectItem>
                            <SelectItem value="GOAT">Goat</SelectItem>
                            <SelectItem value="CATTLE">Cattle</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleDownloadPdf} className="border-red-200 text-red-700 hover:bg-red-50">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <GlassCard className="p-4 space-y-4 border-t-4 border-t-red-500 sticky top-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-red-900">{editingPurchase ? 'Edit Animal' : 'Add New Animal'}</h3>
                            {editingPurchase && (
                                <Button variant="ghost" size="sm" onClick={resetForm}>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select
                                value={form.animal_type}
                                onValueChange={(v) => setForm({ ...form, animal_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SHEEP">Sheep</SelectItem>
                                    <SelectItem value="GOAT">Goat</SelectItem>
                                    <SelectItem value="CATTLE">Cattle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tag Number</label>
                            <Input
                                value={form.tag_number}
                                onChange={(e) => setForm({ ...form, tag_number: e.target.value })}
                                placeholder="e.g. 12345"
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tag Color</label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={form.tag_color}
                                    onChange={(e) => setForm({ ...form, tag_color: e.target.value })}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    value={form.tag_color}
                                    onChange={(e) => setForm({ ...form, tag_color: e.target.value })}
                                    placeholder="e.g. #FFFF00"
                                    className="flex-1 focus-visible:ring-red-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Weight (kg)</label>
                            <Input
                                type="number"
                                value={form.weight}
                                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                placeholder="0.0"
                                className="focus-visible:ring-red-500"
                            />
                        </div>
                        <Button onClick={handleSavePurchase} className="w-full bg-red-600 hover:bg-red-700">
                            {editingPurchase ? 'Update Animal' : 'Add Animal'}
                        </Button>
                    </GlassCard>
                </div>

                <div className="lg:col-span-2">
                    <GlassCard className="overflow-hidden border-t-4 border-t-red-500">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-red-50/50">
                                    <TableHead className="text-red-900 font-bold">#</TableHead>
                                    <TableHead className="text-red-900 font-bold">Tag</TableHead>
                                    <TableHead className="text-red-900 font-bold">Type</TableHead>
                                    <TableHead className="text-red-900 font-bold">Weight</TableHead>
                                    <TableHead className="text-red-900 font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
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

                        {/* Pagination Controls */}
                        <div className="p-4 border-t flex items-center justify-between bg-muted/20">
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
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
            </div>
        </div>
    );
}
