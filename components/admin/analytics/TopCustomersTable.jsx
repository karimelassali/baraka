import React from 'react';
import { Trophy, Medal, Award, User } from 'lucide-react';

export default function TopCustomersTable({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 mb-3">
                    <Trophy className="w-8 h-8 opacity-40" />
                </div>
                <p>No customer data available</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto h-full">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rank</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Points</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                    {data.map((item, index) => (
                        <tr key={item.customer_id} className="group hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                                <div className="flex items-center justify-center w-8 h-8">
                                    {index === 0 ? (
                                        <Medal className="w-6 h-6 text-yellow-500 drop-shadow-sm" />
                                    ) : index === 1 ? (
                                        <Medal className="w-6 h-6 text-gray-400 drop-shadow-sm" />
                                    ) : index === 2 ? (
                                        <Medal className="w-6 h-6 text-orange-500 drop-shadow-sm" />
                                    ) : (
                                        <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                                            {item.customer.first_name} {item.customer.last_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{item.customer.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    {item.total_points.toLocaleString()} pts
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
