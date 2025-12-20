"use client";

import { Link, usePathname } from '@/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import NotificationCenter from './NotificationCenter';
import AdminProfileModal from './AdminProfileModal';
import SidebarCustomizer from './SidebarCustomizer';
import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';
import { getAvatarUrl } from '@/lib/avatar';
import { DEFAULT_NAV_CATEGORIES, COLOR_THEMES } from '@/lib/constants/admin-sidebar';

export default function EnhancedAdminSidebar({ isCollapsed, toggleCollapse }) {
  const t = useTranslations('Admin.Sidebar');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [navCategories, setNavCategories] = useState(DEFAULT_NAV_CATEGORIES);

  // Helper to rehydrate icons after loading from localStorage
  const rehydrateCategories = (storedCategories) => {
    return storedCategories.map(cat => ({
      ...cat,
      items: cat.items.map(item => {
        // Find original item to get the icon component
        let originalItem;
        for (const defCat of DEFAULT_NAV_CATEGORIES) {
          const found = defCat.items.find(i => i.id === item.id);
          if (found) {
            originalItem = found;
            break;
          }
        }
        return {
          ...item,
          icon: originalItem ? originalItem.icon : item.icon // Fallback if not found
        };
      })
    }));
  };

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

    // Load sidebar preference
    const storedConfig = localStorage.getItem('admin_sidebar_config');
    const hasOnboarded = localStorage.getItem('admin_sidebar_onboarded');

    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        setNavCategories(rehydrateCategories(parsed));
      } catch (e) {
        console.error("Failed to parse sidebar config", e);
      }
    }

    if (!hasOnboarded) {
      // Small delay to ensure smooth initial render before showing modal
      setTimeout(() => setIsCustomizerOpen(true), 1000);
    }
  }, []);

  const handleSaveCustomization = (newCategories) => {
    setNavCategories(newCategories);
    // Save to local storage (icons will be stripped automatically by JSON.stringify)
    localStorage.setItem('admin_sidebar_config', JSON.stringify(newCategories));
    localStorage.setItem('admin_sidebar_onboarded', 'true');
  };

  const filteredCategories = navCategories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      if (!currentUser) return true;
      if (currentUser.role === 'super_admin') return true;
      if (!item.permission) return true;
      return currentUser.permissions && currentUser.permissions.includes(item.permission);
    })
  })).filter(category => category.items.length > 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const SidebarContent = ({ mobile = false }) => (
    <>
      <div className={cn("h-20 flex items-center border-b border-border/50 bg-sidebar-accent/5 relative group transition-all duration-300", isCollapsed && !mobile ? "justify-center px-2" : "justify-center px-4")}>
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border border-primary/20 bg-background overflow-hidden shrink-0">
            <img src="/images/logo.png" alt="Baraka Logo" className="w-full h-full object-contain" />
          </div>
          {(!isCollapsed || mobile) && (
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 tracking-tight whitespace-nowrap overflow-hidden">Baraka</span>
          )}
        </motion.div>

        {/* Quick Customize Button */}
        {(!isCollapsed || mobile) && (
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
            title={t('customize_sidebar')}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div className="space-y-6">
          {filteredCategories.map((category, catIndex) => (
            <div key={category.id || catIndex}>
              {(!isCollapsed || mobile) && (
                <h3 className={cn(
                  "mb-3 px-4 text-xs font-extrabold text-primary uppercase tracking-widest whitespace-nowrap",
                  catIndex !== 0 && "mt-6"
                )}>
                  {t(category.titleKey)}
                </h3>
              )}
              <ul className="space-y-1.5">
                {category.items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  const theme = COLOR_THEMES[item.color] || COLOR_THEMES.gray;

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
                          "relative flex items-center text-sm font-medium rounded-xl transition-all duration-200 overflow-hidden group",
                          isCollapsed && !mobile ? "justify-center px-2 py-3" : "px-4 py-3",
                          isActive
                            ? `${theme.light} ${theme.text} shadow-md ${theme.shadow}`
                            : `text-muted-foreground ${theme.hover}`
                        )}
                        title={isCollapsed && !mobile ? t(item.nameKey) : ''}
                      >
                        <div className={cn("relative z-10 flex items-center w-full", isCollapsed && !mobile ? "justify-center" : "")}>
                          {Icon && <Icon className={cn("h-5 w-5 transition-transform duration-300 group-hover:scale-110 shrink-0", (!isCollapsed || mobile) ? "mr-3" : "", isActive ? theme.text : "text-muted-foreground")} />}
                          {(!isCollapsed || mobile) && (
                            <>
                              <span className="whitespace-nowrap">{item.isStatic ? item.nameKey : t(item.nameKey)}</span>
                              {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                              )}
                            </>
                          )}
                        </div>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className={cn("border-t border-border/50 bg-muted/5 transition-all duration-300", isCollapsed && !mobile ? "p-2" : "p-4")}>
        <div className="flex items-center gap-2 justify-center">
          <Link
            href="/admin/profile"
            className={cn("flex items-center rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group min-w-0", isCollapsed && !mobile ? "justify-center p-1 flex-1" : "flex-1 space-x-3 p-2")}
            onClick={() => setIsMobileMenuOpen(false)}
            title={isCollapsed && !mobile ? (currentUser?.full_name || t('default_user')) : ''}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0 overflow-hidden border border-border bg-background">
              <img
                src={getAvatarUrl(currentUser?.full_name || 'User')}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {(!isCollapsed || mobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {currentUser?.full_name || t('default_user')}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {currentUser?.email || 'admin@example.com'}
                </p>
              </div>
            )}
          </Link>
          {(!isCollapsed || mobile) && <NotificationCenter />}
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
          <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        className={cn(
          "hidden md:flex fixed top-0 left-0 h-full bg-card border-r border-border z-40 flex-col shadow-sm transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <SidebarContent />

        {/* Collapse Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-24 bg-background border border-border rounded-full p-1 shadow-md hover:bg-accent transition-colors z-50 hidden md:flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
          )}
        </button>
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
              <SidebarContent mobile={true} />
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

      <SidebarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSave={handleSaveCustomization}
        initialOrder={navCategories}
      />
    </>
  );
}