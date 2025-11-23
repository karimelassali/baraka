"use client";

import GalleryManagement from '../../../../components/admin/GalleryManagement';
import { motion } from 'framer-motion';

export default function AdminGalleryPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
                <p className="text-muted-foreground mt-1">Manage your gallery images</p>
            </div>

            <GalleryManagement />
        </motion.div>
    );
}
