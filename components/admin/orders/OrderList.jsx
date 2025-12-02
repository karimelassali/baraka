import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Trash2, Copy, Edit, ExternalLink, Filter, Loader2 } from 'lucide-react';
import { useRouter } from '@/navigation';
import { getOrders, deleteOrder, duplicateOrder, createOrderDraft } from '@/lib/actions/orders';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function OrderList() {
    const t = useTranslations('Orders');
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'draft', 'completed'
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getOrders();
            setOrders(data || []);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewOrder = async () => {
        try {
            const newOrder = await createOrderDraft();
            router.push(`/admin/order-management/${newOrder.id}`);
        } catch (error) {
            console.error('Failed to create new order', error);
            alert(t('create_error'));
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (confirm(t('delete_confirm'))) {
            try {
                await deleteOrder(id);
                fetchOrders();
            } catch (error) {
                console.error('Failed to delete order', error);
                alert(t('delete_error'));
            }
        }
    };

    const handleDuplicate = async (e, id) => {
        e.stopPropagation();
        try {
            const newOrder = await duplicateOrder(id);
            router.push(`/admin/order-management/${newOrder.id}`);
        } catch (error) {
            console.error('Failed to duplicate order', error);
            alert(t('duplicate_error'));
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            (order.order_number && order.order_number.toString().includes(searchTerm)) ||
            (order.suppliers?.name && order.suppliers.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.internal_note && order.internal_note.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const visibleOrders = filteredOrders.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <Button
                    onClick={handleNewOrder}
                    className="bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20 transition-all hover:scale-105"
                >
                    <Plus size={18} className="mr-2" />
                    {t('new_order')}
                </Button>
            </div>

            <GlassCard className="p-0 overflow-hidden border-0 shadow-xl bg-white/50 backdrop-blur-xl">
                <div className="p-6 border-b border-gray-100 bg-white/50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                        />
                    </div>
                    <div className="flex gap-2 bg-gray-100/50 p-1 rounded-lg border border-gray-200/50">
                        {['all', 'draft', 'completed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${statusFilter === status
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {t(`status_${status}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-400" />
                        {t('loading')}
                    </div>
                ) : (
                    <>
                        <div className="relative w-full overflow-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="font-semibold">{t('table_order_number')}</TableHead>
                                        <TableHead className="font-semibold">{t('table_date')}</TableHead>
                                        <TableHead className="font-semibold">{t('table_supplier')}</TableHead>
                                        <TableHead className="font-semibold">{t('table_note')}</TableHead>
                                        <TableHead className="font-semibold">{t('table_status')}</TableHead>
                                        <TableHead className="text-right font-semibold">{t('table_actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleOrders.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                                {t('no_orders')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        visibleOrders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                onClick={() => router.push(`/admin/order-management/${order.id}`)}
                                                className="cursor-pointer hover:bg-gray-50/80 transition-colors group"
                                            >
                                                <TableCell className="font-medium">
                                                    <span className="font-mono text-gray-500">#</span>{order.order_number}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(order.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    {order.suppliers ? (
                                                        <div className="font-medium text-gray-900">{order.suppliers.name}</div>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">{t('no_supplier')}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                    {order.internal_note || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className={
                                                        order.status === 'completed'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200'
                                                    }>
                                                        {t(`status_${order.status}`)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={(e) => handleDuplicate(e, order.id)}
                                                            className="h-10 w-10 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                            title="Duplicate"
                                                        >
                                                            <Copy size={18} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={(e) => handleDelete(e, order.id)}
                                                            className="h-10 w-10 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={(e) => { e.stopPropagation(); router.push(`/admin/order-management/${order.id}`); }}
                                                            className="h-10 w-10 p-0 text-gray-500 hover:text-black hover:bg-gray-100"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        {visibleCount < filteredOrders.length && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-center">
                                <Button variant="outline" onClick={handleLoadMore}>
                                    {t('load_more')}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </GlassCard>
        </div>
    );
}
