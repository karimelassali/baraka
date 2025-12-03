'use client';

import { motion } from 'framer-motion';
import { Ghost } from 'lucide-react';

export default function HalloweenTheme() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {/* Spooky Border */}
            <div className="absolute inset-0 border-[12px] border-orange-600/20 rounded-none pointer-events-none" />

            {/* Orange/Purple Tint */}
            <div className="absolute inset-0 bg-purple-900/20 mix-blend-multiply" />

            {/* Fog Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-gray-900/40 to-transparent" />

            {/* Flying Bats */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -100, y: Math.random() * window.innerHeight * 0.5 }}
                    animate={{
                        x: window.innerWidth + 100,
                        y: [null, Math.random() * 100 - 50, Math.random() * 100 - 50],
                    }}
                    transition={{
                        duration: 8 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                        ease: "linear"
                    }}
                    className="absolute text-2xl filter drop-shadow-md"
                >
                    🦇
                </motion.div>
            ))}

            {/* Floating Ghosts */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ x: -100, y: Math.random() * window.innerHeight, opacity: 0 }}
                    animate={{
                        x: window.innerWidth + 100,
                        y: Math.random() * window.innerHeight,
                        opacity: [0, 0.6, 0]
                    }}
                    transition={{
                        duration: 12 + Math.random() * 10,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                        ease: "linear"
                    }}
                    className="absolute text-white/30"
                >
                    <Ghost className="w-16 h-16" />
                </motion.div>
            ))}

            {/* Fixed Pumpkins at Bottom Corners */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute bottom-4 left-4 text-6xl filter drop-shadow-lg"
            >
                🎃
            </motion.div>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-4 right-4 text-6xl filter drop-shadow-lg transform scale-x-[-1]"
            >
                🎃
            </motion.div>

            {/* Spooky Indicator */}
            <div className="absolute top-4 right-4 bg-orange-600 text-white px-4 py-1 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
                <span>👻 Spooky Season</span>
            </div>
        </div>
    );
}
