"use client";

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { getAvatarUrl } from '@/lib/avatar';

export default function ActiveFilterSummary({ total, customers, isLoading, titleOverride }) {
    if (isLoading) {
        return (
            <GlassCard className="mb-6 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
            </GlassCard>
        );
    }

    if (!customers || customers.length === 0) return null;

    const displayCustomers = customers.slice(0, 10);
    const remaining = Math.max(0, total - displayCustomers.length);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <GlassCard className="p-2 py-3 px-6 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-xl border-primary/10 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary shadow-sm shadow-primary/10">
                        <Users size={22} />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-2xl font-bold text-foreground">
                                {total}
                            </h3>
                            <span className="text-sm font-medium text-muted-foreground">
                                {titleOverride || 'Customers Found'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground/80">
                            Matching your current active filters
                        </p>
                    </div>
                </div>

                <div className="flex -space-x-4 rtl:space-x-reverse overflow-hidden p-2">
                    {displayCustomers.map((customer, i) => (
                        <motion.div
                            key={customer.id || i}
                            initial={{ opacity: 0, scale: 0.5, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative w-12 h-12 rounded-full border-2 border-background overflow-hidden hover:scale-110 hover:-translate-y-1 hover:z-10 transition-all duration-300 cursor-pointer shadow-md group"
                            title={`${customer.first_name || ''} ${customer.last_name || ''}`}
                        >
                            <img
                                src={getAvatarUrl(customer.email || customer.first_name)}
                                alt={customer.first_name || 'User'}
                                className="w-full h-full object-cover"
                            />
                            {/* Tooltip effect */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </motion.div>
                    ))}
                    {remaining > 0 && (
                        <div className="relative w-12 h-12 rounded-full border-2 border-background bg-muted/80 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-foreground shadow-sm z-0">
                            +{remaining}
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
}
