"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import Image from "next/image";

export default function UnauthorizedPage() {
    const t = useTranslations('Dashboard.Unauthorized');

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground overflow-hidden relative selection:bg-primary/20">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-red-500/10 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-orange-500/10 rounded-full blur-[120px]"
                />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-4">

                {/* Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative w-64 h-64 md:w-80 md:h-80"
                >
                    <img
                        src="/illus/undraw_data-thief_d66l.svg"
                        alt="Unauthorized Access"
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                </motion.div>

                {/* 403 Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative"
                >
                    <h1 className="text-4xl md:text-5xl font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 select-none mb-4">
                        {t('title')}
                    </h1>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-4 max-w-md space-y-2"
                >
                    <p className="text-muted-foreground text-lg">
                        {t('description')}
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                    <Link href="/">
                        <div className="group relative px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 overflow-hidden">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Home className="w-4 h-4" />
                            <span>{t('back_home')}</span>
                        </div>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-medium transition-all hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{t('go_back')}</span>
                    </button>
                </motion.div>
            </div>

            {/* Footer Decoration */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute bottom-8 text-xs text-muted-foreground/50 font-mono"
            >
                BARAKA SYSTEM • ERROR 403
            </motion.div>
        </div>
    );
}
