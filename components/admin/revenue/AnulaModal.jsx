"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, TrendingUp } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function AnulaModal({ isOpen, onClose }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const fetchYearlyRevenue = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/revenue?year=${selectedYear}`);
            if (response.ok) {
                const data = await response.json();
                processData(data);
            }
        } catch (error) {
            console.error('Error fetching yearly revenue:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const processData = (data) => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const monthlyTotals = new Array(12).fill(0);

        data.forEach(item => {
            // item.date is expected to be YYYY-MM-DD
            const monthIndex = parseInt(item.date.split('-')[1]) - 1;
            if (monthIndex >= 0 && monthIndex < 12) {
                monthlyTotals[monthIndex] += (Number(item.total_revenue) || 0);
            }
        });

        const processed = months.map((month, index) => ({
            name: month,
            total: monthlyTotals[index]
        }));

        setChartData(processed);
    };

    useEffect(() => {
        if (isOpen) {
            fetchYearlyRevenue();
        }
    }, [isOpen, selectedYear]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Revenue Trend</h2>
                                <p className="text-sm text-gray-500">Monthly breakdown for {selectedYear}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-gray-700"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 h-[500px]">
                        {isLoading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        tickFormatter={(value) => `€${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            borderColor: '#E5E7EB',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                            padding: '12px'
                                        }}
                                        formatter={(value) => [`€${value.toFixed(2)}`, 'Revenue']}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="var(--primary)"
                                        radius={[6, 6, 0, 0]}
                                        barSize={50}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
