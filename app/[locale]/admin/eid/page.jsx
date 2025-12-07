"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Users, ShoppingCart, Truck, BarChart2 } from 'lucide-react';
import Reservations from '@/components/admin/eid/Reservations';
import CattleGroups from '@/components/admin/eid/CattleGroups';
import Purchases from '@/components/admin/eid/Purchases';
import Delivery from '@/components/admin/eid/Delivery';
import Reports from '@/components/admin/eid/Reports';
import GlassCard from '@/components/ui/GlassCard';

export default function EidDashboard() {
    const [activeTab, setActiveTab] = useState('reservations');

    const tabs = [
        { id: 'reservations', label: 'Reservations', icon: ClipboardList },
        { id: 'cattle', label: 'Cattle Groups', icon: Users },
        { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'reports', label: 'Reports', icon: BarChart2 },
    ];

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-900">
                        Eid al Adha Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage reservations, cattle groups, purchases, and deliveries.
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto p-1 bg-muted/50 backdrop-blur-sm rounded-xl">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-background data-[state=active]:text-red-600 data-[state=active]:shadow-sm rounded-lg transition-all"
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabsContent value="reservations" className="m-0">
                            <Reservations />
                        </TabsContent>
                        <TabsContent value="cattle" className="m-0">
                            <CattleGroups />
                        </TabsContent>
                        <TabsContent value="purchases" className="m-0">
                            <Purchases />
                        </TabsContent>
                        <TabsContent value="delivery" className="m-0">
                            <Delivery />
                        </TabsContent>
                        <TabsContent value="reports" className="m-0">
                            <Reports />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
