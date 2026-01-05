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
    const checkAuthAndInitialPermission = async () => {
      try {
        // Add a timeout to prevent infinite hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 10000)
        );

        const profilePromise = ClientAuthService.getAdminProfile();
        const profile = await Promise.race([profilePromise, timeoutPromise]);

        if (!profile) {
          window.location.href = '/auth/login';
          return;
        }

        // Calculate initial permission immediately
        const isAuth = checkPermissionForPath(pathname, profile);

        setAdminProfile(profile);
        setIsAuthorized(isAuth);
      } catch (error) {
        console.error("Auth check failed", error);
        window.location.href = '/auth/login';
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndInitialPermission();
  }, []); // Only run on mount

  // Handle route changes
  useEffect(() => {
    if (!adminProfile) return;
    const isAuth = checkPermissionForPath(pathname, adminProfile);
    setIsAuthorized(isAuth);
  }, [pathname, adminProfile]);

  const checkPermissionForPath = (currentPath, profile) => {
    try {
      // Normalize path: remove locale prefix
      const normalizedPath = currentPath.replace(/^\/(en|it|ar)/, '') || '/';

      // Flatten categories to get all items
      const allItems = DEFAULT_NAV_CATEGORIES.flatMap(c => c.items);

      // Find the most specific matching item
      const matchedItems = allItems.filter(item =>
        normalizedPath === item.path || normalizedPath.startsWith(item.path + '/')
      );

      matchedItems.sort((a, b) => b.path.length - a.path.length);
      const targetItem = matchedItems[0];

      if (targetItem && targetItem.permission) {
        if (profile.role === 'super_admin') {
          return true;
        } else if (profile.permissions && profile.permissions.includes(targetItem.permission)) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error("Permission check error", err);
      return true; // Fail open or closed? Defaulting to true to avoid locking out if logic fails, but protected content usually handled by API too.
    }
  };

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