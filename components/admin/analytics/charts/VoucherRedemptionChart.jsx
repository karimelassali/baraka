import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

export default function VoucherRedemptionChart({ active, redeemed }) {
    const data = [
        { name: 'Active', value: active },
        { name: 'Redeemed', value: redeemed },
    ];

    const COLORS = ['#3b82f6', '#10b981']; // blue-500, emerald-500

    if (active === 0 && redeemed === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                <p>No voucher data</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80} // Increased inner radius for donut effect
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={6}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            borderColor: 'var(--border)',
                            borderRadius: '12px',
                            color: 'var(--foreground)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
