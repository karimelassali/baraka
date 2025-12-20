import {
    LayoutDashboard,
    Users,
    Package,
    Gift,
    MessageCircle,
    CheckCircle,
    Ticket,
    Megaphone,
    FileText,
    Settings,
    Image as ImageIcon,
    Shield,
    BarChart2,
    ShoppingCart,
    StickyNote,
    CreditCard,

    Heart,
    ClipboardList,
    QrCode
} from 'lucide-react';

export const COLOR_THEMES = {
    purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-50', light: 'bg-purple-50', text: 'text-purple-700', shadow: 'shadow-purple-100' },
    blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-50', light: 'bg-blue-50', text: 'text-blue-700', shadow: 'shadow-blue-100' },
    orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-50', light: 'bg-orange-50', text: 'text-orange-700', shadow: 'shadow-orange-100' },
    green: { bg: 'bg-green-500', hover: 'hover:bg-green-50', light: 'bg-green-50', text: 'text-green-700', shadow: 'shadow-green-100' },
    indigo: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-50', light: 'bg-indigo-50', text: 'text-indigo-700', shadow: 'shadow-indigo-100' },
    pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-50', light: 'bg-pink-50', text: 'text-pink-700', shadow: 'shadow-pink-100' },
    cyan: { bg: 'bg-cyan-500', hover: 'hover:bg-cyan-50', light: 'bg-cyan-50', text: 'text-cyan-700', shadow: 'shadow-cyan-100' },
    gray: { bg: 'bg-gray-500', hover: 'hover:bg-gray-50', light: 'bg-gray-50', text: 'text-gray-700', shadow: 'shadow-gray-100' },
    yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-50', light: 'bg-yellow-50', text: 'text-yellow-700', shadow: 'shadow-yellow-100' },
    emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-50', light: 'bg-emerald-50', text: 'text-emerald-700', shadow: 'shadow-emerald-100' },
    teal: { bg: 'bg-teal-500', hover: 'hover:bg-teal-50', light: 'bg-teal-50', text: 'text-teal-700', shadow: 'shadow-teal-100' },
    lime: { bg: 'bg-lime-500', hover: 'hover:bg-lime-50', light: 'bg-lime-50', text: 'text-lime-700', shadow: 'shadow-lime-100' },
    rose: { bg: 'bg-rose-500', hover: 'hover:bg-rose-50', light: 'bg-rose-50', text: 'text-rose-700', shadow: 'shadow-rose-100' },
    amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-50', light: 'bg-amber-50', text: 'text-amber-700', shadow: 'shadow-amber-100' },
    red: { bg: 'bg-red-500', hover: 'hover:bg-red-50', light: 'bg-red-50', text: 'text-red-700', shadow: 'shadow-red-100' },
};

export const DEFAULT_NAV_CATEGORIES = [
    {
        id: 'overview',
        titleKey: 'cat_overview',
        items: [
            { id: 'dashboard', nameKey: 'dashboard', path: '/admin', icon: LayoutDashboard, permission: 'view_dashboard', color: 'indigo' },
            { id: 'analytics', nameKey: 'analytics', path: '/admin/analytics', icon: BarChart2, permission: 'view_analytics', color: 'blue' },
            { id: 'revenue', nameKey: 'revenue', path: '/admin/revenue', icon: BarChart2, permission: 'view_revenue', color: 'lime' },
            { id: 'board', nameKey: 'board', path: '/admin/board', icon: StickyNote, permission: 'view_board', color: 'yellow' },
        ]
    },
    {
        id: 'users_orders',
        titleKey: 'cat_users_orders',
        items: [
            { id: 'orders', nameKey: 'orders', path: '/admin/order-management', icon: ShoppingCart, permission: 'manage_orders', color: 'emerald' },
            { id: 'customers', nameKey: 'customers', path: '/admin/customers', icon: Users, permission: 'manage_customers', color: 'green' },
            { id: 'payments', nameKey: 'payments', path: '/admin/payments', icon: CreditCard, permission: 'manage_payments', color: 'red' },
            { id: 'points', nameKey: 'points', path: '/admin/points', icon: CheckCircle, permission: 'manage_points', color: 'teal' },
            { id: 'wishlist', nameKey: 'wishlist', path: '/admin/wishlist', icon: Heart, permission: 'manage_wishlist', color: 'purple' },
            { id: 'reviews', nameKey: 'reviews', path: '/admin/reviews', icon: MessageCircle, permission: 'manage_reviews', color: 'rose' },
            { id: 'eid', nameKey: 'eid', isStatic: true, path: '/admin/eid', icon: ClipboardList, permission: 'manage_eid', color: 'red' },
        ]
    },
    {
        id: 'marketing_inventory',
        titleKey: 'cat_marketing_inventory',
        items: [
            { id: 'inventory', nameKey: 'inventory', path: '/admin/inventory', icon: Package, permission: 'manage_inventory', color: 'cyan' },
            { id: 'offers', nameKey: 'offers', path: '/admin/offers', icon: Gift, permission: 'manage_offers', color: 'yellow' },
            { id: 'campaigns', nameKey: 'campaigns', path: '/admin/campaigns', icon: Megaphone, permission: 'manage_campaigns', color: 'orange' },
            { id: 'vouchers', nameKey: 'vouchers', path: '/admin/vouchers', icon: Ticket, permission: 'manage_vouchers', color: 'amber' },
            { id: 'qr_codes', nameKey: 'qr_codes', isStatic: true, path: '/admin/qr-codes', icon: QrCode, permission: 'manage_offers', color: 'indigo' },
            { id: 'gallery', nameKey: 'gallery', path: '/admin/gallery', icon: ImageIcon, permission: 'manage_gallery', color: 'pink' },
        ]
    },
    {
        id: 'system_settings',
        titleKey: 'cat_system_settings',
        items: [
            { id: 'admins', nameKey: 'admins', path: '/admin/admins', icon: Shield, permission: 'manage_admins', color: 'purple' },

            { id: 'logs', nameKey: 'logs', path: '/admin/logs', icon: FileText, permission: 'view_logs', color: 'gray' },
            { id: 'settings', nameKey: 'settings', path: '/admin/settings', icon: Settings, permission: 'manage_settings', color: 'gray' },
        ]
    }
];
