"use client";

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useState } from 'react';

export default function AISuggestionsFooter({ suggestions, onSuggestionClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 mb-8"
        >
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl p-6">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                            <Sparkles className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 font-mono tracking-tight">Baraka Intelligence</h3>
                            <p className="text-xs text-slate-500">AI-Powered Optimization Suggestions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.map((suggestion, index) => (
                            <motion.button
                                key={index}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => onSuggestionClick(suggestion.action)}
                                className="group relative text-left p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-white hover:shadow-lg hover:shadow-red-500/5 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-1.5 rounded-lg transition-colors ${hoveredIndex === index ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                                        <Zap size={16} />
                                    </div>
                                    <ArrowRight size={16} className={`text-slate-400 transition-transform duration-300 ${hoveredIndex === index ? 'translate-x-1 text-red-500' : ''}`} />
                                </div>

                                <h4 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-red-700 transition-colors">
                                    {suggestion.title}
                                </h4>
                                <p className="text-xs text-slate-500 line-clamp-2 group-hover:text-slate-600 transition-colors">
                                    {suggestion.description}
                                </p>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
