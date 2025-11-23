"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    User,
    Calendar,
    Clock,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    Activity,
    Shield
} from 'lucide-react';

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all'); // 'all', 'customers', 'offers', etc.

    const limit = 20;

    useEffect(() => {
        fetchLogs();
    }, [page, filter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/logs?limit=${limit}&offset=${(page - 1) * limit}`;
            if (filter !== 'all') {
                url += `&resource=${filter}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.error) {
                if (data.error.includes('table not found')) {
                    setError('Logs system not initialized yet.');
                } else {
                    setError(data.error);
                }
            } else {
                setLogs(data.logs || []);
                setError(null);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-green-100 text-green-800';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-100 text-blue-800';
        if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-600" />
                        System Activity Logs
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Track all administrative actions</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none appearance-none bg-white"
                            value={filter}
                            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Resources</option>
                            <option value="customers">Customers</option>
                            <option value="offers">Offers</option>
                            <option value="vouchers">Vouchers</option>
                            <option value="admins">Admins</option>
                            <option value="campaigns">Campaigns</option>
                        </select>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50">
                    <Shield className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p>{error}</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No logs found for this period.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xs">
                                                    {log.admin?.full_name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{log.admin?.full_name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{log.admin?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                                            {log.resource}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                                {log.details ? (
                                                    log.details.message || JSON.stringify(log.details)
                                                ) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(log.created_at)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-600">Page {page}</span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={logs.length < limit || loading}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
    );
}
