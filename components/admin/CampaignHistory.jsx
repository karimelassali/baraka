"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    MessageSquare,
    User,
    Filter,
    Calendar,
    BarChart3
} from 'lucide-react';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';
import { Button } from '../ui/button';
import { useTranslations } from 'next-intl';

export default function CampaignHistory() {
    const t = useTranslations('Admin.Campaigns');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchHistory();
    }, [statusFilter, dateRange]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            let url = '/api/admin/campaigns/history?';
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;
            if (dateRange.start) url += `&startDate=${dateRange.start}`;
            if (dateRange.end) url += `&endDate=${dateRange.end}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.message_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats
    const totalSent = messages.length;
    const successCount = messages.filter(m => m.status === 'sent').length;
    const failedCount = messages.filter(m => m.status === 'failed').length;
    const successRate = totalSent > 0 ? Math.round((successCount / totalSent) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('stats.total')}</p>
                        <p className="text-2xl font-bold">{totalSent}</p>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('stats.success_rate')}</p>
                        <p className="text-2xl font-bold">{successRate}%</p>
                    </div>
                </GlassCard>

                <GlassCard className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                        <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">{t('stats.failed')}</p>
                        <p className="text-2xl font-bold">{failedCount}</p>
                    </div>
                </GlassCard>
            </div>

            {/* Filters & Search */}
            < div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-muted/20 p-4 rounded-xl border border-white/5" >
                <div className="flex flex-wrap gap-3 items-center flex-1">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('filters.search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">{t('filters.status')}</option>
                            <option value="sent">{t('filters.sent')}</option>
                            <option value="failed">{t('filters.failed')}</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-background/50 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setStatusFilter('all');
                        setDateRange({ start: '', end: '' });
                        setSearchTerm('');
                    }}
                >
                    {t('filters.reset')}
                </Button>
            </div >

            {/* Messages List */}
            < div className="space-y-3" >
                {
                    loading ? (
                        <div className="flex justify-center items-center h-64" >
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            {t('table.no_messages')}
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <GlassCard key={msg.id} className="p-4 hover:bg-white/5 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={
                                                msg.status === 'sent'
                                                    ? 'bg-green-500/10 text-green-600 border-green-200'
                                                    : 'bg-red-500/10 text-red-600 border-red-200'
                                            }>
                                                {msg.status === 'sent' ? (
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                )}
                                                {msg.status}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(msg.sent_at || new Date()), 'MMM d, yyyy HH:mm')}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
                                            {msg.message_content}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span>
                                                {msg.customers?.first_name} {msg.customers?.last_name}
                                                ({msg.customers?.phone_number})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))
                    )
                }
            </div >
        </div >
    );
}
