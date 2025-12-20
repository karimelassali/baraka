// components/admin/MultiStepProductForm.jsx
"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Check,
    Package,
    DollarSign,
    Truck
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import GlassCard from '../ui/GlassCard';
import { CardHeader, CardTitle, CardContent } from '../ui/card';
import { useTranslations } from 'next-intl';

export default function MultiStepProductForm({
    isOpen,
    onClose,
    onSubmit,
    formData,
    setFormData,
    categories,
    editingProduct,
    submitting,
    error
}) {
    const t = useTranslations('Admin.Inventory');
    const [currentStep, setCurrentStep] = useState(1);

    const STEPS = [
        { id: 1, title: t('steps.base'), icon: Package, fields: ['name', 'description', 'category_id', 'expiration_date'] },
        { id: 2, title: t('steps.inventory'), icon: Package, fields: ['quantity', 'unit', 'minimum_stock_level'] },
        { id: 3, title: t('steps.pricing'), icon: DollarSign, fields: ['purchase_price', 'selling_price', 'supplier_name', 'sku', 'location_in_shop', 'batch_number'] }
    ];

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(e);
        setCurrentStep(1); // Reset to first step after submit
    };

    const handleClose = () => {
        setCurrentStep(1);
        onClose();
    };

    const units = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'bottle', 'pack'];

    const StepIcon = STEPS[currentStep - 1].icon;

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    const [direction, setDirection] = useState(0);

    const paginate = (newDirection) => {
        setDirection(newDirection);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <motion.div
                className="bg-card rounded-xl shadow-2xl w-full max-w-3xl my-8"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <GlassCard className="border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                                <StepIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle>
                                    {editingProduct ? t('editProduct') : t('addProduct')}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Passo {currentStep} di {STEPS.length}: {STEPS[currentStep - 1].title}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    {/* Progress Indicator */}
                    <div className="px-6 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            {STEPS.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.id;
                                const isCompleted = currentStep > step.id;

                                return (
                                    <div key={step.id} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                            <motion.div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive
                                                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-500/50'
                                                    : isCompleted
                                                        ? 'bg-red-100 border-red-600 text-red-600 dark:bg-red-900/30'
                                                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                                                    }`}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {isCompleted ? (
                                                    <Check className="h-5 w-5" />
                                                ) : (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </motion.div>
                                            <span className={`text-xs mt-2 font-medium ${isActive ? 'text-red-600' : 'text-muted-foreground'}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < STEPS.length - 1 && (
                                            <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-red-600' : 'bg-muted'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit}>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-sm"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="min-h-[300px] relative overflow-hidden">
                                <AnimatePresence initial={false} custom={direction} mode="wait">
                                    {/* Step 1: Basic Info */}
                                    {currentStep === 1 && (
                                        <motion.div
                                            key="step1"
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('productName')} *</label>
                                                <Input
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder={t('productName')}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('productDescription')}</label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder={t('productDescription')}
                                                    className="w-full min-h-[100px] px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('category')}</label>
                                                <select
                                                    value={formData.category_id}
                                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                >
                                                    <option value="">{t('selectCategory')}</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('expirationDate')} *</label>
                                                <Input
                                                    type="date"
                                                    value={formData.expiration_date}
                                                    onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Inventory */}
                                    {currentStep === 2 && (
                                        <motion.div
                                            key="step2"
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">{t('quantity')} *</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.quantity}
                                                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">{t('unit')}</label>
                                                    <select
                                                        value={formData.unit}
                                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                                    >
                                                        {units.map((unit) => (
                                                            <option key={unit} value={unit}>{t(`units.${unit}`)}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('minimumStock')}</label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.minimum_stock_level}
                                                    onChange={(e) => setFormData({ ...formData, minimum_stock_level: e.target.value })}
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Riceverai un avviso quando la quantità scende sotto questo livello
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Pricing & Tracking */}
                                    {currentStep === 3 && (
                                        <motion.div
                                            key="step3"
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            className="space-y-4"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">{t('purchasePrice')}</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.purchase_price}
                                                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">{t('sellingPrice')}</label>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.selling_price}
                                                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('supplierName')}</label>
                                                <Input
                                                    value={formData.supplier_name}
                                                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                                                    placeholder={t('supplierName')}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">{t('sku')}</label>
                                                    <Input
                                                        value={formData.sku}
                                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                        placeholder={t('sku')}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2">{t('batchNumber')}</label>
                                                    <Input
                                                        value={formData.batch_number}
                                                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                                                        placeholder={t('batchNumber')}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">{t('locationInShop')}</label>
                                                <Input
                                                    value={formData.location_in_shop}
                                                    onChange={(e) => setFormData({ ...formData, location_in_shop: e.target.value })}
                                                    placeholder={t('locationInShop')}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-border/50 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrev}
                                    disabled={currentStep === 1}
                                    className="flex-1"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Indietro
                                </Button>

                                {currentStep < STEPS.length ? (
                                    <>
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            {submitting ? t('loading') : 'Fine'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                paginate(1);
                                                handleNext();
                                            }}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                        >
                                            Continua
                                            <ChevronRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                    >
                                        {submitting ? t('loading') : (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                {t('save')}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </GlassCard>
            </motion.div>
        </div>,
        document.body
    );
}
