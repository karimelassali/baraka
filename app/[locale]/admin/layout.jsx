// app/admin/layout.jsx
"use client";

import { useEffect, useState } from 'react';
import { ClientAuthService } from '../../../lib/auth/client-auth';
import EnhancedAdminSidebar from '../../../components/admin/EnhancedAdminSidebar';
import { DEFAULT_NAV_CATEGORIES } from '../../../lib/constants/admin-sidebar';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function AdminLayout({ children }) {
  const t = useTranslations('Admin.Dashboard');
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await ClientAuthService.getAdminProfile();
        if (!profile) {
          window.location.href = '/auth/login';
          return;
        }
        setAdminProfile(profile);
      } catch (error) {
        console.error("Auth check failed", error);
        window.location.href = '/auth/login';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!adminProfile) return;

    const checkPermission = () => {
      // Normalize path: remove locale prefix
      const normalizedPath = pathname.replace(/^\/(en|it|ar)/, '') || '/';

      // Flatten categories to get all items
      const allItems = DEFAULT_NAV_CATEGORIES.flatMap(c => c.items);

      // Find the most specific matching item
      // Sort by path length descending to match /admin/payments before /admin
      const matchedItems = allItems.filter(item =>
        normalizedPath === item.path || normalizedPath.startsWith(item.path + '/')
      );

      matchedItems.sort((a, b) => b.path.length - a.path.length);
      const targetItem = matchedItems[0];

      if (targetItem && targetItem.permission) {
        if (adminProfile.role === 'super_admin') {
          setIsAuthorized(true);
        } else if (adminProfile.permissions && adminProfile.permissions.includes(targetItem.permission)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        // No specific permission required for this path (or not in sidebar)
        // Default to authorized if authenticated
        setIsAuthorized(true);
      }
    };

    checkPermission();
  }, [pathname, adminProfile]);

  if (isLoading || (adminProfile && isAuthorized === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground" suppressHydrationWarning>{t('checking_auth')}</p>
        </div>
      </div>
    );
  }

  if (!adminProfile) {
    return null; // Will redirect
  }

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
        <EnhancedAdminSidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`flex-1 relative z-10 h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} flex items-center justify-center`}>
          <div className="flex flex-col items-center justify-center gap-6 text-center p-8 max-w-lg">
            <div className="w-64 h-64 relative mb-4">
              <img
                src="/illus/undraw_data-thief_d66l.svg"
                alt="Hacker"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-red-600 dark:text-red-400">
              Vuoi hackerarci? 
            </h2>
            <p className="text-lg text-muted-foreground">
              Non hai i permessi per vedere questa pagina. <br />
              Torna indietro prima che chiamiamo la polizia! 
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
      <EnhancedAdminSidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />


      <main className={`flex-1 relative z-10 h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>

        <motion.div
          className="w-full p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>


    </div>
  );
}