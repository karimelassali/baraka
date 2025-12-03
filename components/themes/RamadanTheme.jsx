'use client';

import { motion } from 'framer-motion';
import { Moon, Star } from 'lucide-react';

export default function RamadanTheme() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Golden Border */}
            <div className="absolute inset-0 border-[12px] border-amber-500/20 rounded-none pointer-events-none" />

            {/* Dark overlay with slight tint */}
            <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply" />

            {/* Hanging Lanterns (CSS/SVG representation or simple shapes) */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-0 left-10 md:left-20"
            >
                <div className="w-1 h-24 bg-amber-400 mx-auto" />
                <div className="w-12 h-16 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg shadow-[0_0_40px_rgba(245,158,11,0.8)] flex items-center justify-center border-2 border-amber-300">
                    <div className="w-6 h-8 bg-yellow-200 rounded-full blur-md animate-pulse" />
                </div>
            </motion.div>

            <motion.div
                initial={{ y: -120 }}
                animate={{ y: 0 }}
                transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
                className="absolute top-0 right-10 md:right-32"
            >
                <div className="w-1 h-40 bg-amber-400 mx-auto" />
                <div className="w-14 h-20 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg shadow-[0_0_40px_rgba(245,158,11,0.8)] flex items-center justify-center border-2 border-amber-300">
                    <div className="w-8 h-10 bg-yellow-200 rounded-full blur-md animate-pulse" />
                </div>
            </motion.div>

            {/* Floating Crescent Moon */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-24 right-8 md:right-16 text-amber-300 drop-shadow-[0_0_25px_rgba(252,211,77,0.8)]"
            >
                <Moon className="w-32 h-32 fill-current" />
            </motion.div>

            {/* Twinkling Stars */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.5, 0.8] }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                    className="absolute text-yellow-200 drop-shadow-md"
                    style={{
                        top: `${Math.random() * 50}%`,
                        left: `${Math.random() * 100}%`,
                    }}
                >
                    <Star className="w-6 h-6 fill-current" />
                </motion.div>
            ))}

            {/* Decorative Islamic Pattern Border (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-emerald-600 via-amber-500 to-emerald-600 opacity-80" />

            {/* Indicator */}
            <div className="absolute bottom-6 left-6 bg-emerald-800 text-amber-100 px-6 py-2 rounded-full shadow-xl border border-amber-400/50 font-bold flex items-center gap-2">
                <Moon className="w-4 h-4" />
                <span>Ramadan Kareem</span>
            </div>
        </div>
    );
}
