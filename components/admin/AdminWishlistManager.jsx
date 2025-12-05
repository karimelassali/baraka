'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Search,
    CheckCircle,
    XCircle,
    Trash2,
    Loader2,
    Heart,
    User,
    Calendar,
    Filter,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format } from 'date-fns';
import { it, enUS, ar } from 'date-fns/locale';
import { countries } from '@/lib/constants/countries';

export default function AdminWishlistManager({ locale }) {
    const t = useTranslations();
    const supabase = createClientComponentClient();
    const [wishlists, setWishlists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [countryFilter, setCountryFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchWishlists = async (pageNumber = 1, shouldAppend = false) => {
        try {
            setIsLoading(true);
            const queryParams = new URLSearchParams({
                page: pageNumber,
                limit: 10,
                search,
                status: statusFilter,
                country: countryFilter
            });

            const response = await fetch(`/api/admin/wishlist?${queryParams}`);
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            if (shouldAppend) {
                setWishlists(prev => [...prev, ...data.data]);
            } else {
                setWishlists(data.data);
            }

            setHasMore(data.data.length === 10);
        } catch (error) {
            console.error('Error fetching wishlists:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlists(1, false);
        setPage(1);
    }, [search, statusFilter, countryFilter]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchWishlists(nextPage, true);
    };

    const updateStatus = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            const response = await fetch(`/api/admin/wishlist/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            setWishlists(prev => prev.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteWishlist = async (id) => {
        if (!confirm(t('Admin.Board.confirm_delete'))) return;

        try {
            setUpdatingId(id);
            const response = await fetch(`/api/admin/wishlist/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete item');

            setWishlists(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getDateLocale = () => {
        switch (locale) {
            case 'it': return it;
            case 'ar': return ar;
            default: return enUS;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('Admin.Vouchers.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                        {['all', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === status
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {status === 'all' ? t('Admin.Vouchers.filters.all_countries') : t(`Wishlist.Status.${status}`)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Country Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="all">{t('Admin.Vouchers.filters.all_countries')}</option>
                        {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                                {country.flag} {country.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {wishlists.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-6 rounded-xl shadow-sm border transition-all ${item.status === 'approved'
                                    ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                                <Heart className={`w-5 h-5 ${item.status === 'approved' ? 'text-green-500' : 'text-red-500'}`} />
                                                {item.product_name}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                                                {item.description || t('Wishlist.NoDescription')}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {t(`Wishlist.Status.${item.status}`)}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-4 h-4" />
                                            {item.customers?.first_name} {item.customers?.last_name}
                                            {item.customers?.country_of_origin && (
                                                <span className="ml-1 text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                                    {item.customers.country_of_origin}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            {format(new Date(item.created_at), 'PPP', { locale: getDateLocale() })}
                                        </div>
                                        {item.customers?.phone_number && (
                                            <a
                                                href={`tel:${item.customers.phone_number}`}
                                                className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {item.customers.phone_number}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 md:border-l md:pl-4 md:border-gray-100 dark:md:border-gray-700">
                                    {item.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(item.id, 'approved')}
                                                disabled={updatingId === item.id}
                                                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 transition-colors"
                                                title={t('Wishlist.Approve')}
                                            >
                                                {updatingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => updateStatus(item.id, 'rejected')}
                                                disabled={updatingId === item.id}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                                                title={t('Wishlist.Reject')}
                                            >
                                                {updatingId === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => deleteWishlist(item.id)}
                                        disabled={updatingId === item.id}
                                        className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 transition-colors"
                                        title={t('Admin.modal.delete')}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {wishlists.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <Heart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>{t('Admin.Board.no_notes')}</p>
                    </div>
                )}

                {hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('Admin.Board.loading_more')}
                            </>
                        ) : (
                            t('Admin.Board.load_more')
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
