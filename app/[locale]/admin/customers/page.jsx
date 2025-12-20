// app/admin/customers/page.jsx
"use client";

import EnhancedCustomerManagement from '../../../../components/admin/EnhancedCustomerManagement';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

import { useTranslations } from 'next-intl';

export default function EnhancedAdminCustomersPage() {

  const tPage = useTranslations('Admin.Customers');





  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
            <p className="text-muted-foreground mt-1">Manage your customer information and details</p>
          </div>
        </div>
      </div>

      <EnhancedCustomerManagement />


    </motion.div>
  );
}