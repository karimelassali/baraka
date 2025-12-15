import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

export default function DateRangeFilter({ currentRange, onRangeChange }) {
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const ranges = [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' },
    ];

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            onRangeChange({ start: customStart, end: customEnd, label: 'Custom' });
            setIsCustomOpen(false);
        }
    };

    const isCustomActive = typeof currentRange === 'object';

    return (
        <div className="relative z-50">
            <div className="flex items-center p-1 rounded-xl bg-muted/50 border border-border/50 backdrop-blur-sm">
                {ranges.map((range) => {
                    const isActive = currentRange === range.value;
                    return (
                        <button
                            key={range.value}
                            onClick={() => {
                                onRangeChange(range.value);
                                setIsCustomOpen(false);
                            }}
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

                <button
                    onClick={() => setIsCustomOpen(!isCustomOpen)}
                    className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors z-10 flex items-center gap-2 ${isCustomActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    {isCustomActive && (
                        <motion.div
                            layoutId="activeRange"
                            className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border/50"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ zIndex: -1 }}
                        />
                    )}
                    <Calendar size={14} />
                    {isCustomActive ? `${currentRange.start} - ${currentRange.end}` : 'Custom'}
                </button>
            </div>

            <AnimatePresence>
                {isCustomOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 p-4 bg-background border border-border rounded-xl shadow-lg w-72 z-50"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/50 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="w-full px-3 py-2 bg-muted/50 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <button
                                onClick={handleCustomApply}
                                disabled={!customStart || !customEnd}
                                className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
