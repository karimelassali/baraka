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
  BarChart2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NotificationCenter from './NotificationCenter';
import AdminProfileModal from './AdminProfileModal';
import { createClient } from '@/lib/supabase/client';

export default function EnhancedAdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      console.log('Auth User:', user);

      if (user) {
        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        console.log('Admin Data:', adminData, 'Error:', error);

        if (adminData) {
          setCurrentUser(adminData);
          console.log('Current User Set:', adminData);
        }
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    { name: 'Admins', path: '/admin/admins', icon: Shield, permission: 'manage_admins' },
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, permission: 'view_dashboard' },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2, permission: 'view_dashboard' },
    { name: 'Customers', path: '/admin/customers', icon: Users, permission: 'manage_users' },
    { name: 'Inventory', path: '/admin/inventory', icon: Package, permission: 'manage_offers' }, // Assuming inventory is related to offers or general management
    { name: 'Offers', path: '/admin/offers', icon: Gift, permission: 'manage_offers' },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageCircle, permission: 'manage_reviews' },
    { name: 'Points', path: '/admin/points', icon: CheckCircle, permission: 'manage_users' },
    { name: 'Vouchers', path: '/admin/vouchers', icon: Ticket, permission: 'manage_vouchers' },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone, permission: 'manage_offers' },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon, permission: 'manage_offers' },
    { name: 'Logs', path: '/admin/logs', icon: FileText, permission: 'view_reports' },
  ];

  const filteredNavItems = navItems.filter(item => {
    // Show all items during loading or if user data is not available yet
    if (!currentUser) return true;

    // Super admin has access to everything
    if (currentUser.role === 'super_admin') return true;

    // Items without specific permission requirement are visible to all
    if (!item.permission) return true;

    // Check if user has the specific permission
    return currentUser.permissions && currentUser.permissions.includes(item.permission);
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = () => (
    <>
      <div className="h-20 flex items-center justify-center border-b border-border bg-primary">
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
            <img src="/logo.jpeg" alt="Baraka Logo" className="w-10 h-10 rounded-full object-cover" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Baraka</span>
        </motion.div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <ul className="space-y-2">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden group",
                    isActive
                      ? "text-white shadow-md"
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center w-full">
                    <Icon className={cn("h-5 w-5 mr-3 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "")} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                        layoutId="activeDot"
                      />
                    )}
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 flex items-center space-x-3 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer group min-w-0"
            onClick={() => setIsProfileOpen(true)}
          >
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
              <span className="font-bold text-primary">
                {currentUser?.full_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {currentUser?.full_name || 'Admin User'}
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
      {/* Mobile menu button */}
      <motion.button
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-background border border-border shadow-lg text-foreground"
        onClick={toggleMobileMenu}
        whileTap={{ scale: 0.95 }}
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 flex-col shadow-sm"
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />
            <motion.aside
              className="fixed top-0 left-0 h-full w-72 bg-card border-r border-border z-50 flex-col md:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
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