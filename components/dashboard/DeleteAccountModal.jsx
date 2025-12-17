"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }) {
    const t = useTranslations('Dashboard.DeleteAccount');
    const [step, setStep] = useState(1);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
    };

    const steps = [
        {
            id: 1,
            illustration: "/illus/undraw_wishlist_0k5w.svg",
            title: t('step1_title'),
            description: t('step1_desc'),
            buttonText: t('step1_button'),
            buttonColor: "bg-gray-900 hover:bg-gray-800",
            icon: AlertTriangle
        },
        {
            id: 2,
            illustration: "/illus/undraw_empty_4zx0.svg",
            title: t('step2_title'),
            description: t('step2_desc'),
            buttonText: t('step2_button'),
            buttonColor: "bg-orange-600 hover:bg-orange-700",
            icon: Trash2
        },
        {
            id: 3,
            illustration: "/illus/undraw_wallet_diag.svg",
            title: t('step3_title'),
            description: t('step3_desc'),
            buttonText: t('step3_button'),
            buttonColor: "bg-red-600 hover:bg-red-700",
            icon: AlertTriangle
        }
    ];

    const currentStep = steps[step - 1];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100">
                        <motion.div
                            className="h-full bg-red-600"
                            initial={{ width: "33%" }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>

                    <div className="p-8 pt-12 text-center">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="h-48 mb-8 flex items-center justify-center">
                                <img
                                    src={currentStep.illustration}
                                    alt="Illustration"
                                    className="h-full w-auto object-contain drop-shadow-lg"
                                />
                            </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                                    <currentStep.icon className={`w-6 h-6 ${step === 3 ? 'text-red-600' : 'text-gray-700'}`} />
                                    {currentStep.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {currentStep.description}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    onClick={step === 3 ? handleConfirm : handleNext}
                                    disabled={isDeleting}
                                    className={`flex-1 py-3 px-4 rounded-xl text-white font-medium shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 ${currentStep.buttonColor} ${isDeleting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('deleting')}
                                        </>
                                    ) : (
                                        currentStep.buttonText
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
                        {t('step_indicator', { current: step, total: 3 })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
