"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, hoverEffect = true, ...props }) {
    return (
        <motion.div
            className={cn(
                "bg-card border border-border rounded-xl p-6 shadow-sm relative overflow-hidden",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
