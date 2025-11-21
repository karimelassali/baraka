import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function MessageActivityChart({ data }) {
    const COLORS = {
        Sent: '#3b82f6',      // blue-500
        Delivered: '#10b981', // emerald-500
        Read: '#8b5cf6',      // violet-500
        Failed: '#ef4444',    // red-500
        Unknown: '#9ca3af'    // gray-400
    };

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                <p>No message activity</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 10,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="var(--muted-foreground)"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="var(--muted-foreground)"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '12px',
                            color: 'var(--foreground)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Unknown} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
