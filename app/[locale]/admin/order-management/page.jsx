'use client';

import React, { useState } from 'react';
import OrderList from '@/components/admin/orders/OrderList';
import SupplierManager from '@/components/admin/orders/SupplierManager';

export default function OrdersPage() {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'suppliers'

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'orders' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Order Management
                    {activeTab === 'orders' && (
                        <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-black rounded-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-4 py-2 font-medium text-sm transition-colors relative ${activeTab === 'suppliers' ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Suppliers
                    {activeTab === 'suppliers' && (
                        <div className="absolute bottom-[-5px] left-0 w-full h-0.5 bg-black rounded-full"></div>
                    )}
                </button>
            </div>

            {activeTab === 'orders' ? <OrderList /> : <SupplierManager />}
        </div>
    );
}
