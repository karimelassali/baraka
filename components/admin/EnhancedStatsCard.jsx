"use client";

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { useTranslations } from 'next-intl';

export default function EnhancedStatsCard({ title, value, change, icon: Icon, color, changeColor, loading, index }) {
  const t = useTranslations('Admin.Dashboard');
  const [displayValue, setDisplayValue] = useState(0);

  // Animation for the number
  const springValue = useSpring(0, { bounce: 0, duration: 1000 });
  const roundedValue = useTransform(springValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (!loading) {
      springValue.set(value);
    }
  }, [value, loading, springValue]);

  useEffect(() => {
    const unsubscribe = roundedValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [roundedValue]);

  const isPositive = change && change.startsWith('+');

  return (
    <GlassCard
      className="relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Background decoration */}
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-white shadow-inner`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          {loading ? (
            <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" />
          ) : (
            <motion.h3 className="text-3xl font-bold tracking-tight">
              {displayValue}
            </motion.h3>
          )}
        </div>

        <div className="mt-4 flex items-center text-xs">
          <span className={`flex items-center font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {change}
          </span>
          <span className="text-muted-foreground ml-2">{t('from_last_month')}</span>
        </div>
      </div>
    </GlassCard>
  );
}