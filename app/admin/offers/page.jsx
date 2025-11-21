// app/admin/offers/page.jsx
"use client";

import EnhancedOfferManagement from '../../../components/admin/EnhancedOfferManagement';
import { motion } from 'framer-motion';

export default function EnhancedAdminOffersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Offer Management</h1>
        <p className="text-muted-foreground mt-1">Create and manage weekly and permanent offers</p>
      </div>

      <EnhancedOfferManagement />
    </motion.div>
  );
}