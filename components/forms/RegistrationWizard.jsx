// components/forms/RegistrationWizard.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountryFlag from "react-country-flag";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/navigation";
import { Eye, EyeOff } from "lucide-react";
import PhoneInputWithCountry from "@/components/ui/PhoneInputWithCountry";
import { countryCodes } from "@/lib/country-codes";

// Step components
const Step1 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.1.title')}</h2>
        <p className="text-gray-600">{t('steps.1.subtitle')}</p>

        <div className="space-y-4">
            <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.1.first_name')} *</label>
                <input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateForm({ first_name: e.target.value })}
                    placeholder="Maria"
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.first_name ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
            </div>

            <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.1.last_name')} *</label>
                <input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateForm({ last_name: e.target.value })}
                    placeholder="Rossi"
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.last_name ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
            </div>
        </div>
    </motion.div>
);

const Step2 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.2.title')}</h2>
        <p className="text-gray-600">{t('steps.2.subtitle')}</p>

        <div className="space-y-4">
            <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.2.label')} *</label>
                <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateForm({ date_of_birth: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.date_of_birth ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.date_of_birth && (
                    <p className="text-red-500 text-sm mt-1">{errors.date_of_birth}</p>
                )}
            </div>
        </div>
    </motion.div>
);

const Step3 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.3.title')}</h2>
        <p className="text-gray-600">{t('steps.3.subtitle')}</p>

        <div className="space-y-4">
            <div>
                <label htmlFor="residence" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.3.label')} *</label>
                <input
                    id="residence"
                    name="residence"
                    value={formData.residence}
                    onChange={(e) => updateForm({ residence: e.target.value })}
                    placeholder={t('steps.3.placeholder')}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.residence ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.residence && (
                    <p className="text-red-500 text-sm mt-1">{errors.residence}</p>
                )}
            </div>
        </div>
    </motion.div>
);

const Step4 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.4.title')}</h2>
        <p className="text-gray-600">{t('steps.4.subtitle')}</p>

        <div className="space-y-4">
            <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.4.phone')} *</label>
                <PhoneInputWithCountry
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={(val) => updateForm({ phone_number: val })}
                    placeholder="333 123 4567"
                    className={errors.phone_number ? "border-red-500" : "border-gray-300"}
                />
                {errors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.4.email')} *</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm({ email: e.target.value })}
                    placeholder="email@example.com"
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
            </div>
        </div>
    </motion.div>
);



const Step5 = ({ formData, updateForm, errors, t }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            className="space-y-6"
        >
            <h2 className="text-2xl font-bold text-gray-900">{t('steps.5.title')}</h2>
            <p className="text-gray-600">{t('steps.5.subtitle')}</p>

            <div className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.5.password')} *</label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => updateForm({ password: e.target.value })}
                            placeholder={t('steps.5.password_placeholder')}
                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.password ? "border-red-500" : "border-gray-300"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.5.confirm_password')} *</label>
                    <div className="relative">
                        <input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.password_confirmation}
                            onChange={(e) => updateForm({ password_confirmation: e.target.value })}
                            placeholder={t('steps.5.confirm_placeholder')}
                            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.password_confirmation ? "border-red-500" : "border-gray-300"}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    {errors.password_confirmation && (
                        <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const Step6 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.6.title')}</h2>
        <p className="text-gray-600">{t('steps.6.subtitle')}</p>

        <div className="space-y-4">
            <div>
                <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.6.label')} *</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {formData.country_of_origin && (
                            <CountryFlag
                                countryCode={getCountryCode(formData.country_of_origin)}
                                svg
                                style={{ width: '1.5em', height: '1.5em' }}
                            />
                        )}
                    </div>
                    <input
                        id="country_of_origin"
                        name="country_of_origin"
                        value={formData.country_of_origin}
                        onChange={(e) => updateForm({ country_of_origin: e.target.value })}
                        placeholder="Italy"
                        list="countries-list"
                        className={`w-full rounded-lg border px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.country_of_origin ? "border-red-500" : "border-gray-300"}`}
                    />
                </div>
                <datalist id="countries-list">
                    {countryCodes.map((country) => (
                        <option key={country.code} value={country.name} />
                    ))}
                </datalist>
                {errors.country_of_origin && (
                    <p className="text-red-500 text-sm mt-1">{errors.country_of_origin}</p>
                )}
            </div>
        </div>
    </motion.div>
);

const Step7 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.7.title')}</h2>
        <p className="text-gray-600">{t('steps.7.subtitle')}</p>

        <div className="space-y-4">
            <div>
                <label htmlFor="language_preference" className="block text-sm font-medium text-gray-700 mb-1">{t('steps.7.label')}</label>
                <select
                    id="language_preference"
                    value={formData.language_preference}
                    onChange={(e) => updateForm({ language_preference: e.target.value })}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.language_preference ? "border-red-500" : "border-gray-300"}`}
                >
                    <option value="en">English</option>
                    <option value="it">Italiano</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                </select>
            </div>
        </div>
    </motion.div>
);

const Step8 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.8.title')}</h2>
        <p className="text-gray-600">{t('steps.8.subtitle')}</p>

        <div className="space-y-4">
            <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="gdpr_consent"
                    checked={formData.gdpr_consent}
                    onChange={(e) => updateForm({ gdpr_consent: e.target.checked })}
                    className={`h-4 w-4 text-red-600 rounded border-gray-300 ${errors.gdpr_consent ? "border-red-500" : ""}`}
                />
                <div>
                    <label htmlFor="gdpr_consent" className="text-sm font-medium text-gray-700">
                        {t('steps.8.agree')} <Link href="/privacy" className="text-red-600 underline">{t('steps.8.link')}</Link> *
                    </label>
                    {errors.gdpr_consent && (
                        <p className="text-red-500 text-sm">{errors.gdpr_consent}</p>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);

const Step9 = ({ formData, updateForm, errors, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.9.title')}</h2>
        <p className="text-gray-600">{t('steps.9.subtitle')}</p>

        <div className="space-y-4">
            <div className="flex items-start space-x-3">
                <input
                    type="checkbox"
                    id="terms_and_conditions"
                    checked={formData.terms_and_conditions}
                    onChange={(e) => updateForm({ terms_and_conditions: e.target.checked })}
                    className={`h-4 w-4 text-red-600 rounded border-gray-300 ${errors.terms_and_conditions ? "border-red-500" : ""}`}
                />
                <div>
                    <label htmlFor="terms_and_conditions" className="text-sm font-medium text-gray-700">
                        {t('steps.9.accept')} <Link href="/terms" className="text-red-600 underline">{t('steps.9.link')}</Link> *
                    </label>
                    {errors.terms_and_conditions && (
                        <p className="text-red-500 text-sm">{errors.terms_and_conditions}</p>
                    )}
                </div>
            </div>
        </div>
    </motion.div>
);

const Step10 = ({ formData, errors, handleSubmit, loading, t }) => (
    <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "-100%", opacity: 0 }}
        className="space-y-6"
    >
        <h2 className="text-2xl font-bold text-gray-900">{t('steps.10.title')}</h2>
        <p className="text-gray-600">{t('steps.10.subtitle')}</p>

        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <strong>{t('steps.1.first_name')}:</strong>
                <span>{formData.first_name}</span>

                <strong>{t('steps.1.last_name')}:</strong>
                <span>{formData.last_name}</span>

                <strong>{t('steps.2.label')}:</strong>
                <span>{formData.date_of_birth}</span>

                <strong>{t('steps.3.label')}:</strong>
                <span>{formData.residence}</span>

                <strong>{t('steps.4.phone')}:</strong>
                <span>{formData.phone_number}</span>

                <strong>{t('steps.4.email')}:</strong>
                <span>{formData.email}</span>

                <strong>{t('steps.6.label')}:</strong>
                <span>{formData.country_of_origin}</span>

                <strong>{t('steps.7.label')}:</strong>
                <span>{formData.language_preference}</span>

                <strong>GDPR Consent:</strong>
                <span>{formData.gdpr_consent ? t('steps.10.agreed') : t('steps.10.not_agreed')}</span>

                <strong>Terms & Conditions:</strong>
                <span>{formData.terms_and_conditions ? t('steps.10.agreed') : t('steps.10.not_agreed')}</span>
            </div>
        </div>

        <div className="pt-4">
            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-6 text-lg rounded-lg ${loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
            >
                {loading ? t('processing') : t('submit')}
            </button>
        </div>
    </motion.div>
);

// Country code mapping function
// Country code mapping function
const getCountryCode = (countryName) => {
    if (!countryName) return 'UN';
    const found = countryCodes.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    return found ? found.code : 'UN';
};

// Validation functions
const validateStep = (step, formData, t) => {
    const errors = {};

    switch (step) {
        case 1:
            if (!formData.first_name.trim()) errors.first_name = t('errors.required');
            if (!formData.last_name.trim()) errors.last_name = t('errors.required');
            break;
        case 2:
            if (!formData.date_of_birth) errors.date_of_birth = t('errors.required');
            break;
        case 3:
            if (!formData.residence.trim()) errors.residence = t('errors.required');
            break;
        case 4:
            if (!formData.phone_number.trim()) errors.phone_number = t('errors.required');
            else if (!/^[\d +()-]{7,20}$/.test(formData.phone_number))
                errors.phone_number = t('errors.invalid_phone');

            if (!formData.email.trim()) errors.email = t('errors.required');
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                errors.email = t('errors.invalid_email');
            break;
        case 5:
            if (!formData.password) errors.password = t('errors.required');
            else if (formData.password.length < 8)
                errors.password = t('errors.password_length');

            if (!formData.password_confirmation) errors.password_confirmation = t('errors.required');
            else if (formData.password !== formData.password_confirmation)
                errors.password_confirmation = t('errors.password_mismatch');
            break;
        case 6:
            if (!formData.country_of_origin.trim()) errors.country_of_origin = t('errors.required');
            break;
        case 7:
            if (!formData.language_preference) errors.language_preference = t('errors.required');
            break;
        case 8:
            if (!formData.gdpr_consent) errors.gdpr_consent = t('errors.privacy_policy');
            break;
        case 9:
            if (!formData.terms_and_conditions) errors.terms_and_conditions = t('errors.terms');
            break;
        case 10:
            // All fields were validated in previous steps, so just ensure required ones are filled
            if (!formData.first_name.trim()) errors.first_name = t('errors.required');
            if (!formData.last_name.trim()) errors.last_name = t('errors.required');
            if (!formData.date_of_birth) errors.date_of_birth = t('errors.required');
            if (!formData.residence.trim()) errors.residence = t('errors.required');
            if (!formData.phone_number.trim()) errors.phone_number = t('errors.required');
            if (!formData.email.trim()) errors.email = t('errors.required');
            if (!formData.password) errors.password = t('errors.required');
            if (!formData.country_of_origin.trim()) errors.country_of_origin = t('errors.required');
            if (!formData.gdpr_consent) errors.gdpr_consent = t('errors.privacy_policy');
            if (!formData.terms_and_conditions) errors.terms_and_conditions = t('errors.terms');
            break;
    }

    return errors;
};

const ProgressBar = ({ currentStep, totalSteps, t }) => (
    <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
                {t('step')} {currentStep} {t('of')} {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">
                {Math.round((currentStep / totalSteps) * 100)}% {t('complete')}
            </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
                className="bg-red-600 h-2.5 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
            />
        </div>
    </div>
);

// Minimal Language Switcher Component
function LanguageSwitcherTrigger() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const switchLocale = (newLocale) => {
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="flex gap-2 text-sm font-medium text-gray-400">
            <button onClick={() => switchLocale('en')} className={locale === 'en' ? 'text-red-600' : 'hover:text-gray-600'}>EN</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => switchLocale('it')} className={locale === 'it' ? 'text-red-600' : 'hover:text-gray-600'}>IT</button>
            <span className="text-gray-300">|</span>
            <button onClick={() => switchLocale('ar')} className={locale === 'ar' ? 'text-red-600' : 'hover:text-gray-600'}>AR</button>
        </div>
    );
}

export default function RegistrationWizard() {
    const t = useTranslations('Auth.Register');
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 10;

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        residence: "",
        phone_number: "",
        email: "",
        password: "",
        password_confirmation: "",
        country_of_origin: "",
        language_preference: "en",
        gdpr_consent: false,
        terms_and_conditions: false,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState("");
    const [registeredEmail, setRegisteredEmail] = useState("");

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [resendCountdown, setResendCountdown] = useState(60);

    const router = useRouter();

    const STORAGE_KEY = 'registrationWizardState';

    // Restore state from localStorage on mount
    useEffect(() => {
        // First check for OTP pending state (takes priority)
        const pending = localStorage.getItem('pendingRegistration');
        if (pending) {
            try {
                const { phone, email, timestamp } = JSON.parse(pending);
                setFormData(prev => ({ ...prev, phone_number: phone, email: email }));
                setOtpCode("");
                setShowOtpModal(true);
                return; // Don't restore regular state if OTP is pending
            } catch (e) {
                console.error("Failed to parse pending registration", e);
                localStorage.removeItem('pendingRegistration');
            }
        }

        // Restore wizard state
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const { formData: savedFormData, currentStep: savedStep, timestamp } = JSON.parse(savedState);

                // Check if state is less than 24 hours old
                const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
                if (isExpired) {
                    localStorage.removeItem(STORAGE_KEY);
                    return;
                }

                // Restore state (but not passwords for security)
                setFormData(prev => ({
                    ...prev,
                    ...savedFormData,
                    password: "",
                    password_confirmation: ""
                }));
                setCurrentStep(savedStep || 1);
                console.log('[RegistrationWizard] Restored from step', savedStep);
            } catch (e) {
                console.error("Failed to restore registration state", e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, []);

    // Save state to localStorage whenever formData or currentStep changes
    useEffect(() => {
        // Don't save if on first step with empty data (user just started)
        if (currentStep === 1 && !formData.first_name && !formData.last_name) {
            return;
        }

        // Don't save passwords
        const stateToSave = {
            formData: {
                ...formData,
                password: "",
                password_confirmation: ""
            },
            currentStep,
            timestamp: Date.now()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [formData, currentStep]);

    // Function to clear saved state (call on successful completion)
    const clearSavedState = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('pendingRegistration');
    };

    // Countdown timer for resend button
    useEffect(() => {
        let timer;
        if (showOtpModal && resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showOtpModal, resendCountdown]);

    const handleResendOtp = async () => {
        if (resendCountdown > 0 || !formData.phone_number) return;

        setOtpError("");
        try {
            const res = await fetch("/api/auth/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone_number: formData.phone_number })
            });

            if (!res.ok) {
                throw new Error("Invio fallito. Riprova.");
            }

            setResendCountdown(60); // Reset countdown
            setOtpCode(""); // Clear old code
        } catch (err) {
            setOtpError(err.message);
        }
    };

    const updateForm = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));

        // Clear status messages when form changes
        if (status.type) setStatus({ type: "", message: "" });
    };

    const nextStep = () => {
        const newErrors = validateStep(currentStep, formData, t);
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            if (currentStep < totalSteps) {
                setCurrentStep(prev => prev + 1);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        const newErrors = validateStep(10, formData, t);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            // Assemble payload for registration API
            // Client-side Normalization
            let cleanPhone = formData.phone_number.trim().replace(/[^\d+]/g, '');
            // Auto-add +39 rule
            if (!cleanPhone.startsWith('+')) {
                if (cleanPhone.length >= 9 && cleanPhone.length <= 10) {
                    cleanPhone = '+39' + cleanPhone;
                } else if (cleanPhone.startsWith('00')) {
                    cleanPhone = '+' + cleanPhone.substring(2);
                }
            }

            // Update formData phone for consistency in OTP step if needed
            formData.phone_number = cleanPhone;

            const payload = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                date_of_birth: formData.date_of_birth,
                residence: formData.residence.trim(),
                phone_number: cleanPhone,
                email: formData.email.trim().toLowerCase(),
                country_of_origin: formData.country_of_origin.trim(),
                gdpr_consent: true,
                password: formData.password,
                language_preference: formData.language_preference || "en",
            };

            // Call registration API endpoint
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                let errorMessage = result.error || result.message || "Registration failed";

                // Check for duplicate phone error
                if (result.error === "Phone number already exists" || result.details?.[0]?.includes("phone number")) {
                    errorMessage = t('errors.phone_registered') || "This phone number is already registered. Please log in.";
                }
                // Check for duplicate email error in details
                else if (result.details && Array.isArray(result.details)) {
                    const duplicateError = result.details.find(msg => msg.includes('customers_email_key'));
                    if (duplicateError) {
                        errorMessage = t('errors.email_registered') || "This email address is already registered. Please log in.";
                    } else if (result.details.length > 0) {
                        errorMessage = result.details[0];
                    }
                }

                setErrorModalMessage(errorMessage);
                setShowErrorModal(true);
                return;
            }

            // Store the registered email to show in the modal
            setRegisteredEmail(formData.email);

            // Start OTP Flow
            try {
                const otpResponse = await fetch("/api/auth/otp/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone_number: formData.phone_number })
                });

                if (!otpResponse.ok) {
                    throw new Error("Failed to send verification SMS");
                }

                // SAVE STATE TO LOCAL STORAGE for persistence
                localStorage.setItem('pendingRegistration', JSON.stringify({
                    phone: formData.phone_number,
                    email: formData.email,
                    timestamp: Date.now()
                }));

                setShowOtpModal(true);
            } catch (otpErr) {
                console.error("OTP Send Error:", otpErr);
                // If SMS fails, we can't really verify them. 
                // Show error modal instead of failing silently?
                // Or maybe they typed wrong number?
                setErrorModalMessage("Failed to send SMS code. Please check your number.");
                setShowErrorModal(true);
            }

        } catch (err) {
            console.error("Registration error:", err);
            setErrorModalMessage(err?.message || "Registration failed. Try again later.");
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 6) {
            setOtpError("Please enter the valid 6-digit code");
            return;
        }

        setOtpLoading(true);
        setOtpError("");

        try {
            const verifyResponse = await fetch("/api/auth/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone_number: formData.phone_number,
                    code: otpCode
                })
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok) {
                throw new Error(verifyResult.error || "Verification failed");
            }

            // Clear ALL persistent state on success
            clearSavedState();

            // Success! 
            setShowOtpModal(false);

            // User is now verified - redirect to dashboard
            // The user should already have a session from registration, 
            // and now their email is confirmed so they can access the app
            console.log('[Registration] OTP verified, redirecting to dashboard...');

            // Use window.location for full page refresh to ensure session is picked up
            window.location.href = "/dashboard";

        } catch (err) {
            setOtpError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleGotIt = () => {
        setShowConfirmationModal(false);

        // Check for redirect URL in query parameters after registration
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        // Redirect to login page (with potential redirect) after registration
        if (redirectUrl) {
            router.push(`/auth/login?redirect=${redirectUrl}`);
        } else {
            router.push("/auth/login");
        }
    };

    // Get the current step component
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return <Step1 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 2: return <Step2 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 3: return <Step3 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 4: return <Step4 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 5: return <Step5 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 6: return <Step6 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 7: return <Step7 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 8: return <Step8 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 9: return <Step9 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
            case 10: return <Step10 formData={formData} errors={errors} handleSubmit={handleSubmit} loading={loading} t={t} />;
            default: return <Step1 formData={formData} updateForm={updateForm} errors={errors} t={t} />;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row relative z-10"
            >
                {/* Left visual panel */}
                <div className="hidden md:flex md:w-5/12 bg-red-600 relative flex-col justify-center items-center p-12 text-center text-white overflow-hidden">
                    {/* Abstract background pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="grid-reg" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#grid-reg)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        <motion.img
                            src="/illus/undraw_online-profile_v9c1.svg"
                            alt="Join Us"
                            className="w-full max-w-sm mb-8 drop-shadow-md"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        />
                        <h2 className="text-3xl font-bold mb-4">{t('join_community')}</h2>
                        <p className="text-red-100 text-lg">
                            {t('join_desc')}
                        </p>
                    </div>
                </div>

                {/* Form Panel */}
                <div className="flex-1 p-8 md:p-12 lg:p-16 bg-white overflow-y-auto max-h-[90vh] relative">
                    <div className="absolute top-6 right-6 z-20">
                        <LanguageSwitcherTrigger />
                    </div>
                    <div className="max-w-xl mx-auto">
                        <header className="mb-8 text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                                {t('title')}
                            </h1>
                            <p className="text-gray-500">{t('subtitle')}</p>
                        </header>

                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                role="status"
                                className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${status.type === "success"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-700 border border-red-200"
                                    }`}
                            >
                                {status.type === "success" ? (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                )}
                                {status.message}
                            </motion.div>
                        )}

                        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} t={t} />

                        <div className="min-h-[300px] mt-8">
                            <AnimatePresence mode="wait">
                                {renderCurrentStep()}
                            </AnimatePresence>
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-xl font-medium transition-colors ${currentStep === 1
                                    ? "opacity-0 cursor-default"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                {t('back')}
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-8 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    {t('next')}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`px-8 py-3 rounded-xl font-medium shadow-md transition-all flex items-center gap-2 ${loading
                                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                        : "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {t('processing')}
                                        </>
                                    ) : (
                                        <>
                                            {t('submit')}
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                {t('already_account')} <Link href="/auth/login" className="text-red-600 font-medium hover:underline">{t('login_link')}</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Confirmation Modal */}
            {showConfirmationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="bg-green-600 p-6 flex justify-center">
                            <div className="bg-white rounded-full p-3">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                            <p className="text-gray-600 mb-6">
                                Thank you for joining Baraka. We've sent a confirmation email to <strong>{registeredEmail}</strong>.
                            </p>
                            <button
                                onClick={handleGotIt}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Got it, take me to login
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
                    >
                        <div className="bg-red-600 p-6 flex justify-center">
                            <div className="bg-white rounded-full p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <div className="p-6 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Failed</h3>
                            <p className="text-gray-600 mb-6">
                                {errorModalMessage}
                            </p>
                            <button
                                onClick={() => setShowErrorModal(false)}
                                className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* OTP Verification Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
                    >
                        <div className="bg-white p-8 text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Phone</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                We sent a code to <span className="font-semibold text-gray-900">{formData.phone_number}</span>. Enter it below.
                            </p>

                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full text-center text-3xl tracking-[0.5em] font-mono font-bold py-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-50 outline-none transition-all mb-4"
                                autoFocus
                            />

                            {otpError && (
                                <p className="text-red-500 text-sm mb-4 font-medium bg-red-50 py-2 px-3 rounded-lg border border-red-100">
                                    {otpError}
                                </p>
                            )}

                            <button
                                onClick={handleVerifyOtp}
                                disabled={otpLoading}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-red-200"
                            >
                                {otpLoading ? 'Verifying...' : 'Verify Successfully'}
                            </button>

                            {/* Resend Button with Countdown */}
                            <button
                                onClick={handleResendOtp}
                                disabled={resendCountdown > 0}
                                className={`mt-3 w-full py-3 rounded-xl font-medium text-sm transition-all ${resendCountdown > 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {resendCountdown > 0
                                    ? `Reinvia codice (${resendCountdown}s)`
                                    : 'Reinvia codice'}
                            </button>

                            <button
                                onClick={() => {
                                    // Cancel verification -> Clear storage & Return to home
                                    localStorage.removeItem('pendingRegistration');
                                    setShowOtpModal(false);
                                    setResendCountdown(60); // Reset countdown
                                    router.push("/");
                                }}
                                className="mt-4 text-sm text-gray-400 hover:text-gray-600"
                            >
                                Cancel Verification (Logout)
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );

}


