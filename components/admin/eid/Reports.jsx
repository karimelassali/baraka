"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, Scale, Loader2, PieChart, BarChart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { generateEidPdf } from '@/lib/eidPdfUtils';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function Reports() {
    const t = useTranslations('Admin.Eid.Reports');
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_sheep: 0,
        total_goats: 0,
        total_cattle: 0,
        total_weight_sold: 0,
        avg_weight: 0
    });
    const [destinations, setDestinations] = useState([]);
    const [weightAnalysis, setWeightAnalysis] = useState({ purchased: 0, sold: 0 });
    const [priceAnalysis, setPriceAnalysis] = useState({ total_price: 0, final_price: 0 });
    const [loading, setLoading] = useState(true);
    const [explanationModal, setExplanationModal] = useState({ isOpen: false, title: '', content: '' });
    const [destinationModal, setDestinationModal] = useState({
        isOpen: false,
        destination: null
    });

    useEffect(() => {
        fetchStats();
        fetchDestinations();
        fetchAnalysis();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/eid/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            const res = await fetch('/api/admin/eid/reservations?limit=1000');
            if (res.ok) {
                const { data } = await res.json();
                const destMap = {};
                data.forEach(r => {
                    const dest = r.destination || 'Unknown';
                    if (!destMap[dest]) {
                        destMap[dest] = {
                            name: dest,
                            count: 0,
                            weight: 0,
                            total_revenue: 0,
                            orders: []
                        };
                    }
                    destMap[dest].count += 1;

                    // Calculate weight safely
                    const weight = Number(r.final_weight || r.requested_weight || 0);
                    if (!isNaN(weight)) {
                        destMap[dest].weight += weight;
                    }

                    // Calculate revenue safely
                    const revenue = r.is_paid ? Number(r.final_price || 0) : Number(r.total_deposit || 0);
                    if (!isNaN(revenue)) {
                        destMap[dest].total_revenue += revenue;
                    }

                    destMap[dest].orders.push(r);
                });
                setDestinations(Object.values(destMap));
            }
        } catch (e) {
            console.error("Error fetching destinations", e);
        }
    };

    const fetchAnalysis = async () => {
        try {
            // Fetch purchases for weight
            const resPurchases = await fetch('/api/admin/eid/purchases?limit=1000');
            const { data: purchases } = await resPurchases.json();
            const totalPurchasedWeight = purchases.reduce((sum, p) => sum + Number(p.weight || 0), 0);

            // Fetch reservations for sold weight and prices
            const resReservations = await fetch('/api/admin/eid/reservations?limit=1000');
            const { data: reservations } = await resReservations.json();

            const totalSoldWeight = reservations.reduce((sum, r) => sum + Number(r.final_weight || 0), 0);

            const totalOrderValue = reservations.reduce((sum, r) => sum + Number(r.final_price || 0), 0);
            const totalCollected = reservations.reduce((sum, r) => {
                if (r.is_paid) return sum + Number(r.final_price || 0);
                return sum + Number(r.total_deposit || 0);
            }, 0);

            setWeightAnalysis({ purchased: totalPurchasedWeight, sold: totalSoldWeight });
            setPriceAnalysis({ total_price: totalOrderValue, final_price: totalCollected });

        } catch (e) {
            console.error("Error fetching analysis", e);
        }
    };

    const handleDestinationClick = (dest) => {
        setDestinationModal({
            isOpen: true,
            destination: dest
        });
    };

    const handleDownloadReservations = async () => {
        try {
            const res = await fetch('/api/admin/eid/reservations?limit=1000');
            if (res.ok) {
                const { data } = await res.json();

                // Sort Oldest to Newest
                const sortedData = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                const columns = [t('pdf.order_number'), t('pdf.customer'), t('pdf.type'), t('pdf.weight'), t('pdf.status'), t('pdf.paid')];
                const rows = sortedData.map(r => [
                    r.order_number,
                    `${r.customers?.first_name} ${r.customers?.last_name}`,
                    r.animal_type,
                    `${r.requested_weight} kg`,
                    r.status,
                    r.is_paid ? t('pdf.yes') : t('pdf.no')
                ]);

                generateEidPdf({
                    title: t('detailed_reports.reservations_list'),
                    columns,
                    data: rows,
                    filename: `prenotazioni_${new Date().toISOString().split('T')[0]}`,
                    details: {
                        [t('pdf.total_reservations')]: data.length,
                        'Sort': t('pdf.sort_oldest')
                    }
                });
            }
        } catch (e) {
            toast.error(t('toast.error_report'));
        }
    };

    const handleDownloadFinancial = async () => {
        const columns = [t('pdf.metric'), t('pdf.value')];
        const data = [
            [t('analysis.total_order_value'), `${priceAnalysis.total_price.toFixed(2)}€`],
            [t('analysis.realized_revenue'), `${priceAnalysis.final_price.toFixed(2)}€`],
            [t('analysis.outstanding'), `${(priceAnalysis.total_price - priceAnalysis.final_price).toFixed(2)}€`]
        ];

        generateEidPdf({
            title: t('detailed_reports.financial_report'),
            columns,
            data,
            filename: `finanziario_${new Date().toISOString().split('T')[0]}`,
            details: {
                [t('pdf.generated')]: new Date().toLocaleDateString()
            }
        });
    };

    const handleDownloadCattleGroups = async () => {
        try {
            const res = await fetch('/api/admin/eid/cattle?limit=1000');
            if (res.ok) {
                const { data } = await res.json();

                // Sort Oldest to Newest
                const sortedData = data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

                const columns = [t('pdf.group'), t('pdf.weight'), t('pdf.status'), t('pdf.members')];
                const rows = sortedData.map(g => [
                    g.group_name,
                    `${g.cattle_weight} kg`,
                    g.status,
                    g.eid_cattle_members?.length || 0
                ]);

                generateEidPdf({
                    title: t('detailed_reports.cattle_groups'),
                    columns,
                    data: rows,
                    filename: `gruppi_bovini_${new Date().toISOString().split('T')[0]}`,
                    details: {
                        [t('pdf.total_groups')]: data.length,
                        'Sort': t('pdf.sort_oldest')
                    }
                });
            }
        } catch (e) {
            toast.error(t('toast.error_report'));
        }
    };

    const openExplanation = (key) => {
        setExplanationModal({
            isOpen: true,
            title: t(`metrics.${key}`), // Fallback to metric name if specific title not needed
            content: t(`explanations.${key}`)
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <GlassCard
                    className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openExplanation('total_revenue')}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('metrics.total_revenue')}</p>
                            <h3 className="text-3xl font-bold text-red-900 mt-2">{stats.total_revenue}€</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </GlassCard>
                <GlassCard
                    className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openExplanation('total_animals')}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('metrics.total_animals')}</p>
                            <h3 className="text-3xl font-bold text-blue-900 mt-2">{stats.total_sheep + stats.total_goats}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total_sheep} {t('metrics.sheep')}, {stats.total_goats} {t('metrics.goats')}
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </GlassCard>

                <GlassCard
                    className="p-6 border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => openExplanation('total_weight')}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{t('metrics.total_weight')}</p>
                            <h3 className="text-3xl font-bold text-amber-900 mt-2">{stats.total_weight_sold} kg</h3>
                            <p className="text-xs text-muted-foreground mt-1">{t('metrics.avg')}: {stats.avg_weight} kg</p>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-full">
                            <Scale className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weight Analysis */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Scale className="h-5 w-5 text-amber-600" />
                            {t('analysis.weight_title')}
                        </CardTitle>
                        <CardDescription>{t('analysis.weight_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div
                                className="flex justify-between items-center p-3 bg-amber-50 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors"
                                onClick={() => openExplanation('weight_purchased')}
                            >
                                <span className="text-sm font-medium text-amber-900">{t('analysis.total_purchased')}</span>
                                <span className="text-lg font-bold text-amber-700">{weightAnalysis.purchased} kg</span>
                            </div>
                            <div
                                className="flex justify-between items-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => openExplanation('weight_sold')}
                            >
                                <span className="text-sm font-medium text-green-900">{t('analysis.total_sold')}</span>
                                <span className="text-lg font-bold text-green-700">{weightAnalysis.sold} kg</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-900">{t('analysis.difference')}</span>
                                <span className={`text-lg font-bold ${weightAnalysis.purchased - weightAnalysis.sold > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {(weightAnalysis.purchased - weightAnalysis.sold).toFixed(2)} kg
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Price Analysis */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            {t('analysis.financial_title')}
                        </CardTitle>
                        <CardDescription>{t('analysis.financial_desc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div
                                className="flex justify-between items-center p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                                onClick={() => openExplanation('financial_total')}
                            >
                                <span className="text-sm font-medium text-blue-900">{t('analysis.total_order_value')}</span>
                                <span className="text-lg font-bold text-blue-700">{priceAnalysis.total_price.toFixed(2)}€</span>
                            </div>
                            <div
                                className="flex justify-between items-center p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => openExplanation('financial_realized')}
                            >
                                <span className="text-sm font-medium text-green-900">{t('analysis.realized_revenue')}</span>
                                <span className="text-lg font-bold text-green-700">{priceAnalysis.final_price.toFixed(2)}€</span>
                            </div>
                            <div
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => openExplanation('financial_outstanding')}
                            >
                                <span className="text-sm font-medium text-gray-900">{t('analysis.outstanding')}</span>
                                <span className="text-lg font-bold text-red-600">
                                    {(priceAnalysis.total_price - priceAnalysis.final_price).toFixed(2)}€
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Destinations Section */}
            <Card className="shadow-md border-t-4 border-t-purple-500">
                <CardHeader>
                    <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        {t('destinations.title')}
                    </CardTitle>
                    <CardDescription>{t('destinations.desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">{t('destinations.col_dest')}</th>
                                    <th className="px-6 py-3">{t('destinations.col_count')}</th>
                                    <th className="px-6 py-3">{t('destinations.col_weight')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {destinations.map((dest, index) => (
                                    <tr
                                        key={index}
                                        className="bg-white border-b hover:bg-purple-50 cursor-pointer transition-colors"
                                        onClick={() => handleDestinationClick(dest)}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-purple-500" />
                                            {dest.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-purple-100 text-purple-800 py-1 px-2 rounded-full text-xs font-medium">
                                                {dest.count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{dest.weight.toFixed(2)} kg</td>
                                    </tr>
                                ))}
                                {destinations.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-muted-foreground">{t('destinations.no_data')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Destination Details Modal */}
            <Dialog open={destinationModal.isOpen} onOpenChange={(open) => setDestinationModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Truck className="h-6 w-6 text-purple-600" />
                            {destinationModal.destination?.name}
                        </DialogTitle>
                        <DialogDescription>
                            {t('destinations.desc')}
                        </DialogDescription>
                    </DialogHeader>

                    {destinationModal.destination && (
                        <div className="space-y-6 mt-4">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                                    <p className="text-sm text-purple-600 font-medium">{t('metrics.total_revenue')}</p>
                                    <p className="text-2xl font-bold text-purple-900">{destinationModal.destination.total_revenue.toFixed(2)}€</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium">{t('destinations.col_count')}</p>
                                    <p className="text-2xl font-bold text-blue-900">{destinationModal.destination.count}</p>
                                </div>
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-sm text-amber-600 font-medium">{t('destinations.col_weight')}</p>
                                    <p className="text-2xl font-bold text-amber-900">{destinationModal.destination.weight.toFixed(2)} kg</p>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {t('detailed_reports.reservations_list')}
                                </h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2">{t('pdf.order_number')}</th>
                                                <th className="px-4 py-2">{t('pdf.customer')}</th>
                                                <th className="px-4 py-2">{t('pdf.weight')}</th>
                                                <th className="px-4 py-2">{t('pdf.paid')}</th>
                                                <th className="px-4 py-2 text-right">{t('pdf.value')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {destinationModal.destination.orders.map((order, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium">{order.order_number}</td>
                                                    <td className="px-4 py-2">
                                                        {order.customers?.first_name} {order.customers?.last_name}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        {order.final_weight || order.requested_weight} kg
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs ${order.is_paid
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {order.is_paid ? t('pdf.yes') : t('pdf.no')}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium">
                                                        {(order.is_paid ? (order.final_price || 0) : (order.total_deposit || 0)).toFixed(2)}€
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-t-4 border-t-red-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl text-red-900 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {t('detailed_reports.title')}
                        </CardTitle>
                        <CardDescription>{t('detailed_reports.desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-4 hover:bg-red-50 hover:text-red-700 hover:border-red-200 group"
                            onClick={handleDownloadReservations}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-red-100 transition-colors">
                                    <Users className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">{t('detailed_reports.reservations_list')}</div>
                                    <div className="text-xs text-muted-foreground">{t('detailed_reports.reservations_desc')}</div>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-red-600" />
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 group"
                            onClick={handleDownloadFinancial}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <BarChart className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">{t('detailed_reports.financial_report')}</div>
                                    <div className="text-xs text-muted-foreground">{t('detailed_reports.financial_desc')}</div>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-blue-600" />
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-between h-auto py-4 hover:bg-green-50 hover:text-green-700 hover:border-green-200 group"
                            onClick={handleDownloadCattleGroups}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                                    <Users className="h-5 w-5 text-gray-600 group-hover:text-green-600" />
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold">{t('detailed_reports.cattle_groups')}</div>
                                    <div className="text-xs text-muted-foreground">{t('detailed_reports.cattle_desc')}</div>
                                </div>
                            </div>
                            <Download className="h-4 w-4 text-muted-foreground group-hover:text-green-600" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-gray-500 shadow-md bg-gray-50/50">
                    <CardHeader>
                        <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            {t('export.title')}
                        </CardTitle>
                        <CardDescription>{t('export.desc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-gray-200 text-sm text-muted-foreground mb-4">
                            <p>{t('export.info')}</p>
                        </div>
                        <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white h-auto py-3">
                            <Download className="mr-2 h-4 w-4" />
                            {t('export.btn')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {/* Explanation Modal */}
            <Dialog open={explanationModal.isOpen} onOpenChange={(open) => setExplanationModal(prev => ({ ...prev, isOpen: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{explanationModal.title}</DialogTitle>
                        <DialogDescription>
                            {explanationModal.content}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}
