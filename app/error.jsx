'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RefreshCcw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground overflow-hidden relative selection:bg-destructive/20">
            {/* Background Elements - Red tinted for error */}
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
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-destructive/10 rounded-full blur-[120px]"
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

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-background shadow-2xl"
                >
                    <Image
                        src="/logo.jpeg"
                        alt="Baraka Logo"
                        fill
                        className="object-cover"
                    />
                </motion.div>

                {/* Error Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative"
                >
                    <h1 className="text-[80px] md:text-[120px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-destructive to-destructive/50 select-none">
                        Errore
                    </h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center"
                    >
                        {/* <span className="text-sm md:text-base font-mono text-destructive-foreground/70 uppercase tracking-[1em] opacity-50 whitespace-nowrap">
                            Qualcosa è andato storto
                        </span> */}
                    </motion.div>
                </motion.div>

                {/* Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mt-8 max-w-md space-y-2"
                >
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                        Non è colpa tua!
                    </h2>
                    <p className="text-muted-foreground">
                        Si è verificato un errore imprevisto nel sistema.
                        Abbiamo notificato il team tecnico.
                    </p>
                    {error.digest && (
                        <p className="text-xs font-mono text-muted-foreground/50 mt-4">
                            Error ID: {error.digest}
                        </p>
                    )}
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                    <button
                        onClick={() => reset()}
                        className="group relative px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <RefreshCcw className="w-4 h-4" />
                        <span>Riprova</span>
                    </button>

                    <Link href="/">
                        <div className="px-8 py-3 bg-secondary text-secondary-foreground rounded-full font-medium transition-all hover:bg-secondary/80 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            <span>Torna alla Home</span>
                        </div>
                    </Link>
                </motion.div>
            </div>

            {/* Footer Decoration */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1 }}
                className="absolute bottom-8 text-xs text-muted-foreground/50 font-mono"
            >
                BARAKA SYSTEM • SYSTEM ERROR
            </motion.div>
        </div>
    );
}
