
"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
    Plus,
    Download,
    Calendar as CalendarIcon,
    TrendingUp,
    CreditCard,
    Banknote,
    Ticket
} from 'lucide-react';
import { format } from 'date-fns';
import RevenueEntryForm from '@/components/admin/revenue/RevenueEntryForm';
import RevenueArchive from '@/components/admin/revenue/RevenueArchive';
import RevenueStats from '@/components/admin/revenue/RevenueStats';
import { generateRevenuePDF } from '@/lib/reports/generateRevenuePDF';

export default function DailyRevenuePage() {
    const t = useTranslations('Admin.Revenue');
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const fetchRevenue = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/revenue?month=${selectedMonth}&year=${selectedYear}`);
            if (response.ok) {
                const data = await response.json();
                setRevenueData(data);
            }
        } catch (error) {
            console.error('Error fetching revenue:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenue();
    }, [selectedMonth, selectedYear]);

    const handleExportPDF = () => {
        generateRevenuePDF(revenueData, selectedMonth, selectedYear);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2"
                    >
                        <Download className="w-4 h-4" />
                        {t('export_pdf')}
                    </button>
                    <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        {t('add_entry')}
                    </button>
                </div>
            </div>

            <RevenueStats data={revenueData} />

            <RevenueArchive
                data={revenueData}
                isLoading={isLoading}
                onRefresh={fetchRevenue}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
            />

            <RevenueEntryForm
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSuccess={() => {
                    setIsEntryModalOpen(false);
                    fetchRevenue();
                }}
            />
        </div>
    );
}
