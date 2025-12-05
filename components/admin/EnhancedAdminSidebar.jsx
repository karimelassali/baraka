// components/admin/EnhancedAdminSidebar.jsx
"use client";

import { Link, usePathname } from '@/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  X,
  LogOut,
  Settings,
  Image as ImageIcon,
  Shield,
  BarChart2,
  ChevronRight,
  ShoppingCart,
  StickyNote,
  CreditCard,
  Brain,
  Heart
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NotificationCenter from './NotificationCenter';
import AdminProfileModal from './AdminProfileModal';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export default function EnhancedAdminSidebar() {
  const t = useTranslations('Admin.Sidebar');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (adminData) {
          setCurrentUser(adminData);
        }
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    { name: t('admins'), path: '/admin/admins', icon: Shield, permission: 'manage_admins', color: 'purple' },
    { name: t('analytics'), path: '/admin/analytics', icon: BarChart2, permission: 'view_dashboard', color: 'blue' },
    { name: t('board'), path: '/admin/board', icon: StickyNote, permission: 'view_dashboard', color: 'yellow' },
    { name: t('campaigns'), path: '/admin/campaigns', icon: Megaphone, permission: 'manage_offers', color: 'orange' },
    { name: t('customers'), path: '/admin/customers', icon: Users, permission: 'manage_users', color: 'green' },
    { name: t('dashboard'), path: '/admin', icon: LayoutDashboard, permission: 'view_dashboard', color: 'indigo' },
    { name: t('gallery'), path: '/admin/gallery', icon: ImageIcon, permission: 'manage_offers', color: 'pink' },
    { name: t('inventory'), path: '/admin/inventory', icon: Package, permission: 'manage_offers', color: 'cyan' },
    { name: t('logs'), path: '/admin/logs', icon: FileText, permission: 'view_reports', color: 'gray' },
    { name: t('offers'), path: '/admin/offers', icon: Gift, permission: 'manage_offers', color: 'yellow' },
    { name: t('orders'), path: '/admin/order-management', icon: ShoppingCart, permission: 'manage_offers', color: 'emerald' },
    { name: t('payments'), path: '/admin/payments', icon: CreditCard, permission: 'view_dashboard', color: 'red' },
    { name: t('points'), path: '/admin/points', icon: CheckCircle, permission: 'manage_users', color: 'teal' },
    { name: t('revenue'), path: '/admin/revenue', icon: BarChart2, permission: 'view_dashboard', color: 'lime' },
    { name: t('reviews'), path: '/admin/reviews', icon: MessageCircle, permission: 'manage_reviews', color: 'rose' },
    { name: t('settings'), path: '/admin/settings', icon: Settings, permission: 'view_dashboard', color: 'gray' },
    { name: t('vouchers'), path: '/admin/vouchers', icon: Ticket, permission: 'manage_vouchers', color: 'amber' },
    { name: t('wishlist'), path: '/admin/wishlist', icon: Heart, permission: 'manage_offers', color: 'purple' },
    { name: 'Agent Training', path: '/admin/agent-training', icon: Brain, permission: 'manage_settings', color: 'red' },
  ];

  // Color palette for each tab
  const colorThemes = {
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

  const filteredNavItems = navItems.filter(item => {
    if (!currentUser) return true;
    if (currentUser.role === 'super_admin') return true;
    if (!item.permission) return true;
    return currentUser.permissions && currentUser.permissions.includes(item.permission);
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-center border-b border-border/50 bg-sidebar-accent/5">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-primary/20 bg-background overflow-hidden">
            <img src="/logo.jpeg" alt="Baraka Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 tracking-tight">Baraka</span>
        </motion.div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1.5">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const theme = colorThemes[item.color] || colorThemes.gray;

            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Link
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden group",
                    isActive
                      ? `${theme.light} ${theme.text} shadow-md ${theme.shadow}`
                      : `text-muted-foreground ${theme.hover}`
                  )}
                >
                  <div className="relative z-10 flex items-center w-full">
                    <Icon className={cn("h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110", isActive ? theme.text : "text-muted-foreground")} />
                    <span>{item.name}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                    )}
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border/50 bg-muted/5">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group min-w-0"
            onClick={() => setIsProfileOpen(true)}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0 overflow-hidden border border-border bg-background">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser?.full_name || 'User'}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {currentUser?.full_name || t('default_user')}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
          <NotificationCenter />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <motion.button
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </motion.button>
          <span className="font-bold text-lg">{t('mobile_title')}</span>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
          <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 flex-col shadow-sm"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />
            <motion.aside
              className="fixed top-0 left-0 h-full w-[280px] bg-background border-r border-border z-[51] flex flex-col md:hidden shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.2, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x < -100 || velocity.x < -500) {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              <div className="flex justify-end p-4 absolute top-0 right-0 z-20">
                <button onClick={toggleMobileMenu} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AdminProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onUpdate={setCurrentUser}
      />
    </>
  );
}