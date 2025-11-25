// components/admin/EnhancedAdminSidebar.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ChevronRight
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
    { name: t('admins'), path: '/admin/admins', icon: Shield, permission: 'manage_admins' },
    { name: t('dashboard'), path: '/admin', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: t('analytics'), path: '/admin/analytics', icon: BarChart2, permission: 'view_dashboard' },
    { name: t('customers'), path: '/admin/customers', icon: Users, permission: 'manage_users' },
    { name: t('inventory'), path: '/admin/inventory', icon: Package, permission: 'manage_offers' },
    { name: t('offers'), path: '/admin/offers', icon: Gift, permission: 'manage_offers' },
    { name: t('reviews'), path: '/admin/reviews', icon: MessageCircle, permission: 'manage_reviews' },
    { name: t('points'), path: '/admin/points', icon: CheckCircle, permission: 'manage_users' },
    { name: t('vouchers'), path: '/admin/vouchers', icon: Ticket, permission: 'manage_vouchers' },
    { name: t('campaigns'), path: '/admin/campaigns', icon: Megaphone, permission: 'manage_offers' },
    { name: t('gallery'), path: '/admin/gallery', icon: ImageIcon, permission: 'manage_offers' },
    { name: t('logs'), path: '/admin/logs', icon: FileText, permission: 'view_reports' },
  ];

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
                      ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="relative z-10 flex items-center w-full">
                    <Icon className={cn("h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
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