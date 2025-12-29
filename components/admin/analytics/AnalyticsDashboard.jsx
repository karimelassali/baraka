import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
    PieChart as PieChartIcon,
    X,
    Info,
    MapPin
} from 'lucide-react';
import GlassCard from '../../ui/GlassCard';
import DateRangeFilter from './DateRangeFilter';
import ClientGrowthChart from './charts/ClientGrowthChart';
import MessageActivityChart from './charts/MessageActivityChart';
import VoucherRedemptionChart from './charts/VoucherRedemptionChart';
import CategoryDistributionChart from './charts/CategoryDistributionChart';
import TopCustomersTable from './TopCustomersTable';
import TopCountriesList from './TopCountriesList';
import TopAddressesList from './TopAddressesList';
import InventoryAlerts from './InventoryAlerts';
import { getAvatarUrl } from '@/lib/avatar';
import UserAvatar from '@/components/ui/UserAvatar';

export default function AnalyticsDashboard() {
    const t = useTranslations('Admin.Analytics');
    const [range, setRange] = useState('30d');
    const [overview, setOverview] = useState(null);
    const [clientGrowth, setClientGrowth] = useState([]);
    const [messageActivity, setMessageActivity] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [topCountries, setTopCountries] = useState([]);
    const [topAddresses, setTopAddresses] = useState([]);
    const [topCustomersOffset, setTopCustomersOffset] = useState(0);
    const [topCustomersHasMore, setTopCustomersHasMore] = useState(true);
    const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
    const [inventoryStats, setInventoryStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [calculationModal, setCalculationModal] = useState(null);
    const [usersListModal, setUsersListModal] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!overview) setLoading(true);
            try {
                let overviewUrl = '/api/admin/analytics/overview';
                let clientsUrl = '/api/admin/analytics/clients';
                if (typeof range === 'object') {
                    const query = `?startDate=${range.start}&endDate=${range.end}`;
                    overviewUrl += query;
                    clientsUrl += query;
                } else {
                    const query = `?range=${range}`;
                    overviewUrl += query;
                    clientsUrl += query;
                }

                const [overviewRes, clientsRes, messagesRes, activityRes, topCustomersRes, topCountriesRes, topAddressesRes, inventoryRes] = await Promise.all([
                    fetch(overviewUrl),
                    fetch(clientsUrl),
                    fetch('/api/admin/analytics/messages'),
                    fetch('/api/admin/analytics/activity'),
                    fetch('/api/admin/analytics/top-customers?limit=10'),
                    fetch('/api/admin/analytics/top-countries'),
                    fetch('/api/admin/analytics/top-addresses'),
                    fetch('/api/admin/analytics/inventory')
                ]);

                const overviewData = await overviewRes.json();
                const clientsData = await clientsRes.json();
                const messagesData = await messagesRes.json();
                const activityData = await activityRes.json();
                const topCustomersData = await topCustomersRes.json();
                const topCountriesData = await topCountriesRes.json();
                const topAddressesData = await topAddressesRes.json();
                const inventoryData = await inventoryRes.json();

                setOverview(overviewData);
                setClientGrowth(clientsData);
                setMessageActivity(messagesData);
                setActivityLogs(activityData);
                setTopCountries(Array.isArray(topCountriesData) ? topCountriesData : []);
                setTopAddresses(Array.isArray(topAddressesData) ? topAddressesData : []);

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

    const formatTrend = (value) => {
        if (value === undefined || value === null) return "0.0%";
        const num = Number(value);
        if (isNaN(num)) return "0.0%";
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    };

    const handleCardClick = (type) => {
        const calculations = {
            totalRevenue: {
                title: t('total_revenue'),
                explanation: "Total revenue calculated from Daily Revenue entries within the selected time period."
            },
            totalProducts: {
                title: t('total_products'),
                explanation: "Count of all active products currently in the database."
            },
            inventoryValue: {
                title: t('inventory_value'),
                explanation: "Sum of (Quantity * Purchase Price) for all products. If Purchase Price is missing, Selling Price is used as a fallback."
            },
            lowStock: {
                title: t('low_stock_items'),
                explanation: "Count of products where the current Quantity is less than or equal to the Minimum Stock Level set for that product."
            },
            expiringSoon: {
                title: t('expiring_soon'),
                explanation: "Count of products that have an expiration date within the next 7 days."
            }
        };
        setCalculationModal(calculations[type]);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">{t('gathering_insights')}</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8 p-2 relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        {t('title')}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {t('subtitle')}
                    </p>
                </div>
                <DateRangeFilter currentRange={range} onRangeChange={setRange} />
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatsCard
                    title={t('total_clients')}
                    value={overview?.totalCustomers}
                    icon={Users}
                    trend={formatTrend(overview?.trends?.customers)}
                    trendUp={(overview?.trends?.customers || 0) >= 0}
                    color="blue"
                />
                <ModernStatsCard
                    title={t('total_revenue')}
                    value={`€${overview?.totalVoucherValue?.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}`}
                    icon={CreditCard}
                    trend={formatTrend(overview?.trends?.revenue)}
                    trendUp={(overview?.trends?.revenue || 0) >= 0}
                    color="emerald"
                    onClick={() => handleCardClick('totalRevenue')}
                />
                <ModernStatsCard
                    title={t('active_offers')}
                    value={overview?.activeOffers}
                    icon={Ticket}
                    trend={t('stable')}
                    trendUp={true}
                    color="purple"
                />
                <ModernStatsCard
                    title={t('engagement')}
                    value={overview?.totalMessages}
                    icon={MessageCircle}
                    trend={formatTrend(overview?.trends?.messages)}
                    trendUp={(overview?.trends?.messages || 0) >= 0}
                    color="rose"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart - Takes up 2 columns */}
                <GlassCard className="lg:col-span-2 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">{t('client_growth')}</h3>
                            <p className="text-sm text-muted-foreground">{t('client_growth_desc')}</p>
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
                            <h3 className="text-xl font-semibold text-foreground">{t('voucher_status')}</h3>
                            <p className="text-sm text-muted-foreground">{t('voucher_status_desc')}</p>
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
                            <span className="text-sm text-muted-foreground">{t('total')}</span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 rounded-xl bg-muted/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('redeemed')}</p>
                            <p className="text-lg font-bold text-emerald-500">{overview?.redeemedVouchers || 0}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/50">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('active')}</p>
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
                            <h3 className="text-xl font-semibold text-foreground">{t('top_countries')}</h3>
                            <p className="text-sm text-muted-foreground">{t('top_countries_desc')}</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TopCountriesList
                            data={topCountries}
                            onCountryClick={(country) => setUsersListModal(country)}
                        />
                    </div>
                </GlassCard>

                <GlassCard className="h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">Top Addresses</h3>
                            <p className="text-sm text-muted-foreground">Most frequent customer locations</p>
                        </div>
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                            <MapPin className="w-5 h-5 text-pink-500" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <TopAddressesList
                            data={topAddresses}
                            onAddressClick={(item) => setUsersListModal({ ...item, isAddress: true })}
                        />
                    </div>
                </GlassCard>

                <GlassCard className="h-[600px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-foreground">{t('top_loyal_customers')}</h3>
                            <p className="text-sm text-muted-foreground">{t('top_loyal_customers_desc')}</p>
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

            {/* Message Activity */}
            <GlassCard className="h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-foreground">{t('message_activity')}</h3>
                        <p className="text-sm text-muted-foreground">{t('message_activity_desc')}</p>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <MessageActivityChart data={messageActivity} />
                </div>
            </GlassCard>

            {/* Inventory Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border/40 pb-4">
                    <Package className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">{t('inventory_overview')}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModernStatsCard
                        title={t('total_products')}
                        value={inventoryStats?.totalProducts}
                        icon={Package}
                        color="blue"
                        onClick={() => handleCardClick('totalProducts')}
                    />
                    <ModernStatsCard
                        title={t('inventory_value')}
                        value={`€${(inventoryStats?.totalValue > 0 ? inventoryStats.totalValue : inventoryStats?.totalSalesValue)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}`}
                        icon={CreditCard}
                        color="emerald"
                        onClick={() => handleCardClick('inventoryValue')}
                    />
                    <ModernStatsCard
                        title={t('low_stock_items')}
                        value={inventoryStats?.lowStockCount}
                        icon={AlertTriangle}
                        color="yellow"
                        trend={inventoryStats?.lowStockCount > 0 ? t('action_needed') : t('healthy')}
                        trendUp={inventoryStats?.lowStockCount === 0}
                        onClick={() => handleCardClick('lowStock')}
                    />
                    {/* <ModernStatsCard
                        title={t('expiring_soon')}
                        value={inventoryStats?.expiringSoonCount}
                        icon={Clock}
                        color="rose"
                        trend={inventoryStats?.expiringSoonCount > 0 ? t('review') : t('good')}
                        trendUp={inventoryStats?.expiringSoonCount === 0}
                        onClick={() => handleCardClick('expiringSoon')}
                    /> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <GlassCard className="lg:col-span-1 h-[350px] flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-foreground">{t('category_distribution')}</h3>
                                <p className="text-sm text-muted-foreground">{t('category_distribution_desc')}</p>
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
                                <h3 className="text-xl font-semibold text-foreground">{t('attention_needed')}</h3>
                                <p className="text-sm text-muted-foreground">{t('attention_needed_desc')}</p>
                            </div>
                            <Link href="/admin/inventory" className="text-sm text-primary hover:underline">
                                {t('view_all_inventory')}
                            </Link>
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
                    <h3 className="text-xl font-semibold text-foreground">{t('recent_system_activity')}</h3>
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
                            <p>{t('no_recent_activity')}</p>
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Calculation Modal */}
            <AnimatePresence>
                {calculationModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Info size={20} />
                                        </div>
                                        <h3 className="text-lg font-bold">{calculationModal.title}</h3>
                                    </div>
                                    <button
                                        onClick={() => setCalculationModal(null)}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {calculationModal.explanation}
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setCalculationModal(null)}
                                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Users List Modal (for Countries) */}
            <AnimatePresence>
                {usersListModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-background rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-border flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold">
                                            {usersListModal.isAddress ? `Users from ${usersListModal.address}` : `Users from ${usersListModal.country}`}
                                        </h3>
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                            {usersListModal.count} Users
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setUsersListModal(null)}
                                        className="p-2 hover:bg-muted rounded-full transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(usersListModal.count > 10 ? usersListModal.users.slice(0, 5) : usersListModal.users).map((user, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50">
                                            <div className="flex-shrink-0">
                                                <UserAvatar
                                                    name={`${user.first_name} ${user.last_name}`}
                                                    email={user.email}
                                                    size={40}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{user.first_name} {user.last_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.phone_number || 'No phone'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {usersListModal.count > 10 && (
                                        <div className="col-span-1 sm:col-span-2 text-center py-4 text-muted-foreground">
                                            <p>...and {usersListModal.count - 5} more users</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function ModernStatsCard({ title, value, icon: Icon, trend, trendUp, color, onClick }) {
    const colorMap = {
        blue: 'text-blue-500 bg-blue-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        rose: 'text-rose-500 bg-rose-500/10',
        yellow: 'text-yellow-500 bg-yellow-500/10',
    };

    const activeColor = colorMap[color] || colorMap.blue;

    return (
        <GlassCard
            className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
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
