import React from 'react';
import { Trophy, Medal, Award, User, AlertCircle } from 'lucide-react';
import { getAvatarUrl } from '@/lib/avatar';

export default function TopCustomersTable({ data, onLoadMore, hasMore, loading }) {
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
        <div className="flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
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
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-yellow-500/20 blur-lg rounded-full"></div>
                                                <Medal className="w-6 h-6 text-yellow-500 drop-shadow-sm relative z-10" />
                                            </div>
                                        ) : index === 1 ? (
                                            <Medal className="w-6 h-6 text-gray-400 drop-shadow-sm" />
                                        ) : index === 2 ? (
                                            <Medal className="w-6 h-6 text-orange-500 drop-shadow-sm" />
                                        ) : (
                                            <span className="text-sm font-bold text-muted-foreground/70">#{index + 1}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full overflow-hidden shadow-sm border-2 
                                            ${index === 0 ? 'border-yellow-400' :
                                                index === 1 ? 'border-gray-300' :
                                                    index === 2 ? 'border-orange-300' :
                                                        'border-transparent'}`}>
                                            <img
                                                src={getAvatarUrl(item.customer.email || item.customer.first_name)}
                                                alt={item.customer.first_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors flex items-center gap-1">
                                                {item.customer.first_name} {item.customer.last_name}
                                                {(!item.customer.first_name || !item.customer.last_name || !item.customer.email || item.customer.email.includes('noemail') || !item.customer.country_of_origin) && (
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{item.customer.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${index < 3 ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                        {item.total_points.toLocaleString()} pts
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="pt-4 border-t border-border/40 flex justify-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loading}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Customers'}
                    </button>
                </div>
            )}
        </div>
    );
}
