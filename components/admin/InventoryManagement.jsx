// components/admin/InventoryManagement.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    FolderTree,
    Plus,
    Search,
    Filter,
    AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import GlassCard from '../ui/GlassCard';
import { CardHeader, CardTitle, CardContent } from '../ui/card';
import { useTranslations } from 'next-intl';
import CategoryManager from './CategoryManager';
import ProductManager from './ProductManager';
import ExpirationAlerts from './ExpirationAlerts';

export default function InventoryManagement() {
    const t = useTranslations('Admin.Inventory');
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'categories'
    const [expiringData, setExpiringData] = useState(null);
    const [loadingExpiring, setLoadingExpiring] = useState(true);

    // Load expiring products on mount
    useEffect(() => {
        fetchExpiringProducts();
    }, []);

    const fetchExpiringProducts = async () => {
        try {
            setLoadingExpiring(true);
            const response = await fetch('/api/admin/inventory/expiring');
            const data = await response.json();

            if (response.ok) {
                setExpiringData(data);
            } else {
                console.error('Failed to fetch expiring products:', data.error);
            }
        } catch (error) {
            console.error('Error fetching expiring products:', error);
        } finally {
            setLoadingExpiring(false);
        }
    };

    const tabs = [
        {
            id: 'products',
            label: t('products'),
            icon: Package,
            color: 'text-red-500'
        },
        {
            id: 'categories',
            label: t('categories'),
            icon: FolderTree,
            color: 'text-red-600'
        }
    ];

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Expiration Alerts */}
            {!loadingExpiring && expiringData && expiringData.total_alerts > 0 && (
                <ExpirationAlerts
                    data={expiringData}
                    onRefresh={fetchExpiringProducts}
                />
            )}

            {/* Tabs Navigation */}
            <GlassCard>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${isActive
                                            ? 'text-white shadow-lg'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }
                  `}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabBg"
                                            className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                    <Icon className={`h-5 w-5 relative z-10 ${isActive ? 'text-white' : tab.color}`} />
                                    <span className="relative z-10">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </CardContent>
            </GlassCard>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'products' && (
                    <motion.div
                        key="products"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProductManager onProductChange={fetchExpiringProducts} />
                    </motion.div>
                )}

                {activeTab === 'categories' && (
                    <motion.div
                        key="categories"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CategoryManager />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
