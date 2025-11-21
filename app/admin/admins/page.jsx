"use client";

import { motion } from 'framer-motion';
import AdminManagement from '../../../components/admin/AdminManagement';

export default function AdminsPage() {
    return (
        <div className="space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Admin Management
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage administrator accounts, roles, and permissions.
                    </p>
                </div>

                <AdminManagement />
            </motion.div>
        </div>
    );
}
