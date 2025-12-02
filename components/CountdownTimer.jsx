"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

export default function CountdownTimer({ targetDate = '2026-01-01T00:00:00', variant = 'default' }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate) - new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (!mounted) {
        return null;
    }

    const TimeUnit = ({ value, label }) => {
        const displayValue = String(value).padStart(2, '0');

        return (
            <div className="flex flex-col items-center gap-0.5">
                <motion.div
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`
                        ${variant === 'compact'
                            ? 'w-7 h-7 text-xs'
                            : 'w-14 h-14 md:w-16 md:h-16 text-xl md:text-2xl'
                        }
                        bg-gradient-to-br from-gray-900 to-gray-800
                        rounded-md
                        flex items-center justify-center
                        text-white font-bold
                        shadow-sm
                        relative
                        overflow-hidden
                    `}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <span className="relative z-10">{displayValue}</span>
                </motion.div>
                <span className={`
                    ${variant === 'compact' ? 'text-[8px]' : 'text-xs'}
                    text-gray-600 font-medium uppercase tracking-wide
                `}>
                    {label}
                </span>
            </div>
        );
    };

    const Separator = () => (
        <motion.div
            className={`flex flex-col gap-0.5 ${variant === 'compact' ? 'pb-1.5' : 'pb-4'}`}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
            <div className={`${variant === 'compact' ? 'w-0.5 h-0.5' : 'w-1.5 h-1.5'} bg-gray-400 rounded-full`} />
            <div className={`${variant === 'compact' ? 'w-0.5 h-0.5' : 'w-1.5 h-1.5'} bg-gray-400 rounded-full`} />
        </motion.div>
    );

    const CompactView = () => (
        <div className="inline-flex items-center gap-1.5 bg-white rounded-md px-2 py-1.5 shadow-sm border border-gray-200">
            <div className="flex items-center gap-1">
                <Rocket className="w-3 h-3 text-red-600" />
                <span className="text-[10px] font-semibold text-gray-700">Launch</span>
            </div>
            <div className="flex items-center gap-1">
                <TimeUnit value={timeLeft.days} label="D" />
                <Separator />
                <TimeUnit value={timeLeft.hours} label="H" />
                <Separator />
                <TimeUnit value={timeLeft.minutes} label="M" />
                <Separator />
                <TimeUnit value={timeLeft.seconds} label="S" />
            </div>
        </div>
    );

    const DefaultView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100"
        >
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full mb-3">
                    <Rocket className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-600">Platform Launch</span>
                </div>
                <p className="text-sm text-gray-600">
                    January 1st, 2026
                </p>
            </div>

            <div className="flex justify-center items-center gap-2 md:gap-3">
                <TimeUnit value={timeLeft.days} label="Days" />
                <Separator />
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <Separator />
                <TimeUnit value={timeLeft.minutes} label="Minutes" />
                <Separator />
                <TimeUnit value={timeLeft.seconds} label="Seconds" />
            </div>
        </motion.div>
    );

    return variant === 'compact' ? <CompactView /> : <DefaultView />;
}
