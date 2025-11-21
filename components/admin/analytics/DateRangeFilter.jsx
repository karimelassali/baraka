import React from 'react';
import { motion } from 'framer-motion';

export default function DateRangeFilter({ currentRange, onRangeChange }) {
    const ranges = [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' },
    ];

    return (
        <div className="flex items-center p-1 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm">
            {ranges.map((range) => {
                const isActive = currentRange === range.value;
                return (
                    <button
                        key={range.value}
                        onClick={() => onRangeChange(range.value)}
                        className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors z-10 ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeRange"
                                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                        {range.label}
                    </button>
                );
            })}
        </div>
    );
}
