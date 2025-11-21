// components/admin/ExpirationAlerts.jsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    ArrowRight
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { getInventoryTranslation as t } from '../../lib/constants/inventory-translations';

export default function ExpirationAlerts({ data, onRefresh }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    const stats = {
        expired: data.expired?.length || 0,
        today: data.expiring_today?.length || 0,
        tomorrow: data.expiring_tomorrow?.length || 0,
        soon: data.expiring_soon?.length || 0
    };

    const totalIssues = stats.expired + stats.today + stats.tomorrow + stats.soon;

    if (totalIssues === 0) return null;

    const getSeverityColor = (type) => {
        switch (type) {
            case 'expired': return 'text-red-600 bg-red-500/10 border-red-500/20';
            case 'today': return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
            case 'tomorrow': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
            case 'soon': return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
            default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20';
        }
    };

    const categories = [
        { id: 'expired', label: t('expired'), count: stats.expired, icon: AlertTriangle, color: 'red' },
        { id: 'today', label: t('expiringToday'), count: stats.today, icon: AlertCircle, color: 'orange' },
        { id: 'tomorrow', label: t('expiringTomorrow'), count: stats.tomorrow, icon: Clock, color: 'yellow' },
        { id: 'soon', label: t('expiringSoon'), count: stats.soon, icon: Clock, color: 'blue' }
    ].filter(c => c.count > 0);

    // Combine all products for the list view
    const allProducts = [
        ...(data.expired || []).map(p => ({ ...p, status: 'expired' })),
        ...(data.expiring_today || []).map(p => ({ ...p, status: 'today' })),
        ...(data.expiring_tomorrow || []).map(p => ({ ...p, status: 'tomorrow' })),
        ...(data.expiring_soon || []).map(p => ({ ...p, status: 'soon' }))
    ];

    const filteredProducts = activeTab === 'all'
        ? allProducts
        : allProducts.filter(p => p.status === activeTab);

    return (
        <GlassCard className="border-l-4 border-l-red-500 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500/10 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                {t('attentionRequired')}
                                <Badge variant="destructive" className="rounded-full text-white px-2 bg-red-600 hover:bg-red-700">
                                    {totalIssues}
                                </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t('productsExpiringOverview')}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-2"
                    >
                        {isExpanded ? t('collapse') : t('viewDetails')}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Summary Badges Row */}
                {!isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-4 pl-0 md:pl-[52px]">
                        {categories.map(cat => (
                            <Badge
                                key={cat.id}
                                variant="outline"
                                className={`${getSeverityColor(cat.id)} px-3 py-1 h-auto gap-2 cursor-pointer hover:bg-opacity-20 transition-colors`}
                                onClick={() => {
                                    setActiveTab(cat.id);
                                    setIsExpanded(true);
                                }}
                            >
                                <cat.icon className="h-3.5 w-3.5" />
                                {cat.label}: {cat.count}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/50"
                    >
                        <div className="p-4 bg-muted/30">
                            {/* Tabs */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                <Button
                                    variant={activeTab === 'all' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab('all')}
                                    className={activeTab === 'all' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
                                >
                                    {t('all')} ({totalIssues})
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={activeTab === cat.id ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setActiveTab(cat.id)}
                                        className={activeTab === cat.id ? `bg-${cat.color}-600 hover:bg-${cat.color}-700 text-white border-none` : ''}
                                    >
                                        {cat.label} ({cat.count})
                                    </Button>
                                ))}
                            </div>

                            {/* Product List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {filteredProducts.map((product, idx) => (
                                    <motion.div
                                        key={`${product.id}-${idx}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50 hover:border-red-500/30 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${product.status === 'expired' ? 'bg-red-500' :
                                                product.status === 'today' ? 'bg-orange-500' :
                                                    product.status === 'tomorrow' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`} />
                                            <div>
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.category?.name} • {product.quantity} {product.unit}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`text-xs font-medium px-2 py-1 rounded-md ${getSeverityColor(product.status)}`}>
                                                {new Date(product.expiration_date).toLocaleDateString('it-IT')}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
