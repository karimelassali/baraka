'use client';

import { motion } from 'framer-motion';

export default function EidAdhaTheme() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Elegant Teal/Blue Border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500" />
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-teal-500" />

            {/* Geometric Islamic Pattern Overlay (Subtle, no yellow) */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] pointer-events-none" />

            {/* Falling Confetti (Cool colors: Teal, Blue, White - No Yellow) */}
            {[...Array(25)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, rotate: 0 }}
                    animate={{ y: window.innerHeight + 20, rotate: 360 }}
                    transition={{
                        duration: 4 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                    className="absolute w-2 h-4 rounded-sm"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#14B8A6', '#3B82F6', '#E2E8F0'][Math.floor(Math.random() * 3)]
                    }}
                />
            ))}

            {/* Professional Eid Mubarak Banner */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="absolute top-6 left-1/2 -translate-x-1/2"
            >
                <div className="bg-white/95 dark:bg-slate-900/95 px-8 py-3 rounded-full shadow-lg border border-teal-100 dark:border-teal-900 flex items-center gap-3 backdrop-blur-md">
                    {/* Geometric Star Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-teal-600 dark:text-teal-400 fill-current">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    <span className="text-teal-800 dark:text-teal-200 font-bold tracking-wider uppercase text-sm">Eid Mubarak</span>
                </div>
            </motion.div>

            {/* Stylized Sheep Outline (SVG) - Subtle and Professional */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 0.1, x: 0 }}
                transition={{ duration: 2 }}
                className="absolute bottom-10 left-10 text-teal-900 dark:text-teal-100"
            >
                <svg width="100" height="80" viewBox="0 0 100 80" className="fill-none stroke-current stroke-2">
                    <path d="M20,60 Q10,50 20,40 Q25,20 45,20 Q65,20 70,40 Q80,50 70,60" /> {/* Body */}
                    <circle cx="75" cy="35" r="12" /> {/* Head */}
                    <path d="M25,60 L25,75 M35,60 L35,75 M55,60 L55,75 M65,60 L65,75" /> {/* Legs */}
                </svg>
            </motion.div>
        </div>
    );
}
