"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import CountdownTimer from '@/components/CountdownTimer';

export default function UnderConstruction() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center max-w-4xl w-full"
            >
                <div className="relative w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden shadow-xl border-4 border-red-600">
                    <Image
                        src="/logo.jpeg"
                        alt="Baraka Logo"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-red-600 mb-4 tracking-tight">
                    Coming Soon
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-md mx-auto mb-12">
                    We are currently working hard to bring you an amazing experience. Please check back later.
                </p>

                {/* Countdown Timer */}
                <div className="mb-8">
                    <CountdownTimer targetDate="2026-01-01T00:00:00" />
                </div>

                <div className="w-16 h-1 bg-red-600 mx-auto rounded-full" />
            </motion.div>
        </div>
    );
}

