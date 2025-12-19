"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Save, RotateCcw, GripVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { COLOR_THEMES, DEFAULT_NAV_CATEGORIES } from '@/lib/constants/admin-sidebar';

export default function SidebarCustomizer({ isOpen, onClose, onSave, initialOrder }) {
    const t = useTranslations('Admin.Sidebar');
    const [categories, setCategories] = useState(initialOrder || DEFAULT_NAV_CATEGORIES);
    const [activeTab, setActiveTab] = useState(categories[0]?.id);

    useEffect(() => {
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 md:inset-10 z-[101] bg-background md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-border/50"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Left Panel - Illustration & Info */}
                        <div className="hidden md:flex w-1/3 bg-muted/30 border-r border-border p-8 flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                    {t('customize_sidebar')}
                                </h2>
                                <p className="text-muted-foreground text-lg mb-8">
                                    {t('customize_description', { defaultMessage: "Personalize your workspace. Drag and drop items to organize your sidebar exactly how you like it." })}
                                </p>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <img
                                    src="/illus/undraw_personalization.svg"
                                    onError={(e) => e.target.src = '/illus/undraw_wishlist_0k5w.svg'}
                                    alt="Personalize"
                                    className="w-full max-w-[300px] mx-auto drop-shadow-xl"
                                />
                            </div>

                            {/* Decorative background elements */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                        </div>

                        {/* Right Panel - Customization Interface */}
                        <div className="flex-1 flex flex-col h-full bg-background">
                            {/* Mobile Header */}
                            <div className="md:hidden p-4 border-b border-border flex items-center justify-between">
                                <h2 className="text-xl font-bold">{t('customize_sidebar')}</h2>
                                <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Category Tabs */}
                            <div className="flex overflow-x-auto p-2 border-b border-border gap-2 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTab(cat.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                            activeTab === cat.id
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        {t(cat.titleKey)}
                                    </button>
                                ))}
                            </div>

                            {/* Draggable Area */}
                            <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
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
                                                    className="bg-background border border-border rounded-xl p-4 shadow-sm cursor-grab active:cursor-grabbing flex items-center gap-4 group hover:border-primary/50 transition-colors"
                                                    whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                                                >
                                                    <div className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>

                                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", theme.light)}>
                                                        <Icon className={cn("w-5 h-5", theme.text)} />
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-foreground">
                                                            {item.isStatic ? item.nameKey : t(item.nameKey)}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground">
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
                            <div className="p-4 border-t border-border bg-background flex items-center justify-between">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    {t('reset_default', { defaultMessage: "Reset to Default" })}
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
                                    >
                                        {t('cancel', { defaultMessage: "Cancel" })}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Save className="w-4 h-4" />
                                        {t('save_changes', { defaultMessage: "Save Changes" })}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
