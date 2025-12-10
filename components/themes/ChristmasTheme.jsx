'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';

export default function ChristmasTheme() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // توليد ندف الثلج فقط
  const snowflakes = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: `snow-${i}`,
      left: `${Math.random() * 100}%`,
      animationDuration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      opacity: 0.3 + Math.random() * 0.5,
      size: 4 + Math.random() * 8,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden font-sans">
      
      {/* حدود متدرجة احتفالية */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-green-600 to-red-600 shadow-md opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-600 via-red-600 to-green-600 shadow-md opacity-80" />

      {/* تأثير الثلوج فقط */}
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -20, x: 0, opacity: 0 }}
          animate={{
            y: '110vh',
            x: [0, 50, -50, 20],
            opacity: [0, flake.opacity, 0],
          }}
          transition={{
            duration: flake.animationDuration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
          }}
          className="absolute text-slate-300 dark:text-slate-500 blur-[0.5px]"
        >
          <Snowflake className="w-full h-full fill-white/80" />
        </motion.div>
      ))}

      {/* رسم "بابا نويل" وعربته */}
      <motion.div
        initial={{ x: '-30vw', y: '8vh' }}
        animate={{ 
          x: '130vw', 
          y: ['8vh', '12vh', '6vh'], 
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          repeatDelay: 10,
          ease: "linear"
        }}
        className="absolute top-10 z-20 opacity-90"
      >
        <svg width="300" height="100" viewBox="0 0 300 100" className="drop-shadow-lg">
           {/* Reindeer Team */}
           <g className="text-amber-800 dark:text-amber-700 fill-current">
             <path d="M20,60 Q30,50 40,60 L50,55 L45,70 L35,70 Z" />
             <path d="M50,55 Q60,45 70,55 L80,50 L75,65 L65,65 Z" />
             <rect x="40" y="58" width="40" height="2" className="fill-red-800" />
           </g>

           {/* The Sleigh */}
           <path d="M180,50 C180,50 170,80 190,85 H240 C250,85 260,70 250,60 Z" className="fill-red-700 dark:fill-red-800" />
           <path d="M175,85 L255,85" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

           {/* Bag of Toys */}
           <path d="M220,60 C220,40 250,40 250,60 Z" className="fill-amber-200 dark:fill-amber-300" />

           {/* Papa Noel (Santa) */}
           <g transform="translate(200, 35)">
             <circle cx="15" cy="15" r="12" className="fill-red-600" />
             <circle cx="15" cy="5" r="8" className="fill-pink-200" />
             <path d="M5,5 Q15,20 25,5" fill="white" />
             <path d="M5,0 Q15,-10 25,0 L15,-5 Z" className="fill-red-600" />
             <circle cx="25" cy="0" r="2" fill="white" />
           </g>
        </svg>
      </motion.div>

      {/* زينة الزاوية البسيطة */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-60">
        <motion.div 
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative p-4 origin-top-right"
        >
           <svg width="80" height="80" viewBox="0 0 80 80">
              <path d="M40,0 L40,30" stroke="#fbbf24" strokeWidth="1" />
              <circle cx="40" cy="40" r="10" className="fill-red-600 shadow-sm" />
              <circle cx="36" cy="36" r="3" fill="white" opacity="0.3" />
           </svg>
        </motion.div>
      </div>

    </div>
  );
}