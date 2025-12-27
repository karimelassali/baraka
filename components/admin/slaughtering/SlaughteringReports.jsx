'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Filter, TrendingUp, DollarSign, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { deleteSlaughteringRecord } from '@/lib/actions/slaughtering';
import SlaughteringForm from '@/components/admin/slaughtering/SlaughteringForm';
import { toast } from 'sonner';
import { Loader2, Calendar, Search, ArrowUpDown, Trash2, Edit2, X } from 'lucide-react';

export default function SlaughteringReports() {
    const t = useTranslations('Admin.Slaughtering');
    const tCommon = useTranslations('Common');
    const [records, setRecords] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [sortAsc, setSortAsc] = useState(false);

    // Edit Modal State
    const [editingRecord, setEditingRecord] = useState(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 10;

    // Filters
    const [filters, setFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        supplier_id: '',
        animal_type: '',
        search: ''
    });

    // Re-fetch when filters or sort change
    useEffect(() => {
        setPage(0);
        setHasMore(true);
        // We use a small delay to debounce search input typing
        const timer = setTimeout(() => {
            fetchData(0, true);
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, sortAsc]);

    // This runs ONCE on mount to fetch suppliers
    useEffect(() => {
        fetchSuppliersList();
    }, []);

    const fetchData = async (pageIdx = 0, reset = false) => {
        if (pageIdx === 0 && reset) setLoading(true);
        else setLoadingMore(true);

        try {
            const offset = pageIdx * PAGE_SIZE;
            const data = await getSlaughteringRecords({
                ...filters,
                limit: PAGE_SIZE,
                offset: offset,
                ascending: sortAsc
            });

            if (reset) {
                setRecords(data || []);
            } else {
                setRecords(prev => [...prev, ...(data || [])]);
            }

            if (!data || data.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error loading records:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage, false);
    };

    const fetchSuppliersList = async () => {
        try {
            const data = await getSuppliers();
            setSuppliers(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(tCommon('delete_confirm') || "Are you sure you want to delete this record?")) return;

        try {
            await deleteSlaughteringRecord(id);
            toast.success(tCommon('delete_success') || "Record deleted successfully");

            // Remove from local state
            setRecords(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(tCommon('delete_error') || "Failed to delete record");
        }
    };

    const handleEditSuccess = () => {
        setEditingRecord(null);
        fetchData(0, true); // Refresh data
    };

    // Derived stats from visible records (approximate)
    const stats = records.reduce((acc, curr) => {
        acc.totalQty += curr.quantity || 0;
        acc.totalSlaughterCost += curr.slaughtering_cost || 0;
        acc.totalPurchaseCost += curr.total_purchase_cost || 0;
        acc.totalFinalCost += curr.final_total_cost || 0;
        acc.totalWeight += curr.slaughtered_weight || 0;
        return acc;
    }, { totalQty: 0, totalSlaughterCost: 0, totalPurchaseCost: 0, totalFinalCost: 0, totalWeight: 0 });

    const avgCostPerKg = stats.totalWeight > 0 ? (stats.totalFinalCost / stats.totalWeight) : 0;

    const exportPDF = async () => {
        const doc = new jsPDF();

        // Hardcoded Italian strings for PDF as requested
        const pdfText = {
            title: "Report Macellazione e Acquisti",
            generated: "Generato il",
            total_qty: "Quantità Totale",
            total_purchase: "Costo Acquisto Totale",
            total_slaughter: "Costo Macellazione Totale",
            total_final: "Costo Totale Finale",
            avg_cost: "Costo Medio Finale per Kg",
            metric: "Metrica",
            value: "Valore",
            detailed: "Dettaglio Record",
            date: "Data",
            supplier: "Fornitore",
            type: "Tipo",
            weight: "Peso (Macellato)",
            final_cost: "Totale Finale",
            bovine: "Bovino (Manzo)",
            ovine: "Ovino (Pecora/Capra)",
            internal_doc: "Documento ad uso interno - Baraka Market"
        };

        // Add Logo
        try {
            const logoUrl = '/logo.jpeg';
            const img = new Image();
            img.src = logoUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if logo fails
            });
            doc.addImage(img, 'JPEG', 14, 10, 15, 15);
        } catch (e) {
            console.error("Could not load logo", e);
        }

        // Header Style
        doc.setFontSize(20);
        doc.setTextColor(220, 38, 38); // Red color
        doc.text('BARAKA', 35, 20);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(pdfText.title, 14, 35);
        doc.text(`${pdfText.generated} ${new Date().toLocaleDateString('it-IT')}`, 14, 41);

        // Summary Table
        const summaryData = [
            [pdfText.total_qty, stats.totalQty],
            [pdfText.total_purchase, `€ ${stats.totalPurchaseCost.toFixed(2)}`],
            [pdfText.total_slaughter, `€ ${stats.totalSlaughterCost.toFixed(2)}`],
            [pdfText.total_final, `€ ${stats.totalFinalCost.toFixed(2)}`],
            [pdfText.avg_cost, `€ ${avgCostPerKg.toFixed(2)}/kg`]
        ];

        autoTable(doc, {
            startY: 50,
            head: [[pdfText.metric, pdfText.value]],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38] }, // Red header
            styles: { fontSize: 10 }
        });

        // Detailed Records
        let finalY = doc.lastAutoTable.finalY + 15;

        const tableColumn = [
            pdfText.date,
            pdfText.supplier,
            pdfText.type,
            pdfText.weight,
            pdfText.final_cost
        ];

        const tableRows = records.map(r => [
            new Date(r.record_date).toLocaleDateString('it-IT'),
            r.supplier?.name || '-',
            r.animal_type === 'bovine' ? pdfText.bovine : pdfText.ovine,
            `${r.slaughtered_weight} kg`,
            `€ ${r.final_total_cost?.toFixed(2)}`
        ]);

        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.text(pdfText.detailed, 14, finalY);

        autoTable(doc, {
            startY: finalY + 5,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [220, 38, 38] },
            styles: { fontSize: 9 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(pdfText.internal_doc, 14, doc.internal.pageSize.height - 10);
        }

        doc.save(`report_macellazione_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <GlassCard className="p-5 flex flex-wrap gap-4 items-end border-l-4 border-l-red-500">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-xs font-bold text-red-800/70 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {t('search')}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('search_placeholder') || "Search..."}
                            value={filters.search || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full p-2.5 pl-9 rounded-xl border border-red-100 bg-white hover:border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                </div>

                <div className="flex-none min-w-[140px]">
                    <label className="text-xs font-bold text-red-800/70 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {t('filter_month')}
                    </label>
                    <div className="relative">
                        <select
                            className="w-full p-2.5 rounded-xl border border-red-100 bg-white hover:border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all appearance-none"
                            value={filters.month}
                            onChange={(e) => setFilters(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-red-400">
                            <TrendingUp className="w-4 h-4 rotate-45" />
                        </div>
                    </div>
                </div>

                <div className="flex-none min-w-[100px]">
                    <label className="text-xs font-bold text-red-800/70 uppercase tracking-wider mb-1.5 block">
                        {t('filter_year')}
                    </label>
                    <div className="relative">
                        <select
                            value={filters.year}
                            onChange={(e) => setFilters(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            className="w-full p-2.5 rounded-xl border border-red-100 bg-white hover:border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all appearance-none"
                        >
                            {Array.from({ length: 7 }, (_, i) => 2024 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-red-400">
                            <TrendingUp className="w-4 h-4 rotate-45" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-[180px]">
                    <label className="text-xs font-bold text-red-800/70 uppercase tracking-wider mb-1.5 block">
                        {t('filter_supplier')}
                    </label>
                    <select
                        className="w-full p-2.5 rounded-xl border border-red-100 bg-white hover:border-red-300 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all"
                        value={filters.supplier_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, supplier_id: e.target.value }))}
                    >
                        <option value="">{t('all_suppliers')}</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-none pb-0.5 flex gap-2">
                    <Button
                        onClick={() => setSortAsc(!sortAsc)}
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 rounded-xl h-[42px] px-3"
                        title={sortAsc ? "Sort Oldest First" : "Sort Newest First"}
                    >
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        {sortAsc ? "Oldest" : "Newest"}
                    </Button>
                    <Button
                        onClick={exportPDF}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-95 rounded-xl px-6 h-[42px]"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {t('export_pdf')}
                    </Button>
                </div>
            </GlassCard>

            {/* Default Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title={t('total_quantity')}
                    value={loading ? '-' : stats.totalQty}
                    icon={<Scale className="text-red-500" />}
                    loading={loading}
                />
                <StatCard
                    title={t('total_purchase_cost')}
                    value={loading ? '-' : `€ ${stats.totalPurchaseCost.toFixed(2)}`}
                    icon={<DollarSign className="text-red-500" />}
                    loading={loading}
                />
                <StatCard
                    title={t('total_slaughter_cost')}
                    value={loading ? '-' : `€ ${stats.totalSlaughterCost.toFixed(2)}`}
                    icon={<DollarSign className="text-red-500" />}
                    loading={loading}
                />
                <StatCard
                    title={t('avg_cost_kg')}
                    value={loading ? '-' : `€ ${avgCostPerKg.toFixed(2)}`}
                    icon={<TrendingUp className="text-red-500" />}
                    loading={loading}
                />
            </div>

            {/* Data Table */}
            <GlassCard className="p-0 overflow-hidden border border-red-100 shadow-md">
                <Table>
                    <TableHeader className="bg-red-50/50">
                        <TableRow className="border-b-red-100">
                            <TableHead className="font-semibold text-red-900">{t('date')}</TableHead>
                            <TableHead className="font-semibold text-red-900">{t('supplier')}</TableHead>
                            <TableHead className="font-semibold text-red-900">{t('animal_type')}</TableHead>
                            <TableHead className="font-semibold text-red-900">{t('qty')}</TableHead>
                            <TableHead className="font-semibold text-red-900">{t('slaughtered_weight')}</TableHead>
                            <TableHead className="text-right font-semibold text-red-900">{t('final_total')}</TableHead>
                            <TableHead className="text-right font-semibold text-red-900 w-[100px]">{tCommon('actions') || 'Actions'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="h-4 w-24 bg-gray-200 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-20 bg-gray-200 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></TableCell>
                                    <TableCell className="text-right"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse ml-auto" /></TableCell>
                                    <TableCell className="text-right"><div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground bg-gray-50/30">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Filter className="w-8 h-8 text-gray-300" />
                                        <p>{t('no_records')}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={record.id} className="hover:bg-red-50/10 transition-colors group">
                                    <TableCell className="font-medium text-gray-700">{new Date(record.record_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium text-gray-900">{record.supplier?.name}</TableCell>
                                    <TableCell className="capitalize">
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${record.animal_type === 'bovine' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {t(record.animal_type)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{record.quantity}</TableCell>
                                    <TableCell className="text-gray-600 font-mono">{record.slaughtered_weight} kg</TableCell>
                                    <TableCell className="text-right font-bold text-red-600 font-mono">
                                        € {record.final_total_cost?.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                onClick={() => setEditingRecord(record)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleDelete(record.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Load More Button */}
                {!loading && hasMore && (
                    <div className="p-4 flex justify-center border-t border-gray-100 bg-gray-50/30">
                        <Button
                            variant="outline"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="w-full max-w-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                        >
                            {loadingMore ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Load More Records"
                            )}
                        </Button>
                    </div>
                )}
            </GlassCard>

            {/* Edit Modal */}
            {editingRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <SlaughteringForm
                            initialData={editingRecord}
                            onSuccess={handleEditSuccess}
                            onCancel={() => setEditingRecord(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, loading }) {
    if (loading) {
        return (
            <GlassCard className="p-4 flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            </GlassCard>
        )
    }
    return (
        <GlassCard className="p-5 flex items-center justify-between border-b-4 border-b-red-500 hover:shadow-lg transition-all duration-300">
            <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-2xl">
                {icon}
            </div>
        </GlassCard>
    );
}
