"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Shield,
    MessageCircle,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';

export default function UnifiedLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all'); // 'all', 'system', 'messaging'
    const [searchTerm, setSearchTerm] = useState('');

    const limit = 20;

    useEffect(() => {
        fetchLogs();
    }, [page, filter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/logs?limit=${limit}&offset=${(page - 1) * limit}`;
            if (filter !== 'all') {
                url += `&filter=${filter}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.error) {
                setError(data.error);
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

    const getSourceIcon = (source) => {
        if (source === 'SYSTEM') return <Activity className="w-4 h-4 text-blue-600" />;
        if (source === 'MESSAGING') return <MessageCircle className="w-4 h-4 text-green-600" />;
        return <Info className="w-4 h-4 text-gray-600" />;
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === 'success' || s === 'delivered' || s === 'read' || s === 'sent') {
            return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> {status}</span>;
        }
        if (s === 'failed' || s === 'error') {
            return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> {status}</span>;
        }
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit">{status}</span>;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('it-IT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActionColor = (type) => {
        const t = type?.toUpperCase() || '';
        if (t.includes('CREATE') || t.includes('ADD')) return 'bg-green-50 text-green-700 border-green-100';
        if (t.includes('UPDATE') || t.includes('EDIT') || t.includes('ADJUST')) return 'bg-blue-50 text-blue-700 border-blue-100';
        if (t.includes('DELETE') || t.includes('REMOVE') || t.includes('DEACTIVATE')) return 'bg-red-50 text-red-700 border-red-100';
        if (t.includes('SEND') || t.includes('MESSAGE')) return 'bg-purple-50 text-purple-700 border-purple-100';
        return 'bg-gray-50 text-gray-700 border-gray-100';
    };

    const formatDetails = (log) => {
        if (log.source === 'MESSAGING') {
            return (
                <div className="flex flex-col gap-1">
                    <span className="font-medium text-gray-900">To: {log.details.phone || 'Unknown'}</span>
                    <span className="text-gray-600 italic">"{log.details.message}"</span>
                </div>
            );
        }

        const d = log.details || {};

        // Helper to render key-value pairs nicely
        const renderField = (label, value) => {
            if (!value) return null;
            return (
                <span className="mr-3 inline-block">
                    <span className="text-gray-500 text-xs uppercase font-semibold mr-1">{label}:</span>
                    <span className="text-gray-800">{value}</span>
                </span>
            );
        };

        // Custom formatting based on action type
        if (log.type.includes('CREATE_CUSTOMER')) {
            return (
                <div>
                    {renderField('Name', `${d.firstName} ${d.lastName}`)}
                    {renderField('Email', d.email)}
                    {renderField('Phone', d.phoneNumber)}
                </div>
            );
        }

        if (log.type.includes('CREATE_PRODUCT') || log.type.includes('UPDATE_PRODUCT')) {
            return (
                <div>
                    {renderField('Product', d.name)}
                    {renderField('Qty', d.quantity)}
                    {renderField('Expiry', d.expiration_date)}
                </div>
            );
        }

        if (log.type.includes('DELETE_PRODUCT')) {
            return (
                <div>
                    {renderField('Product', d.name || 'Unknown Product')}
                    {renderField('ID', d.id)}
                </div>
            );
        }

        if (log.type.includes('CREATE_OFFER') || log.type.includes('UPDATE_OFFER')) {
            return (
                <div>
                    {renderField('Title', d.title)}
                    {renderField('Type', d.type)}
                </div>
            );
        }

        if (log.type.includes('DELETE_OFFER')) {
            return (
                <div>
                    {renderField('Offer', d.title || 'Unknown Offer')}
                </div>
            );
        }

        if (log.type.includes('VOUCHER')) {
            return (
                <div>
                    {renderField('Code', d.code)}
                    {renderField('Customer', d.customerName)}
                    {renderField('Points', d.points)}
                    {renderField('Value', d.value ? `€${d.value}` : null)}
                </div>
            );
        }

        if (log.type.includes('POINTS')) {
            return (
                <div>
                    {renderField('Customer', d.customerName)}
                    {renderField('Points', d.points > 0 ? `+${d.points}` : d.points)}
                    {renderField('Reason', d.description)}
                </div>
            );
        }

        if (log.type.includes('PAYMENT')) {
            return (
                <div>
                    {renderField('Recipient', d.recipient)}
                    {renderField('Amount', d.amount ? `€${d.amount}` : null)}
                    {renderField('Status', d.status)}
                    {renderField('Type', d.payment_type)}
                </div>
            );
        }

        if (log.type.includes('EID')) {
            return (
                <div>
                    {renderField('Customer', d.customerName)}
                    {renderField('Animal', d.animal_type)}
                    {renderField('Weight', d.requested_weight ? `${d.requested_weight}kg` : null)}
                    {renderField('Deposit', d.amount ? `€${d.amount}` : (d.deposit_amount ? `€${d.deposit_amount}` : null))}
                </div>
            );
        }

        // Fallback for generic details
        return (
            <div className="text-xs text-gray-600 break-words">
                {Object.entries(d).map(([key, value]) => (
                    <span key={key} className="mr-2">
                        <span className="font-semibold">{key}:</span> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                ))}
            </div>
        );
    };

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.type?.toLowerCase().includes(term) ||
            log.actor?.toLowerCase().includes(term) ||
            JSON.stringify(log.details).toLowerCase().includes(term)
        );
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header & Filters */}
            <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-teal-600" />
                        Unified Activity Logs
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Monitor system actions and messaging history</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none appearance-none bg-white cursor-pointer"
                            value={filter}
                            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all">All Sources</option>
                            <option value="system">System Activity</option>
                            <option value="messaging">Messaging</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table Content */}
            {error ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Error Loading Logs</h3>
                    <p className="text-gray-500 max-w-md mx-auto">{error}</p>
                    {error.includes('table missing') && (
                        <p className="text-sm text-blue-600 mt-4 bg-blue-50 p-3 rounded border border-blue-100 inline-block">
                            Tip: Run the setup_admin_logs workflow to create the necessary database table.
                        </p>
                    )}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-16">Source</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Actor / User</th>
                                <th className="px-6 py-4">Action / Type</th>
                                <th className="px-6 py-4 w-1/3">Details</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-200 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                                    </tr>
                                ))
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-lg font-medium">No logs found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm" title={log.source}>
                                                {getSourceIcon(log.source)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                {formatDate(log.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{log.actor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide border ${getActionColor(log.type)}`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {formatDetails(log)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(log.status)}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-600"
                >
                    <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                    Page {page}
                </span>
                <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={logs.length < limit || loading}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium text-gray-600"
                >
                    Next <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
