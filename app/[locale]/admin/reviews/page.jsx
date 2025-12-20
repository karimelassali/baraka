// app/admin/reviews/page.jsx
"use client";

import EnhancedReviewManagement from '../../../../components/admin/EnhancedReviewManagement';
import { motion } from 'framer-motion';


export default function EnhancedAdminReviewsPage() {




  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground mt-1">Moderate and manage customer reviews</p>
      </div>

      <EnhancedReviewManagement />


    </motion.div>
  );
}