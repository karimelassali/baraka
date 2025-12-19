"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Save, RotateCcw, GripVertical, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { COLOR_THEMES, DEFAULT_NAV_CATEGORIES } from '@/lib/constants/admin-sidebar';

// Hook to detect mobile viewport
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

export default function SidebarCustomizer({ isOpen, onClose, onSave, initialOrder }) {
    const t = useTranslations('Admin.Sidebar');
    const isMobile = useIsMobile();
    const [categories, setCategories] = useState(initialOrder || DEFAULT_NAV_CATEGORIES);
    const [activeTab, setActiveTab] = useState(categories[0]?.id);
    const [isDragging, setIsDragging] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            setCategories(initialOrder || DEFAULT_NAV_CATEGORIES);
            setActiveTab(initialOrder?.[0]?.id || DEFAULT_NAV_CATEGORIES[0]?.id);
        }
    }, [isOpen, initialOrder]);

    const handleReorder = (categoryId, newItems) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId ? { ...cat, items: newItems } : cat
        ));
    };

    const handleReset = () => {
        setCategories(DEFAULT_NAV_CATEGORIES);
    };

    const handleSave = () => {
        onSave(categories);
        onClose();
    };

    // Find the active category object
    const activeCategory = categories.find(c => c.id === activeTab);

    // Variants for Modal (Desktop) vs Sheet (Mobile)
    const containerVariants = {
        hidden: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 },
        visible: isMobile ? { y: 0 } : { opacity: 1, scale: 1, y: 0 },
        exit: isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 20 }
    };

    const transition = {
        type: "spring",
        damping: 25,
        stiffness: 300
    };

    if (!mounted) return null;

    // Use Portal to ensure z-index is always on top of everything
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
                        onClick={onClose}
                    />

                    {/* Container (Modal or Sheet) */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={transition}
                        className={cn(
                            "fixed z-[99999] bg-background overflow-hidden flex flex-col shadow-2xl border-border/50",
                            // Mobile Styles (Bottom Sheet)
                            "inset-x-0 bottom-0 top-auto h-[85vh] rounded-t-[2rem] border-t",
                            // Desktop Styles (Centered Modal)
                            "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:h-[600px] md:rounded-3xl md:border md:flex-row md:h-auto md:min-h-[600px]"
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Mobile Drag Handle */}
                        <div className="md:hidden w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing shrink-0" onClick={onClose}>
                            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                        </div>

                        {/* Left Panel - Illustration & Info (Desktop Only) */}
                        <div className="hidden md:flex w-1/3 bg-muted/30 border-r border-border p-8 flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                    {t('customize_sidebar')}
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                                    {t('customize_description')}
                                </p>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <img
                                    src="/illus/undraw_personalization.svg"
                                    onError={(e) => e.target.src = '/illus/undraw_wishlist_0k5w.svg'}
                                    alt="Personalize"
                                    className="w-full max-w-[240px] mx-auto drop-shadow-xl transform hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                        </div>

                        {/* Right Panel - Customization Interface */}
                        <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
                            {/* Mobile Header */}
                            <div className="md:hidden px-6 pb-4 pt-2 border-b border-border flex items-center justify-between shrink-0">
                                <h2 className="text-xl font-bold">{t('customize_sidebar')}</h2>
                                <button onClick={onClose} className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category Tabs */}
                            <div className="flex w-full overflow-x-auto px-4 py-3 md:p-4 border-b border-border gap-2 md:gap-3 bg-muted/5 shrink-0 scrollbar-hide md:scrollbar-default">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id)}
                                        className={cn(
                                            "px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 select-none flex-shrink-0",
                                            activeTab === cat.id
                                                ? "bg-white text-primary shadow-sm ring-1 ring-border/50 font-semibold"
                                                : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                                        )}
                                    >
                                        {t(cat.titleKey)}
                                    </button>
                                ))}
                            </div>

                            {/* Draggable Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/5 scroll-smooth pb-24 md:pb-6">
                                {activeCategory && (
                                    <Reorder.Group
                                        axis="y"
                                        values={activeCategory.items}
                                        onReorder={(newItems) => handleReorder(activeCategory.id, newItems)}
                                        className="space-y-3 max-w-2xl mx-auto"
                                    >
                                        {activeCategory.items.map((item) => {
                                            const Icon = item.icon;
                                            const theme = COLOR_THEMES[item.color] || COLOR_THEMES.gray;

                                            return (
                                                <Reorder.Item
                                                    key={item.id}
                                                    value={item}
                                                    onDragStart={() => setIsDragging(true)}
                                                    onDragEnd={() => setIsDragging(false)}
                                                    className={cn(
                                                        "bg-white border border-border/60 rounded-2xl p-3 md:p-4 shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-4 group hover:border-primary/30 hover:shadow-md transition-all duration-200 select-none",
                                                        "touch-none" // Important for mobile dragging
                                                    )}
                                                    whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", zIndex: 50 }}
                                                >
                                                    <div className="text-muted-foreground/20 group-hover:text-muted-foreground/60 transition-colors p-1">
                                                        <GripVertical className="w-5 h-5 md:w-6 md:h-6" />
                                                    </div>

                                                    <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200", theme.light)}>
                                                        <Icon className={cn("w-5 h-5 md:w-6 md:h-6", theme.text)} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-sm md:text-base text-foreground truncate">
                                                            {item.isStatic ? item.nameKey : t(item.nameKey)}
                                                        </h3>
                                                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 font-mono bg-muted/30 inline-block px-1.5 py-0.5 rounded truncate max-w-full">
                                                            {item.path}
                                                        </p>
                                                    </div>
                                                </Reorder.Item>
                                            );
                                        })}
                                    </Reorder.Group>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-between shrink-0 absolute bottom-0 left-0 right-0 md:relative z-20 pb-8 md:pb-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-lg"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span className="hidden sm:inline">{t('reset_default')}</span>
                                </button>

                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors active:scale-95"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Save className="w-4 h-4" />
                                        {t('save_changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
