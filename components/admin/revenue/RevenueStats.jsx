
"use client";

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { TrendingUp, CreditCard, Banknote, Ticket, AlertTriangle } from 'lucide-react';

export default function RevenueStats({ data }) {
    const t = useTranslations('Admin.Revenue');

    const totalRevenue = data.reduce((sum, item) => sum + (Number(item.total_revenue) || 0), 0);
    const totalCash = data.reduce((sum, item) => sum + (Number(item.cash) || 0), 0);
    const totalCard = data.reduce((sum, item) => sum + (Number(item.card) || 0), 0);
    const totalTicket = data.reduce((sum, item) => sum + (Number(item.ticket) || 0), 0);
    const totalRevenueAnnule = data.reduce((sum, item) => sum + (Number(item.revenue_annule) || 0), 0);

    const pieData = [
        { name: t('cash'), value: totalCash, color: '#22c55e' }, // Green
        { name: t('card'), value: totalCard, color: '#3b82f6' }, // Blue
        { name: t('ticket'), value: totalTicket, color: '#f59e0b' }, // Amber
    ];

    // Prepare data for bar chart (last 7 entries or all if less)
    const barData = [...data]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-10)
        .map(item => ({
            date: new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
            total: Number(item.total_revenue)
        }));

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
                    <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className="text-2xl font-bold">€{value.toFixed(2)}</div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    title={t('total_revenue')}
                    value={totalRevenue}
                    icon={TrendingUp}
                    colorClass="bg-primary text-primary"
                />
                <StatCard
                    title={t('cash')}
                    value={totalCash}
                    icon={Banknote}
                    colorClass="bg-green-500 text-green-500"
                />
                <StatCard
                    title={t('card')}
                    value={totalCard}
                    icon={CreditCard}
                    colorClass="bg-blue-500 text-blue-500"
                />
                <StatCard
                    title={t('ticket')}
                    value={totalTicket}
                    icon={Ticket}
                    colorClass="bg-amber-500 text-amber-500"
                />
                <StatCard
                    title="Altre"
                    value={totalRevenueAnnule}
                    icon={AlertTriangle}
                    colorClass="bg-red-500 text-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-card border border-border/50 rounded-xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-semibold mb-6">{t('revenue_trend')}</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `€${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--muted)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--card-foreground)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        padding: '12px',
                                        border: '1px solid var(--border)'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '8px' }}
                                />
                                <Bar
                                    dataKey="total"
                                    fill="var(--primary)"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border/50 rounded-xl p-6 shadow-sm"
                >
                    <h3 className="text-lg font-semibold mb-6">{t('payment_split')}</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--card-foreground)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                        padding: '12px',
                                        border: '1px solid var(--border)'
                                    }}
                                    itemStyle={{ color: 'var(--foreground)' }}
                                    formatter={(value) => `€${value.toFixed(2)}`}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
