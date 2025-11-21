// app/admin/inventory/page.jsx
"use client";

import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import InventoryManagement from '../../../components/admin/InventoryManagement';
import { getInventoryTranslation as t } from '../../../lib/constants/inventory-translations';

export default function AdminInventoryPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                        <Package className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
                        {t('inventoryManagement')}
                    </h1>
                </div>
                <p className="text-muted-foreground">{t('inventoryDescription')}</p>
            </div>

            <InventoryManagement />
        </motion.div>
    );
}
