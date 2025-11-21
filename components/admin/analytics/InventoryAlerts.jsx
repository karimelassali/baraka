import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryAlerts({ lowStockItems = [], expiringItems = [] }) {
    const [activeTab, setActiveTab] = useState('low-stock');

    const hasLowStock = lowStockItems.length > 0;
    const hasExpiring = expiringItems.length > 0;

    if (!hasLowStock && !hasExpiring) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Inventory Healthy</h3>
                <p className="text-muted-foreground mt-1">No low stock or expiring items found.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-border/50 pb-2">
                <button
                    onClick={() => setActiveTab('low-stock')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'low-stock'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <AlertTriangle size={16} />
                    Low Stock ({lowStockItems.length})
                </button>
                <button
                    onClick={() => setActiveTab('expiring')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'expiring'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Clock size={16} />
                    Expiring ({expiringItems.length})
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'low-stock' ? (
                        <motion.div
                            key="low-stock"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {lowStockItems.length === 0 ? (
                                <EmptyState message="No low stock items" />
                            ) : (
                                lowStockItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-yellow-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500/10 rounded-md text-yellow-600">
                                                <Package size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Min: {item.minimum_stock_level} {item.unit}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-yellow-600">{item.quantity}</span>
                                            <p className="text-xs text-muted-foreground">{item.unit}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="expiring"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            {expiringItems.length === 0 ? (
                                <EmptyState message="No expiring items" />
                            ) : (
                                expiringItems.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-rose-500/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-rose-500/10 rounded-md text-rose-600">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">Expires: {new Date(item.expiration_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm font-bold text-rose-600">{item.quantity}</span>
                                            <p className="text-xs text-muted-foreground">{item.unit}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">{message}</p>
        </div>
    );
}
