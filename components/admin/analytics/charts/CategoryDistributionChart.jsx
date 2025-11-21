import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

export default function CategoryDistributionChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border">
                <p>No category data</p>
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
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        cornerRadius={4}
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#8B5CF6'} />
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
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ paddingTop: '10px' }}
                        formatter={(value) => <span className="text-muted-foreground text-xs font-medium ml-1 mr-3">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
