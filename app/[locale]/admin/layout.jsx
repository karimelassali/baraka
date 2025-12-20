// app/admin/layout.jsx
"use client";

import { useEffect, useState } from 'react';
import { ClientAuthService } from '../../../lib/auth/client-auth';
import EnhancedAdminSidebar from '../../../components/admin/EnhancedAdminSidebar';
import AICopilot from '../../../components/admin/ai/AICopilot';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function AdminLayout({ children }) {
  const t = useTranslations('Admin.Dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const adminStatus = await ClientAuthService.isAdmin();
      if (!adminStatus) {
        // Redirect to login by changing the window location
        window.location.href = '/auth/login';
      } else {
        setIsAdmin(true);
      }
    };

    checkAuth();
  }, []);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">{t('checking_auth')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground overflow-hidden">
      <EnhancedAdminSidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />


      <main className={`flex-1 relative z-10 h-screen overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <div className="absolute top-4 right-8 z-50">
          <LanguageSwitcher />
        </div>
        <motion.div
          className="w-full p-4 md:p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      <AICopilot />
    </div>
  );
}