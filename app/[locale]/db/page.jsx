"use client";

import { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, Database, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const TABLES = [
    'admin_logs',
    'admin_notes',
    'admin_users',
    'agent_knowledge',
    'customers',
    'daily_revenue',
    'eid_cattle_groups',
    'eid_cattle_members',
    'eid_deposits',
    'eid_destinations',
    'eid_purchase_batches',
    'eid_purchases',
    'eid_reservations',
    'eid_suppliers',
    'gallery',
    'gdpr_logs',
    'inventory_products',
    'loyalty_points',
    'offer_categories',
    'offers',
    'order_items',
    'orders',
    'payments',
    'product_categories',
    'qr_codes',
    'qr_scans',
    'reviews',
    'settings',
    'suppliers',
    'system_settings',
    'vouchers',
    'waitlist',
    'whatsapp_messages',
    'wishlists'
];

export default function DbDashboard() {
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null); // 'backup-tableName' or 'clear-tableName'

    useEffect(() => {
        // Check environment on mount (double check for client side)
        if (process.env.NODE_ENV !== 'development') {
            window.location.href = '/';
            return;
        }
        fetchAllStats();
    }, []);

    const fetchAllStats = async () => {
        setLoading(true);
        const newStats = {};

        // Fetch sequentially to avoid hammering the DB too hard at once, or parallel?
        // Parallel is fine for dev.
        await Promise.all(TABLES.map(async (table) => {
            try {
                const res = await fetch(`/api/dev/db/stats?table=${table}`);
                const data = await res.json();
                newStats[table] = data;
            } catch (err) {
                newStats[table] = { status: 'error', error: 'Failed to fetch' };
            }
        }));

        setStats(newStats);
        setLoading(false);
    };

    const handleBackup = (table) => {
        setProcessing(`backup-${table}`);
        // Trigger download
        window.location.href = `/api/dev/db/backup?table=${table}`;
        setTimeout(() => setProcessing(null), 1000); // Reset spinner after a bit
    };

    const handleClear = async (table) => {
        if (!confirm(`ARE YOU SURE? This will DELETE ALL DATA from '${table}'. This cannot be undone.`)) {
            return;
        }

        setProcessing(`clear-${table}`);
        try {
            const res = await fetch('/api/dev/db/clear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`Table ${table} cleared successfully.`);
                // Refresh stats for this table
                const statRes = await fetch(`/api/dev/db/stats?table=${table}`);
                const statData = await statRes.json();
                setStats(prev => ({ ...prev, [table]: statData }));
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setProcessing(null);
        }
    };

    if (process.env.NODE_ENV !== 'development') {
        return null; // Or a 404 component
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <Database className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Dev Database Dashboard</h1>
                            <p className="text-gray-500">Manage your local database tables</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchAllStats}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Stats
                    </button>
                </div>

                <div className="grid gap-6">
                    {TABLES.map((table) => {
                        const stat = stats[table] || { status: 'loading' };
                        const isHealthy = stat.status === 'healthy';
                        const rowCount = stat.count !== undefined ? stat.count : '-';
                        const speed = stat.timeMs !== undefined ? `${stat.timeMs}ms` : '-';

                        return (
                            <div key={table} className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isHealthy ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Database className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 font-mono">{table}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className={`flex items-center gap-1.5 text-sm font-medium ${isHealthy ? 'text-green-600' : 'text-amber-600'}`}>
                                                {isHealthy ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                                                {isHealthy ? 'Healthy' : 'Unknown'}
                                            </span>
                                            <span className="text-gray-300">|</span>
                                            <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Activity className="w-3.5 h-3.5" />
                                                {speed}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900">{rowCount}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rows</div>
                                    </div>

                                    <div className="flex items-center gap-2 pl-8 border-l border-gray-100">
                                        <button
                                            onClick={() => handleBackup(table)}
                                            disabled={!!processing}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            title="Download JSON Backup"
                                        >
                                            {processing === `backup-${table}` ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                            Backup
                                        </button>

                                        <button
                                            onClick={() => handleClear(table)}
                                            disabled={!!processing}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors disabled:opacity-50"
                                            title="Clear All Data"
                                        >
                                            {processing === `clear-${table}` ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
