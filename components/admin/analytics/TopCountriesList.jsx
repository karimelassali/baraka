import React from 'react';
import { Globe, Users, ChevronRight } from 'lucide-react';
import { countries } from '../../../lib/constants/countries';
import { motion } from 'framer-motion';
import { getAvatarUrl } from '@/lib/avatar';

export default function TopCountriesList({ data, onCountryClick }) {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 mb-3">
                    <Globe className="w-8 h-8 opacity-40" />
                </div>
                <p>No country data available</p>
            </div>
        );
    }

    const getFlag = (countryName) => {
        const country = countries.find(c => c.name === countryName);
        return country ? country.flag : '🌍';
    };

    const maxUsers = Math.max(...data.map(item => item.count));

    const colors = [
        'bg-blue-500',
        'bg-emerald-500',
        'bg-purple-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-indigo-500',
        'bg-cyan-500',
        'bg-pink-500',
        'bg-lime-500',
        'bg-orange-500'
    ];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="overflow-y-auto flex-1 pr-2">
                <div className="space-y-6">
                    {data.map((item, index) => {
                        const percentage = (item.count / maxUsers) * 100;
                        const color = colors[index % colors.length];

                        return (
                            <motion.div
                                key={item.country}
                                className="group cursor-pointer"
                                onClick={() => onCountryClick && onCountryClick(item)}
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getFlag(item.country)}</span>
                                        <span className="font-medium text-foreground">{item.country}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-foreground">{item.count}</span>
                                        <Users className="w-3 h-3 text-muted-foreground" />
                                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`absolute top-0 left-0 h-full rounded-full ${color}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: index * 0.1 }}
                                    />
                                </div>

                                <div className="flex items-center gap-1 mt-2 pl-1">
                                    <div className="flex -space-x-2">
                                        {item.users.slice(0, 5).map((user, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-background overflow-hidden" title={`${user.first_name} ${user.last_name}`}>
                                                <img
                                                    src={getAvatarUrl(user.first_name)}
                                                    alt={user.first_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {item.users.length > 5 && (
                                            <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                                                +{item.users.length - 5}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
