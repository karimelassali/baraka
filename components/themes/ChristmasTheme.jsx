'use client';

import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';

export default function ChristmasTheme() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Elegant Red Border (Top/Bottom only to be less intrusive) */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-green-600 to-red-600" />
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-green-600 to-red-600" />

            {/* No full screen tint to preserve readability */}

            {/* Visible Snowfall Effect (Slate/Blue-gray for visibility on white) */}
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 0 }}
                    animate={{
                        y: window.innerHeight + 20,
                        x: Math.random() * window.innerWidth + (Math.random() * 100 - 50),
                        opacity: [0, 0.8, 0]
                    }}
                    transition={{
                        duration: 5 + Math.random() * 5,
                        repeat: Infinity,
                        delay: Math.random() * 5,
                        ease: "linear"
                    }}
                    className="absolute text-slate-300 dark:text-slate-600"
                >
                    <Snowflake className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                </motion.div>
            ))}

            {/* SVG Santa Sleigh Silhouette */}
            <motion.div
                initial={{ x: -300, y: 50 }}
                animate={{ x: window.innerWidth + 300, y: [50, 80, 50] }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatDelay: 15,
                    ease: "linear"
                }}
                className="absolute top-10 z-40 opacity-20 dark:opacity-40"
            >
                <svg width="200" height="60" viewBox="0 0 200 60" className="fill-current text-red-800 dark:text-red-200">
                    {/* Stylized Sleigh and Reindeer Silhouette */}
                    <path d="M10,40 Q20,30 30,40 T50,40 T70,35 L80,30 L90,35 L100,30 L150,25 L160,15 L170,25 L190,20" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="160" cy="15" r="2" /> {/* Santa head */}
                    <rect x="140" y="20" width="30" height="10" rx="2" /> {/* Sleigh body */}
                </svg>
            </motion.div>

            {/* Corner Holly Decoration (SVG) */}
            <div className="absolute top-0 right-0 p-4 opacity-80">
                <svg width="60" height="60" viewBox="0 0 60 60" className="drop-shadow-sm">
                    <circle cx="45" cy="15" r="5" className="fill-red-600" />
                    <circle cx="35" cy="20" r="5" className="fill-red-600" />
                    <circle cx="40" cy="28" r="5" className="fill-red-600" />
                    <path d="M20,10 Q30,5 40,15 Q30,25 20,20 Q10,15 20,10" className="fill-green-700" />
                    <path d="M40,40 Q45,30 55,35 Q60,45 50,50 Q40,55 40,40" className="fill-green-700" />
                </svg>
            </div>

            {/* Professional Indicator */}
            <div className="absolute bottom-6 right-6 bg-white/90 dark:bg-slate-800/90 text-red-700 dark:text-red-400 px-4 py-1.5 rounded-full shadow-lg border border-red-100 dark:border-red-900/30 text-xs font-medium tracking-wider uppercase flex items-center gap-2 backdrop-blur-sm">
                <Snowflake className="w-3 h-3" />
                <span>Merry Christmas</span>
            </div>
        </div>
    );
}
