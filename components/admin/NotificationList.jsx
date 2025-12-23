"use client";

import { useState, useEffect } from 'react';
import {
    Check,
    Trash2,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ExternalLink,
    RefreshCw,
    Bell
} from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { it, enUS, ar } from 'date-fns/locale';

import { createClient } from '@/lib/supabaseClient';

export default function NotificationList({ isCompact = false, isMobile = false, onUnreadCountChange, onItemClick }) {
    const t = useTranslations('Admin.Notifications');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    // Locale for date formatting
    const localeMap = {
        it: it,
        en: enUS,
        ar: ar
    };
    // Default to Italian or get from context if available
    const currentLocale = localeMap['it'];

    const fetchNotifications = async (pageNum = 1, refresh = false) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/notifications?page=${pageNum}&limit=10`);
            const data = await response.json();

            if (response.ok) {
                if (refresh || pageNum === 1) {
                    setNotifications(data.notifications);
                } else {
                    setNotifications(prev => [...prev, ...data.notifications]);
                }

                if (onUnreadCountChange) {
                    onUnreadCountChange(data.unread);
                }
                setHasMore(data.page < data.totalPages);
                setPage(data.page);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1, true);

        const channel = supabase
            .channel('notifications_list')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async (id) => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', id })
            });

            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));

            // We can't easily update parent count without refetching or tracking local state perfectly
            // But we can decrement if we knew it was unread.
            // For simplicity, we might just let the next poll update it, or pass a decrement callback.
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/admin/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_all_read' })
            });

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            if (onUnreadCountChange) onUnreadCountChange(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await fetch(`/api/admin/notifications?id=${id}`, {
                method: 'DELETE'
            });

            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const clearAll = async () => {
        try {
            await fetch('/api/admin/notifications', { method: 'DELETE' });
            fetchNotifications(1, true);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success': return 'bg-green-500/10 border-green-500/20';
            case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
            case 'error': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header Actions */}
            {/* Header Actions */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isCompact ? 'p-4 bg-muted/30 border-b border-border/50' : 'mb-4'} ${isMobile ? 'pr-12' : ''}`}>
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    {isCompact && <h3 className="font-semibold text-sm">{t('title')}</h3>}
                    {!isCompact && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            <Check className="h-3.5 w-3.5 mr-2" />
                            {t('mark_all_read')}
                        </Button>
                    )}
                    {/* Mobile only clear all for compact mode */}
                    {isCompact && (
                        <div className="flex sm:hidden items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={clearAll}
                                title={t('clear_all')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => fetchNotifications(1, true)}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    {isCompact && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden sm:inline-flex h-8 w-8 text-destructive hover:text-destructive"
                            onClick={clearAll}
                            title={t('clear_all')}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    {!isCompact && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearAll}
                            className="text-xs"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            {t('clear_all')}
                        </Button>
                    )}
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1 min-h-[300px]">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground">
                        <div className="w-32 h-32 mb-4 relative opacity-80">
                            <img
                                src="/illus/undraw_my-notifications_fy5v.svg"
                                alt="No notifications"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <p className="font-medium text-sm">{t('empty_title')}</p>
                        <p className="text-xs mt-1 max-w-[200px]">{t('empty_desc')}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-muted/50 transition-colors relative group ${!notification.is_read ? 'bg-primary/5' : ''} rounded-lg mx-2 my-1`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-0.5 p-2 rounded-full h-fit shrink-0 ${getBgColor(notification.type)}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-medium leading-none ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: currentLocale })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        <div className="flex items-center gap-2 mt-2 pt-1">
                                            {notification.link && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-[10px] px-2 gap-1"
                                                    onClick={() => {
                                                        router.push(notification.link);
                                                        if (!notification.is_read) markAsRead(notification.id);
                                                        if (onItemClick) onItemClick();
                                                    }}
                                                >
                                                    {t('view_details')}
                                                    <ExternalLink className="h-3 w-3" />
                                                </Button>
                                            )}
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 text-[10px] px-2 text-primary hover:text-primary/80"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    {t('mark_read')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur rounded-md shadow-sm border border-border/50">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <div className="p-2 text-center">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs w-full"
                                    onClick={() => fetchNotifications(page + 1)}
                                    disabled={loading}
                                >
                                    {loading ? t('loading') : t('load_more')}
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
