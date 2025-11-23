import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    MessageCircle,
    Ticket,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    Calendar,
    Package,
    AlertTriangle,
    Clock,
    PieChart as PieChartIcon
} from 'lucide-react';
import GlassCard from '../../ui/GlassCard';
import DateRangeFilter from './DateRangeFilter';
import ClientGrowthChart from './charts/ClientGrowthChart';
import MessageActivityChart from './charts/MessageActivityChart';
import VoucherRedemptionChart from './charts/VoucherRedemptionChart';
import CategoryDistributionChart from './charts/CategoryDistributionChart';
import TopCustomersTable from './TopCustomersTable';
import InventoryAlerts from './InventoryAlerts';

export default function AnalyticsDashboard() {
    const [range, setRange] = useState('30d');
    const [overview, setOverview] = useState(null);
    const [clientGrowth, setClientGrowth] = useState([]);
    const [messageActivity, setMessageActivity] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topCustomersOffset, setTopCustomersOffset] = useState(0);
    const [topCustomersHasMore, setTopCustomersHasMore] = useState(true);
    const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
    const [inventoryStats, setInventoryStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!overview) setLoading(true);
            try {
                const [overviewRes, clientsRes, messagesRes, activityRes, topCustomersRes, inventoryRes] = await Promise.all([
                    fetch('/api/admin/analytics/overview'),
                    fetch(`/api/admin/analytics/clients?range=${range}`),
                    fetch('/api/admin/analytics/messages'),
                    fetch('/api/admin/analytics/activity'),
                    fetch('/api/admin/analytics/top-customers?limit=10'),
                    fetch('/api/admin/analytics/inventory')
                ]);

                const overviewData = await overviewRes.json();
                const clientsData = await clientsRes.json();
                const messagesData = await messagesRes.json();
                const activityData = await activityRes.json();
                const topCustomersData = await topCustomersRes.json();
                const inventoryData = await inventoryRes.json();

                setOverview(overviewData);
                setClientGrowth(clientsData);
                setMessageActivity(messagesData);
                setActivityLogs(activityData);

                // Ensure topCustomersData is always an array
                const validTopCustomers = Array.isArray(topCustomersData) ? topCustomersData : [];
                setTopCustomers(validTopCustomers);
                setTopCustomersOffset(10);
                setTopCustomersHasMore(validTopCustomers.length === 10);

                setInventoryStats(inventoryData);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]);

    const loadMoreTopCustomers = async () => {
        if (loadingMoreCustomers || !topCustomersHasMore) return;

        setLoadingMoreCustomers(true);
        try {
            const res = await fetch(`/api/admin/analytics/top-customers?limit=10&offset=${topCustomersOffset}`);
            const newData = await res.json();

            if (Array.isArray(newData)) {
                setTopCustomers(prev => [...prev, ...newData]);
                setTopCustomersOffset(prev => prev + 10);
                setTopCustomersHasMore(newData.length === 10);
            }
        } catch (error) {
            console.error('Failed to load more customers:', error);
        } finally {
            setLoadingMoreCustomers(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (loading && !overview) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Gathering insights...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8 p-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Real-time insights into your business performance.
                    </p>
                </div>
                <DateRangeFilter currentRange={range} onRangeChange={setRange} />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatsCard
                    title="Total Clients"
                    value={overview?.totalCustomers}
                    icon={Users}
                    trend="+12%"
                    trendUp={true}
                    color="blue"
                />
                <ModernStatsCard
                    title="Total Revenue (Est.)"
                    value={`€${overview?.totalVoucherValue?.toFixed(0) || '0'}`}
                    icon={CreditCard}
                    trend="+8%"
                    trendUp={true}
                    color="emerald"
                />
                <ModernStatsCard
                    title="Active Offers"
                    value={overview?.activeOffers}
                    icon={Ticket}
                    trend="Stable"
                    trendUp={true}
                    color="purple"
                />
                <ModernStatsCard
                    title="Engagement"
                    value={overview?.totalMessages}
                    icon={MessageCircle}
                    trend="+24%"
                    trendUp={true}
                    color="rose"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart - Takes up 2 columns */}
                <GlassCard className="lg:col-span-2 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Client Growth</h3>
                            <p className="text-sm text-muted-foreground">New registrations over time</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ClientGrowthChart data={clientGrowth} />
                    </div>
                </GlassCard>

                {/* Voucher Stats - Takes up 1 column */}
                <GlassCard className="flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Voucher Status</h3>
                            <p className="text-sm text-muted-foreground">Redemption overview</p>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <VoucherRedemptionChart
                            active={(overview?.totalVouchers || 0) - (overview?.redeemedVouchers || 0)}
                            redeemed={overview?.redeemedVouchers || 0}
                        />
                        {/* Center Text Overlay for Donut Chart */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-foreground">{overview?.totalVouchers || 0}</span>
                            <span className="text-sm text-muted-foreground">Total</span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-muted/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Redeemed</p>
                            <p className="text-lg font-bold text-emerald-500">{overview?.redeemedVouchers || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
                            <p className="text-lg font-bold text-blue-500">
                                {(overview?.totalVouchers || 0) - (overview?.redeemedVouchers || 0)}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Secondary Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Message Activity</h3>
                            <p className="text-sm text-muted-foreground">WhatsApp campaign performance</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0">
                        <MessageActivityChart data={messageActivity} />
                    </div>
                </GlassCard>

                <GlassCard className="h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Top Loyal Customers</h3>
                            <p className="text-sm text-muted-foreground">Highest points balance</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TopCustomersTable
                            data={topCustomers}
                            onLoadMore={loadMoreTopCustomers}
                            hasMore={topCustomersHasMore}
                            loading={loadingMoreCustomers}
                        />
                    </div>
                </GlassCard>
            </div>

            {/* Inventory Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <Package className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">Inventory Overview</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ModernStatsCard
                        title="Total Products"
                        value={inventoryStats?.totalProducts}
                        icon={Package}
                        color="blue"
                    />
                    <ModernStatsCard
                        title="Inventory Value"
                        value={`€${(inventoryStats?.totalValue > 0 ? inventoryStats.totalValue : inventoryStats?.totalSalesValue)?.toLocaleString() || '0'}`}
                        icon={CreditCard}
                        color="emerald"
                    />
                    <ModernStatsCard
                        title="Low Stock Items"
                        value={inventoryStats?.lowStockCount}
                        icon={AlertTriangle}
                        color="yellow"
                        trend={inventoryStats?.lowStockCount > 0 ? "Action Needed" : "Healthy"}
                        trendUp={inventoryStats?.lowStockCount === 0}
                    />
                    <ModernStatsCard
                        title="Expiring Soon"
                        value={inventoryStats?.expiringSoonCount}
                        icon={Clock}
                        color="rose"
                        trend={inventoryStats?.expiringSoonCount > 0 ? "Review" : "Good"}
                        trendUp={inventoryStats?.expiringSoonCount === 0}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <GlassCard className="lg:col-span-1 h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">Category Distribution</h3>
                                <p className="text-sm text-muted-foreground">Products by category</p>
                            </div>
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <PieChartIcon className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <CategoryDistributionChart data={inventoryStats?.categoryStats} />
                        </div>
                    </GlassCard>

                    <GlassCard className="lg:col-span-2 h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">Attention Needed</h3>
                                <p className="text-sm text-muted-foreground">Low stock and expiring items</p>
                            </div>
                            <button className="text-sm text-primary hover:underline">
                                View All Inventory
                            </button>
                        </div>
                        <div className="flex-1 min-h-0">
                            <InventoryAlerts
                                lowStockItems={inventoryStats?.lowStockItems}
                                expiringItems={inventoryStats?.expiringSoonItems}
                            />
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Recent Activity Feed */}
            <GlassCard>
                <div className="flex items-center gap-3 mb-6">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Recent System Activity</h3>
                </div>
                <div className="space-y-1">
                    {activityLogs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-all group border border-transparent hover:border-border/50"
                        >
                            <div className={`p-3 rounded-full flex-shrink-0 ${log.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                                log.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                    log.status === 'read' ? 'bg-purple-500/10 text-purple-500' :
                                        'bg-red-500/10 text-red-500'
                                }`}>
                                <MessageCircle size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="font-medium text-foreground truncate">
                                        {log.customers ? `${log.customers.first_name} ${log.customers.last_name}` : 'Unknown User'}
                                    </p>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(log.sent_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    WhatsApp message status updated to <span className="font-medium text-foreground">{log.status}</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {activityLogs.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No recent activity recorded</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
}

function ModernStatsCard({ title, value, icon: Icon, trend, trendUp, color }) {
    const colorMap = {
        blue: 'text-blue-500 bg-blue-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        rose: 'text-rose-500 bg-rose-500/10',
        yellow: 'text-yellow-500 bg-yellow-500/10',
    };

    const activeColor = colorMap[color] || colorMap.blue;

    return (
        <GlassCard className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${activeColor} transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trendUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                        }`}>
                        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{value !== undefined ? value : '-'}</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">{title}</p>
            </div>
            {/* Decorative background blob */}
            <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full ${activeColor} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`} />
        </GlassCard>
    );
}
