"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, Scale, Loader2, PieChart, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '@/components/ui/GlassCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateEidPdf } from '@/lib/eidPdfUtils';
import { toast } from 'sonner';

export default function Reports() {
    const [stats, setStats] = useState({
        total_reservations: 0,
        total_sheep: 0,
        total_goats: 0,
        total_cattle: 0,
        total_revenue: 0,
        total_weight_sold: 0,
        avg_weight: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
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

    const handleDownloadReservations = async () => {
        const toastId = toast.loading('Generazione rapporto...');
        try {
            const res = await fetch('/api/admin/eid/reservations?limit=1000');
            const { data } = await res.json();

            const columns = ['Ordine', 'Cliente', 'Telefono', 'Tipo', 'Peso', 'Ritiro', 'Acconto', 'Stato'];
            const rows = data.map(r => [
                r.order_number,
                `${r.customers?.first_name} ${r.customers?.last_name}`,
                r.customers?.phone_number || '-',
                r.animal_type,
                r.requested_weight,
                r.pickup_time ? new Date(r.pickup_time).toLocaleString() : '-',
                `${r.total_deposit}€`,
                r.status
            ]);

            generateEidPdf({
                title: 'Rapporto Prenotazioni Completo',
                columns,
                data: rows,
                filename: `eid_prenotazioni_tutte_${new Date().toISOString().split('T')[0]}`,
                details: {
                    'Totale': data.length,
                    'Generato Da': 'Admin'
                }
            });
            toast.success('Rapporto generato', { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error('Errore generazione rapporto', { id: toastId });
        }
    };

    const handleDownloadCattleGroups = async () => {
        const toastId = toast.loading('Generazione rapporto...');
        try {
            const res = await fetch('/api/admin/eid/cattle?limit=1000');
            const { data } = await res.json();

            const columns = ['Gruppo', 'Peso', 'Slot', 'Cliente', 'Telefono', 'Stato'];
            const rows = [];

            data.forEach(group => {
                const members = group.eid_cattle_members?.sort((a, b) => a.member_number - b.member_number) || [];
                members.forEach(member => {
                    rows.push([
                        group.group_name,
                        `${group.cattle_weight || '-'} kg`,
                        member.member_number,
                        `${member.customers?.first_name} ${member.customers?.last_name}`,
                        member.customers?.phone_number || '-',
                        member.is_paid ? 'PAGATO' : 'IN ATTESA'
                    ]);
                });
            });

            generateEidPdf({
                title: 'Rapporto Master Gruppi Bovini',
                columns,
                data: rows,
                filename: `eid_gruppi_bovini_master_${new Date().toISOString().split('T')[0]}`,
                details: {
                    'Totale Gruppi': data.length,
                    'Totale Membri': rows.length
                }
            });
            toast.success('Rapporto generato', { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error('Errore generazione rapporto', { id: toastId });
        }
    };

    const handleDownloadFinancial = () => {
        const columns = ['Metric', 'Value', 'Details'];
        const data = [
            ['Total Revenue', `${stats.total_revenue}€`, 'Gross revenue from all sources'],
            ['Total Sheep Sold', stats.total_sheep, 'Count of sheep reservations'],
            ['Total Goats Sold', stats.total_goats, 'Count of goat reservations'],
            ['Total Cattle Groups', stats.total_cattle, 'Active cattle groups'],
            ['Total Weight Sold', `${stats.total_weight_sold} kg`, 'Cumulative weight of all animals'],
            ['Average Weight', `${stats.avg_weight} kg`, 'Average weight per animal']
        ];

        generateEidPdf({
            title: 'Eid Financial Summary',
            columns,
            data,
            filename: `eid_financial_report_${new Date().toISOString().split('T')[0]}`,
            details: {
                'Report Date': new Date().toLocaleDateString(),
                'Currency': 'EUR'
            }
        });
        toast.success('Financial report generated');
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
