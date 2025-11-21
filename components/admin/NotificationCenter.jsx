// components/admin/NotificationCenter.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    X,
    Users,
    AlertTriangle,
    Package,
    MessageCircle,
    ChevronRight,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';
import { CardHeader, CardTitle, CardContent } from '../ui/card';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dismissedCategories, setDismissedCategories] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
        // Refresh every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/notifications');
            const data = await response.json();

            if (response.ok) {
                setNotifications(data);
                // Reset dismissed categories on fresh fetch if needed, 
                // or keep them dismissed until page reload. 
                // For now, we keep them dismissed to avoid annoyance.
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName) => {
        const icons = {
            Users,
            AlertTriangle,
            Package,
            MessageCircle
        };
        return icons[iconName] || Bell;
    };

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
            red: 'bg-red-500/10 text-red-600 border-red-500/30',
            orange: 'bg-orange-500/10 text-orange-600 border-orange-500/30',
            yellow: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
        };
        return colors[color] || 'bg-gray-500/10 text-gray-600 border-gray-500/30';
    };

    const handleNavigate = (category) => {
        const routes = {
            new_customers: '/admin/customers',
            expiring_products: '/admin/inventory',
            low_stock: '/admin/inventory',
            pending_reviews: '/admin/reviews'
        };

        if (routes[category]) {
            router.push(routes[category]);
            setIsOpen(false);
        }
    };

    const handleDismiss = (e, categoryKey) => {
        e.stopPropagation();
        setDismissedCategories(prev => [...prev, categoryKey]);
    };

    const notificationCategories = [
        { key: 'new_customers', label: 'Nuovi Clienti', description: 'Clienti registrati nelle ultime 24 ore' },
        { key: 'expiring_products', label: 'Prodotti in Scadenza', description: 'Prodotti che scadono entro 7 giorni' },
        { key: 'low_stock', label: 'Scorte Basse', description: 'Prodotti sotto la soglia minima' },
        { key: 'pending_reviews', label: 'Recensioni da Approvare', description: 'Recensioni in attesa di moderazione' }
    ];

    // Calculate total count excluding dismissed categories
    const activeNotifications = notificationCategories.filter(cat => {
        const data = notifications?.notifications[cat.key];
        return data && data.count > 0 && !dismissedCategories.includes(cat.key);
    });

    const totalCount = activeNotifications.reduce((acc, cat) => {
        return acc + (notifications?.notifications[cat.key]?.count || 0);
    }, 0);

    return (
        <>
            {/* Notification Bell Button */}
            <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-8 w-8" />
                {totalCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg"
                    >
                        {totalCount > 9 ? '9+' : totalCount}
                    </motion.span>
                )}
            </Button>

            {/* Notification Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, x: 300, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 300, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-20 right-4 z-50 w-full max-w-md"
                        >
                            <GlassCard className="shadow-2xl border-2 overflow-hidden flex flex-col max-h-[calc(100vh-120px)]">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/50 bg-gradient-to-r from-red-500/10 to-red-600/10 shrink-0">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-red-600" />
                                            Notifiche
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {totalCount} {totalCount === 1 ? 'notifica' : 'notifiche'} da leggere
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {dismissedCategories.length > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-8"
                                                onClick={() => setDismissedCategories([])}
                                            >
                                                Ripristina
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 overflow-y-auto flex-1">
                                    {loading && !notifications ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
                                        </div>
                                    ) : activeNotifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                            <Bell className="h-16 w-16 mb-4 opacity-20" />
                                            <p className="text-lg font-medium">Nessuna Notifica</p>
                                            <p className="text-sm">Sei aggiornato!</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {activeNotifications.map((category) => {
                                                const data = notifications?.notifications[category.key];
                                                const Icon = getIcon(data.icon);
                                                const colorClasses = getColorClasses(data.color);

                                                return (
                                                    <motion.div
                                                        key={category.key}
                                                        layout
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group relative"
                                                        onClick={() => handleNavigate(category.key)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-lg ${colorClasses} border shrink-0`}>
                                                                <Icon className="h-5 w-5" />
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-semibold truncate pr-8">{category.label}</h4>
                                                                    <Badge variant="outline" className={`${colorClasses} border ml-2 shrink-0`}>
                                                                        {data.count}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                                    {category.description}
                                                                </p>

                                                                {/* Preview items */}
                                                                {data.items.length > 0 && (
                                                                    <div className="space-y-1.5 bg-muted/30 p-2 rounded-md mb-2">
                                                                        {data.items.slice(0, 2).map((item, index) => (
                                                                            <div key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                                                                                <div className={`h-1.5 w-1.5 rounded-full ${data.color === 'red' ? 'bg-red-500' : 'bg-primary'} shrink-0`} />
                                                                                <span className="truncate">
                                                                                    {item.name || item.first_name ? `${item.first_name} ${item.last_name}` : (item.customer_name || 'Item')}
                                                                                    {item.expiration_date && ` - ${new Date(item.expiration_date).toLocaleDateString('it-IT')}`}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                        {data.items.length > 2 && (
                                                                            <p className="text-xs text-muted-foreground pl-3.5">
                                                                                + altri {data.items.length - 2}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center gap-1 text-xs text-red-600 mt-2 font-medium group-hover:translate-x-1 transition-transform">
                                                                    Visualizza dettagli
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </div>
                                                            </div>

                                                            {/* Dismiss Button */}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                                onClick={(e) => handleDismiss(e, category.key)}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>

                                <div className="p-4 border-t border-border/50 bg-muted/30 shrink-0">
                                    <Button
                                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20"
                                        onClick={() => {
                                            setLoading(true);
                                            fetchNotifications();
                                        }}
                                        disabled={loading}
                                    >
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        {loading ? 'Aggiornamento...' : 'Aggiorna Notifiche'}
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
