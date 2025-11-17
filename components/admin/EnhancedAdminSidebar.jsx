// components/admin/EnhancedAdminSidebar.jsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Gift, 
  MessageCircle, 
  CheckCircle, 
  Ticket, 
  Megaphone,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function EnhancedAdminSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Offers', path: '/admin/offers', icon: Gift },
    { name: 'Reviews', path: '/admin/reviews', icon: MessageCircle },
    { name: 'Points', path: '/admin/points', icon: CheckCircle },
    { name: 'Vouchers', path: '/admin/vouchers', icon: Ticket },
    { name: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
    { name: 'Logs', path: '/admin/logs', icon: FileText },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Sidebar */}
      <motion.aside 
        className={`hidden md:flex fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-40 flex-col border-r border-sidebar-border transition-all duration-300`}
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border bg-gradient-to-r from-primary to-red-700">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold">B</span>
            </div>
            <span className="text-xl font-bold text-primary-foreground">Baraka</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
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
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {isActive && (
                      <motion.span 
                        className="ml-auto"
                        layoutId="activeIndicator"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </motion.span>
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="font-bold text-primary">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@example.com</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={toggleMobileMenu}
        />
      )}
      
      <motion.aside 
        className={`fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground z-50 flex-col border-r border-sidebar-border md:hidden transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={{ x: -260 }}
        animate={{ x: isMobileMenuOpen ? 0 : -260 }}
      >
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border bg-gradient-to-r from-primary to-red-700">
          <div className="flex items-center space-x-2">
            <div className="bg-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold">B</span>
            </div>
            <span className="text-xl font-bold text-primary-foreground">Baraka</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
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
                    className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                    {isActive && (
                      <span className="ml-auto">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </span>
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="font-bold text-primary">A</span>
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@example.com</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}