// app/admin/layout.jsx
"use client";

import { useEffect, useState } from 'react';
import { ClientAuthService } from '../../lib/auth/client-auth';
import EnhancedAdminSidebar from '../../components/admin/EnhancedAdminSidebar';

export default function AdminLayout({ children }) {
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
          <p className="mt-4 text-lg text-muted-foreground">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen w-full">
      <EnhancedAdminSidebar />
      <main className="flex-1 md:ml-64 p-6 md:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}