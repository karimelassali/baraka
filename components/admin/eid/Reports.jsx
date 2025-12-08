"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, Scale, Loader2, PieChart, BarChart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateEidPdf } from '@/lib/eidPdfUtils';
import { toast } from 'sonner';

export default function Reports() {
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
                        destMap[dest] = { name: dest, count: 0, weight: 0 };
                    }
                    destMap[dest].count += 1;
                    destMap[dest].weight += Number(r.final_weight || r.requested_weight || 0);
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

            // Price analysis: Total Price (sum of deposits + remaining?) vs Final Price (actual paid)
            // "Total Price" usually means the agreed price. "Final Price" is what was actually paid.
            // If final_price is set, use it. If not, maybe use a calculated total?
            // Let's assume:
            // Total Price = Sum of (final_price if set, else (deposit + remaining? no remaining is calc))
            // Actually, user asked "Total Price vs Final Price".
            // Let's interpret: 
            // Total Price = Sum of all `final_price` fields (expected revenue)
            // Final Price = Sum of `final_price` for PAID reservations (realized revenue) OR
            // Maybe Total Price = Sum of `final_price` for ALL reservations.
            // And compare with... maybe "Total Deposit"?
            // User said: "Total Price vs Final Price".
            // Let's track:
            // 1. Sum of `final_price` (Total Value of Orders)
            // 2. Sum of `total_deposit` (Collected Deposits)
            // 3. Sum of `final_price` where `is_paid` is true (Collected Revenue)

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

    // ... (rest of PDF handlers)

    const handleDownloadReservations = async () => {
        try {
            const res = await fetch('/api/admin/eid/reservations?limit=1000');
            if (res.ok) {
                const { data } = await res.json();
                const columns = ['Order #', 'Customer', 'Type', 'Weight', 'Status', 'Paid'];
                const rows = data.map(r => [
                    r.order_number,
                    `${r.customers?.first_name} ${r.customers?.last_name}`,
                    r.animal_type,
                    `${r.requested_weight} kg`,
                    r.status,
                    r.is_paid ? 'Yes' : 'No'
                ]);

                generateEidPdf({
                    title: 'Lista Prenotazioni',
                    columns,
                    data: rows,
                    filename: `prenotazioni_${new Date().toISOString().split('T')[0]}`,
                    details: {
                        'Total Reservations': data.length
                    }
                });
            }
        } catch (e) {
            toast.error('Error generating report');
        }
    };

    const handleDownloadFinancial = async () => {
        const columns = ['Metric', 'Value'];
        const data = [
            ['Total Order Value', `${priceAnalysis.total_price.toFixed(2)}€`],
            ['Realized Revenue', `${priceAnalysis.final_price.toFixed(2)}€`],
            ['Outstanding', `${(priceAnalysis.total_price - priceAnalysis.final_price).toFixed(2)}€`]
        ];

        generateEidPdf({
            title: 'Rapporto Finanziario',
            columns,
            data,
            filename: `finanziario_${new Date().toISOString().split('T')[0]}`,
            details: {
                'Generated': new Date().toLocaleDateString()
            }
        });
    };

    const handleDownloadCattleGroups = async () => {
        try {
            const res = await fetch('/api/admin/eid/cattle?limit=1000');
            if (res.ok) {
                const { data } = await res.json();
                const columns = ['Group', 'Weight', 'Status', 'Members'];
                const rows = data.map(g => [
                    g.group_name,
                    `${g.cattle_weight} kg`,
                    g.status,
                    g.eid_cattle_members?.length || 0
                ]);

                generateEidPdf({
                    title: 'Rapporto Gruppi Bovini',
                    columns,
                    data: rows,
                    filename: `gruppi_bovini_${new Date().toISOString().split('T')[0]}`,
                    details: {
                        'Total Groups': data.length
                    }
                });
            }
        } catch (e) {
            toast.error('Error generating report');
        }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-red-900 mt-2">{stats.total_revenue}€</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-full">
                            <TrendingUp className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Animals</p>
                            <h3 className="text-3xl font-bold text-blue-900 mt-2">{stats.total_sheep + stats.total_goats}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total_sheep} Sheep, {stats.total_goats} Goats
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Cattle Groups</p>
                            <h3 className="text-3xl font-bold text-green-900 mt-2">{stats.total_cattle}</h3>
                            <p className="text-xs text-muted-foreground mt-1">Active Groups</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </GlassCard>
                <GlassCard className="p-6 border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Weight</p>
                            <h3 className="text-3xl font-bold text-amber-900 mt-2">{stats.total_weight_sold} kg</h3>
                            <p className="text-xs text-muted-foreground mt-1">Avg: {stats.avg_weight} kg</p>
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
                            Weight Analysis
                        </CardTitle>
                        <CardDescription>Purchased vs Sold Weight</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                                <span className="text-sm font-medium text-amber-900">Total Purchased</span>
                                <span className="text-lg font-bold text-amber-700">{weightAnalysis.purchased} kg</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium text-green-900">Total Sold (Final)</span>
                                <span className="text-lg font-bold text-green-700">{weightAnalysis.sold} kg</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-900">Difference</span>
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
                            Financial Analysis
                        </CardTitle>
                        <CardDescription>Total Order Value vs Realized Revenue</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                <span className="text-sm font-medium text-blue-900">Total Order Value</span>
                                <span className="text-lg font-bold text-blue-700">{priceAnalysis.total_price.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <span className="text-sm font-medium text-green-900">Realized Revenue</span>
                                <span className="text-lg font-bold text-green-700">{priceAnalysis.final_price.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-gray-900">Outstanding</span>
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
                        Destinations Report
                    </CardTitle>
                    <CardDescription>Order quantity and total weight per destination (Internal Use Only)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Destination</th>
                                    <th className="px-6 py-3">Orders Count</th>
                                    <th className="px-6 py-3">Total Weight (kg)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {destinations.map((dest, index) => (
                                    <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{dest.name}</td>
                                        <td className="px-6 py-4">{dest.count}</td>
                                        <td className="px-6 py-4">{dest.weight}</td>
                                    </tr>
                                ))}
                                {destinations.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-muted-foreground">No destination data available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-t-4 border-t-red-500 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl text-red-900 flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detailed Reports
                        </CardTitle>
                        <CardDescription>Download comprehensive PDF reports for your records.</CardDescription>
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
                                    <div className="font-semibold">Reservations List</div>
                                    <div className="text-xs text-muted-foreground">Full list of all customer reservations</div>
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
                                    <div className="font-semibold">Financial Report</div>
                                    <div className="text-xs text-muted-foreground">Revenue breakdown and summary</div>
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
                                    <div className="font-semibold">Cattle Groups Report</div>
                                    <div className="text-xs text-muted-foreground">Detailed group compositions and status</div>
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
                            Data Export
                        </CardTitle>
                        <CardDescription>Export raw data for external analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-gray-200 text-sm text-muted-foreground mb-4">
                            <p>Exporting data allows you to perform custom analysis in tools like Excel or Google Sheets. Currently supports CSV format.</p>
                        </div>
                        <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white h-auto py-3">
                            <Download className="mr-2 h-4 w-4" />
                            Export All Data (CSV)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
