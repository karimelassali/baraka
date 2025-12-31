"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    BarChart3,
    Loader2
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

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const router = useRouter();
    const [demoCampaigns, setDemoCampaigns] = useState([]);

    useEffect(() => {
        setPage(1);
        setHasMore(true);
        fetchHistory(1, true);
        fetchDemoCampaigns();
    }, [statusFilter, dateRange]);

    const fetchDemoCampaigns = () => {
        const campaigns = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('campaign_')) {
                try {
                    const data = JSON.parse(sessionStorage.getItem(key));
                    campaigns.push(data);
                } catch (e) {
                    console.error('Error parsing campaign data', e);
                }
            }
        }
        // Sort by date desc
        campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDemoCampaigns(campaigns);
    };

    const fetchHistory = async (pageToLoad = 1, isInitial = false) => {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        try {
            let url = `/api/admin/campaigns/history?page=${pageToLoad}&limit=10`;
            if (statusFilter !== 'all') url += `&status=${statusFilter}`;
            if (dateRange.start) url += `&startDate=${dateRange.start}`;
            if (dateRange.end) url += `&endDate=${dateRange.end}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                const newMessages = data.messages || [];

                if (newMessages.length < 10) {
                    setHasMore(false);
                }

                if (isInitial) {
                    setMessages(newMessages);
                } else {
                    setMessages(prev => [...prev, ...newMessages]);
                }
                setPage(pageToLoad);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        fetchHistory(page + 1, false);
    };

    const filteredMessages = messages.filter(msg =>
        msg.message_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate stats (Note: Currently only based on loaded messages, which might be misleading for pagination. 
    // Ideally stats should come from an API summary endpoint. For now we keep it client-side based on loaded data as per existing logic)
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
            <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between bg-muted/20 p-4 rounded-xl border border-white/5" >
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
            <div className="space-y-3">
                {/* Demo Campaigns Section */}
                {demoCampaigns.length > 0 && (
                    <div className="mb-6 space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Sessions (Demo)</h3>
                        {demoCampaigns.map((camp) => (
                            <GlassCard key={camp.id} className="p-4 hover:bg-white/5 transition-colors border-l-4 border-l-indigo-500">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-200">
                                                Campaign Session
                                            </Badge>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(camp.createdAt), 'MMM d, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium truncate">{camp.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {camp.users?.length || 0} recipients
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => router.push(`/admin/campaigns/${camp.id}`)}
                                        className="gap-2"
                                    >
                                        View Progress
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}

                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Message Log</h3>
                {
                    loading ? (
                        <div className="flex justify-center items-center h-64" >
                            <Loader2 className="animate-spin h-8 w-8 text-green-500" />
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            {t('table.no_messages')}
                        </div>
                    ) : (
                        <>
                            {filteredMessages.map((msg) => (
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
                                                    {msg.customers?.phone_number && ` (${msg.customers.phone_number})`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}

                            {hasMore && !searchTerm && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className="gap-2"
                                    >
                                        {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                        {loadingMore ? 'Loading...' : 'Show More'}
                                    </Button>
                                </div>
                            )}
                        </>
                    )
                }
            </div >
        </div >
    );
}
