"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, MapPin, Globe, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { countries } from '@/lib/constants/countries';

export default function WaitlistLanding() {
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [language, setLanguage] = useState('en'); // 'en', 'it', 'ar'

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        city: '',
        country: ''
    });

    // Translations
    const t = {
        en: {
            title: "Coming Soon",
            subtitle: "Join the exclusive waitlist today.",
            successTitle: "You're on the list!",
            successSubtitle: "We're gonna inform you when we are open.",
            contact: "We'll contact you at:",
            firstName: "First Name",
            lastName: "Last Name",
            phone: "Phone Number",
            email: "Email Address (Optional)",
            country: "Select Country",
            city: "City (Optional)",
            next: "Next Step",
            join: "Join Waitlist",
            step1: "Let's start with your name",
            step2: "How can we reach you?",
            step3: "Where are you located?",
            warningTitle: "Notice",
            close: "Close"
        },
        it: {
            title: "Prossimamente",
            subtitle: "Iscriviti alla lista d'attesa esclusiva oggi.",
            successTitle: "Sei in lista!",
            successSubtitle: "Ti informeremo quando apriremo.",
            contact: "Ti contatteremo a:",
            firstName: "Nome",
            lastName: "Cognome",
            phone: "Numero di Telefono",
            email: "Indirizzo Email (Opzionale)",
            country: "Seleziona Paese",
            city: "Città (Opzionale)",
            next: "Prossimo",
            join: "Iscriviti",
            step1: "Iniziamo con il tuo nome",
            step2: "Come possiamo contattarti?",
            step3: "Dove ti trovi?",
            warningTitle: "Avviso",
            close: "Chiudi"
        },
        ar: {
            title: "قريباً",
            subtitle: "انضم إلى قائمة الانتظار الحصرية اليوم.",
            successTitle: "أنت في القائمة!",
            successSubtitle: "سنقوم بإعلامك عندما نفتح.",
            contact: "سنتصل بك على:",
            firstName: "الاسم الأول",
            lastName: "اسم العائلة",
            phone: "رقم الهاتف",
            email: "البريد الإلكتروني (اختياري)",
            country: "اختر الدولة",
            city: "المدينة (اختياري)",
            next: "التالي",
            join: "انضم للقائمة",
            step1: "لنبدأ باسمك",
            step2: "كيف يمكننا التواصل معك؟",
            step3: "أين تقع؟",
            warningTitle: "تنبيه",
            close: "إغلاق"
        }
    };

    // Check Local Storage on Mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('baraka_waitlist_joined');
            if (saved) {
                setSuccess(true);
            }
            const savedLang = localStorage.getItem('baraka_language');
            if (savedLang && ['en', 'it', 'ar'].includes(savedLang)) {
                setLanguage(savedLang);
            }
        }
    }, []);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('baraka_language', lang);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleCountrySelect = (countryName) => {
        setFormData({ ...formData, country: countryName });
        setError('');
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                setError('Please enter your First Name and Last Name.');
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.phoneNumber.trim()) {
                setError('Please enter your Phone Number.');
                return false;
            }
        } else if (currentStep === 3) {
            if (!formData.country) {
                setError('Please select your Country.');
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
            setError('');
        }
    };

    const prevStep = () => {
        setStep(step - 1);
        setError('');
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setLoading(true);
        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setWarningMessage(data.error);
                    setShowWarning(true);
                    return;
                }
                throw new Error(data.error || 'Something went wrong');
            }

            setSuccess(true);
            localStorage.setItem('baraka_waitlist_joined', 'true');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentT = t[language];
    const isRTL = language === 'ar';

    return (
        <div className={`min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Language Switcher */}
            <div className="absolute top-6 z-50">
                <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-full p-1.5 shadow-lg flex gap-1">
                    {[
                        { code: 'en', label: 'English', flag: '🇬🇧' },
                        { code: 'it', label: 'Italiano', flag: '🇮🇹' },
                        { code: 'ar', label: 'العربية', flag: '🇸🇦' }
                    ].map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${language === lang.code
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span>{lang.flag}</span>
                            <span className="hidden sm:inline">{lang.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8"
                >
                    <div className="w-24 h-24 mx-auto mb-6 relative rounded-full overflow-hidden border-4 border-white shadow-xl">
                        <Image src="/logo.jpeg" alt="Baraka Logo" fill className="object-cover" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 text-gray-900">
                        {currentT.title}
                    </h1>
                    <p className="text-gray-500">{currentT.subtitle}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl shadow-gray-200/50"
                >
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </motion.div>
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">{currentT.successTitle}</h2>
                                <p className="text-gray-500 mb-6">
                                    {currentT.successSubtitle}
                                </p>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-sm text-gray-400">{currentT.contact}</p>
                                    <p className="font-medium text-gray-900">{formData.phoneNumber || localStorage.getItem('baraka_phone')}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="form" className="relative">
                                {/* Progress Bar */}
                                <div className="flex justify-between mb-8 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                                    <div
                                        className={`absolute top-1/2 ${isRTL ? 'right-0' : 'left-0'} h-1 bg-red-600 -translate-y-1/2 rounded-full transition-all duration-300`}
                                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                                    ></div>
                                    {[1, 2, 3].map((s) => (
                                        <div
                                            key={s}
                                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white text-gray-400 border-2 border-gray-100'
                                                }`}
                                        >
                                            {s}
                                        </div>
                                    ))}
                                </div>

                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div className="min-h-[200px]">
                                        {step === 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                <h3 className="text-xl font-semibold mb-4 text-gray-900">{currentT.step1}</h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleChange}
                                                            placeholder={`${currentT.firstName} *`}
                                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleChange}
                                                            placeholder={`${currentT.lastName} *`}
                                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 2 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                <h3 className="text-xl font-semibold mb-4 text-gray-900">{currentT.step2}</h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <Phone className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                                        <input
                                                            type="tel"
                                                            name="phoneNumber"
                                                            value={formData.phoneNumber}
                                                            onChange={handleChange}
                                                            placeholder={`${currentT.phone} *`}
                                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                                        />
                                                    </div>
                                                    <div className="relative">
                                                        <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleChange}
                                                            placeholder={currentT.email}
                                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {step === 3 && (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                <h3 className="text-xl font-semibold mb-4 text-gray-900">{currentT.step3}</h3>
                                                <div className="space-y-4">
                                                    <div className="relative">
                                                        <Globe className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                                        <select
                                                            name="country"
                                                            value={formData.country}
                                                            onChange={(e) => handleCountrySelect(e.target.value)}
                                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all appearance-none`}
                                                        >
                                                            <option value="" className="text-gray-500">{currentT.country} *</option>
                                                            {countries.map((c) => (
                                                                <option key={c.code} value={c.name} className="text-gray-900">
                                                                    {c.flag} {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="relative">
                                                        <MapPin className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            placeholder={currentT.city}
                                                            className={`w-full bg-gray-50 border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all`}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-500 text-sm mt-2 text-center"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <div className="flex gap-3 mt-8">
                                        {step > 1 && (
                                            <button
                                                onClick={prevStep}
                                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}

                                        {step < 3 ? (
                                            <button
                                                onClick={nextStep}
                                                className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2"
                                            >
                                                {currentT.next} <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>{currentT.join} <CheckCircle className="w-5 h-5" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        >
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-gray-900">{currentT.warningTitle}</h3>
                            <p className="text-gray-600 text-center mb-6">
                                {warningMessage}
                            </p>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                            >
                                {currentT.close}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
