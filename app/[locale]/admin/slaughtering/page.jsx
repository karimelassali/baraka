'use client';

import { motion } from 'framer-motion';
import { Beef } from 'lucide-react';
import SlaughteringManager from '@/components/admin/slaughtering/SlaughteringManager';
import { useTranslations } from 'next-intl';

export default function AdminSlaughteringPage() {
    const t = useTranslations('Admin.Slaughtering');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-rose-700 rounded-xl shadow-lg">
                        <Beef className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-700">
                        {t('title')}
                    </h1>
                </div>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <SlaughteringManager />
        </motion.div>
    );
}
