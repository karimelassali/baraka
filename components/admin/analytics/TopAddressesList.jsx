import React from 'react';
import { MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import UserAvatar from '@/components/ui/UserAvatar';

export default function TopAddressesList({ data, onAddressClick }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 mb-3">
                    <MapPin className="w-8 h-8 opacity-40" />
                </div>
                <p>No address data available</p>
            </div>
        );
    }

    


    const maxUsers = Math.max(...data.map(item => item.count));

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                {data.map((item, index) => {
                    const percentage = (item.count / maxUsers) * 100;
                    const rank = index + 1;
 
                    return (
                        <motion.div
                            key={item.address}
                            onClick={() => onAddressClick && onAddressClick(item)}
                            className="group relative rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 transition-all cursor-pointer p-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.01, y: -2 }}
                        >
                            <div className="flex items-start gap-3">
                                {/* Rank Indicator */}
                                <div className={`
                                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm mt-0.5
                                    ${rank === 1 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border border-yellow-200' :
                                        rank === 2 ? 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 border border-slate-200' :
                                            rank === 3 ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 border border-amber-200' :
                                                'bg-muted text-muted-foreground border border-border'}
                                `}>
                                    {rank <= 3 ? (
                                        rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'
                                    ) : (
                                        rank
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-sm text-foreground truncate" title={item.address}>
                                            {item.address}
                                        </h4>
                                        <div className="flex items-center gap-1.5 bg-pink-500/10 text-pink-600 px-2 py-0.5 rounded-md">
                                            <span className="font-bold text-xs">{item.count}</span>
                                            <Users className="w-3 h-3" />
                                        </div>
                                    </div>

                                    {/* Progress Bar - Requested Feature */}
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2.5">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                    </div>

                                    {/* Footer / Avatars */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-1.5">
                                            {item.users.slice(0, 5).map((user, i) => (
                                                <div key={i} className="ring-2 ring-background rounded-full transition-transform hover:scale-110 hover:z-10">
                                                    <UserAvatar
                                                        name={`${user.first_name} ${user.last_name}`}
                                                        size={20}
                                                        className="w-5 h-5 text-[9px]"
                                                    />
                                                </div>
                                            ))}
                                            {item.users.length > 5 && (
                                                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground ring-2 ring-background">
                                                    +{item.users.length - 5}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground font-medium">
                                            {percentage.toFixed(0)}% of max
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
