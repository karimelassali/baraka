// components/StepByStepRegistration.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import CountryFlag from "react-country-flag";
import { useI18n } from '../../lib/i18n';

// Step components
const Step1 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">{t('auth_personal_information')}</h2>
      <p className="text-gray-600">{t('auth_start_with_name')}</p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_first_name')} *</label>
          <input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={(e) => updateForm({ first_name: e.target.value })}
            placeholder={t('auth_first_name')}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.first_name ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_last_name')} *</label>
          <input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={(e) => updateForm({ last_name: e.target.value })}
            placeholder={t('auth_last_name')}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.last_name ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
};

const Step2 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_date_of_birth')}</h2>
    <p className="text-gray-600">{t('auth_when_were_you_born')}</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_date_of_birth')} *</label>
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
)};

const Step3 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_residence')}</h2>
    <p className="text-gray-600">{t('auth_where_do_you_live')}</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="residence" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_city_address')} *</label>
        <input
          id="residence"
          name="residence"
          value={formData.residence}
          onChange={(e) => updateForm({ residence: e.target.value })}
          placeholder={t('auth_city_address')}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.residence ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.residence && (
          <p className="text-red-500 text-sm mt-1">{errors.residence}</p>
        )}
      </div>
    </div>
  </motion.div>
)};

const Step4 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_contact_information')}</h2>
    <p className="text-gray-600">{t('auth_how_can_we_reach_you')}</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_phone_number')} *</label>
        <input
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={(e) => updateForm({ phone_number: e.target.value })}
          placeholder="+39 123 456 789"
          inputMode="tel"
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.phone_number ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.phone_number && (
          <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_email_address')} *</label>
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
)};

const Step5 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_security')}</h2>
    <p className="text-gray-600">{t('auth_secure_your_account')}</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_password')} *</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={(e) => updateForm({ password: e.target.value })}
          placeholder={t('auth_password_placeholder')}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.password ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_confirm_password')} *</label>
        <input
          id="password_confirmation"
          name="password_confirmation"
          type="password"
          value={formData.password_confirmation}
          onChange={(e) => updateForm({ password_confirmation: e.target.value })}
          placeholder={t('auth_confirm_password_placeholder')}
          className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${errors.password_confirmation ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.password_confirmation && (
          <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>
        )}
      </div>
    </div>
  </motion.div>
)};

const Step6 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_country_of_origin')}</h2>
    <p className="text-gray-600">{t('auth_where_are_you_from')}</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700 mb-1">{t('auth_country_of_origin')} *</label>
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
          <option>Italy</option>
          <option>France</option>
          <option>Spain</option>
          <option>United States</option>
          <option>United Kingdom</option>
          <option>Germany</option>
          <option>Algeria</option>
          <option>Angola</option>
          <option>Argentina</option>
          <option>Australia</option>
          <option>Austria</option>
          <option>Belgium</option>
          <option>Brazil</option>
          <option>Canada</option>
          <option>China</option>
          <option>Egypt</option>
          <option>India</option>
          <option>Japan</option>
          <option>Mexico</option>
          <option>Morocco</option>
          <option>Nigeria</option>
          <option>Russia</option>
          <option>Saudi Arabia</option>
          <option>South Africa</option>
          <option>Turkey</option>
        </datalist>
        {errors.country_of_origin && (
          <p className="text-red-500 text-sm mt-1">{errors.country_of_origin}</p>
        )}
      </div>
    </div>
  </motion.div>
)};

const Step7 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_language_preference')}</h2>
    <p className="text-gray-600">{t('auth_which_language')}</p>
    
    <div className="space-y-4">
      <div>
        <label htmlFor="language_preference" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
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
)};

const Step8 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_privacy_policy')}</h2>
    <p className="text-gray-600">{t('auth_privacy_policy_consent')}</p>
    
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
            {t('auth_i_agree_privacy')} <a href="/privacy" className="text-red-600 underline">{t('auth_privacy_policy')}</a> *
          </label>
          {errors.gdpr_consent && (
            <p className="text-red-500 text-sm">{errors.gdpr_consent}</p>
          )}
        </div>
      </div>
    </div>
  </motion.div>
)};

const Step9 = ({ formData, updateForm, errors }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_terms_and_conditions')}</h2>
    <p className="text-gray-600">{t('auth_terms_and_conditions_consent')}</p>
    
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
            {t('auth_i_accept_terms')} <a href="/terms" className="text-red-600 underline">{t('auth_terms_and_conditions')}</a> *
          </label>
          {errors.terms_and_conditions && (
            <p className="text-red-500 text-sm">{errors.terms_and_conditions}</p>
          )}
        </div>
      </div>
    </div>
  </motion.div>
)};

const Step10 = ({ formData, errors, handleSubmit, loading }) => {
  const { t } = useI18n();
  return (
  <motion.div
    initial={{ x: "100%", opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: "-100%", opacity: 0 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900">{t('auth_review_submit')}</h2>
    <p className="text-gray-600">{t('auth_review_your_information')}</p>
    
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <strong>{t('auth_first_name')}:</strong>
        <span>{formData.first_name}</span>
        
        <strong>{t('auth_last_name')}:</strong>
        <span>{formData.last_name}</span>
        
        <strong>{t('auth_date_of_birth')}:</strong>
        <span>{formData.date_of_birth}</span>
        
        <strong>{t('auth_residence')}:</strong>
        <span>{formData.residence}</span>
        
        <strong>{t('auth_phone_number')}:</strong>
        <span>{formData.phone_number}</span>
        
        <strong>{t('auth_email_address')}:</strong>
        <span>{formData.email}</span>
        
        <strong>{t('auth_country_of_origin')}:</strong>
        <span>{formData.country_of_origin}</span>
        
        <strong>{t('auth_language_preference')}:</strong>
        <span>{formData.language_preference}</span>
        
        <strong>{t('auth_gdpr_consent')}:</strong>
        <span>{formData.gdpr_consent ? t('auth_agreed') : t('auth_not_agreed')}</span>
        
        <strong>{t('auth_terms_and_conditions')}:</strong>
        <span>{formData.terms_and_conditions ? t('auth_agreed') : t('auth_not_agreed')}</span>
      </div>
    </div>
    
    <div className="pt-4">
      <button 
        type="button"
        onClick={handleSubmit} 
        disabled={loading}
        className={`w-full py-6 text-lg rounded-lg ${
          loading 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        {loading ? t('auth_processing') : t('auth_complete_registration')}
      </button>
    </div>
  </motion.div>
)};

// Country code mapping function
const getCountryCode = (countryName) => {
  const countryMap = {
    'Italy': 'IT',
    'France': 'FR',
    'Spain': 'ES',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Germany': 'DE',
    'Algeria': 'DZ',
    'Angola': 'AO',
    'Argentina': 'AR',
    'Australia': 'AU',
    'Austria': 'AT',
    'Belgium': 'BE',
    'Brazil': 'BR',
    'Canada': 'CA',
    'China': 'CN',
    'Egypt': 'EG',
    'India': 'IN',
    'Japan': 'JP',
    'Mexico': 'MX',
    'Morocco': 'MA',
    'Nigeria': 'NG',
    'Russia': 'RU',
    'Saudi Arabia': 'SA',
    'South Africa': 'ZA',
    'Turkey': 'TR',
    'Algeria': 'DZ',
    'Libya': 'LY',
    'Mali': 'ML',
    'Mauritania': 'MR',
    'Niger': 'NE',
    'Tunisia': 'TN',
    'Lebanon': 'LB',
    'Jordan': 'JO',
    'Iraq': 'IQ',
    'Syria': 'SY',
    'Yemen': 'YE',
    'Oman': 'OM',
    'UAE': 'AE',
    'Kuwait': 'KW',
    'Qatar': 'QA',
    'Bahrain': 'BH',
    'Iran': 'IR'
  };

  // Handle special cases and normalize input
  if (countryName.toLowerCase().includes('united states')) return 'US';
  if (countryName.toLowerCase().includes('united kingdom')) return 'GB';
  if (countryName.toLowerCase().includes('south africa')) return 'ZA';
  if (countryName.toLowerCase().includes('saudi arabia')) return 'SA';

  return countryMap[countryName] || 'UN'; // Use 'UN' for unknown countries
};

// Validation functions
const validateStep = (step, formData, t) => {
  const errors = {};
  
  switch(step) {
    case 1:
      if (!formData.first_name.trim()) errors.first_name = t('auth_first_name_error');
      if (!formData.last_name.trim()) errors.last_name = t('auth_last_name_error');
      break;
    case 2:
      if (!formData.date_of_birth) errors.date_of_birth = t('auth_dob_error');
      break;
    case 3:
      if (!formData.residence.trim()) errors.residence = t('auth_residence_error');
      break;
    case 4:
      if (!formData.phone_number.trim()) errors.phone_number = t('auth_phone_error');
      else if (!/^[\d +()-]{7,20}$/.test(formData.phone_number)) 
        errors.phone_number = t('auth_phone_error_invalid');
      
      if (!formData.email.trim()) errors.email = t('auth_email_error');
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) 
        errors.email = t('auth_email_error_invalid');
      break;
    case 5:
      if (!formData.password) errors.password = t('auth_password_error');
      else if (formData.password.length < 8) 
        errors.password = t('auth_password_error_length');
      
      if (!formData.password_confirmation) errors.password_confirmation = t('auth_password_confirmation_error');
      else if (formData.password !== formData.password_confirmation) 
        errors.password_confirmation = t('auth_password_confirmation_error_match');
      break;
    case 6:
      if (!formData.country_of_origin.trim()) errors.country_of_origin = t('auth_country_error');
      break;
    case 7:
      if (!formData.language_preference) errors.language_preference = t('auth_language_error');
      break;
    case 8:
      if (!formData.gdpr_consent) errors.gdpr_consent = t('auth_privacy_error');
      break;
    case 9:
      if (!formData.terms_and_conditions) errors.terms_and_conditions = t('auth_terms_error');
      break;
    case 10:
      // All fields were validated in previous steps, so just ensure required ones are filled
      if (!formData.first_name.trim()) errors.first_name = t('auth_first_name_error');
      if (!formData.last_name.trim()) errors.last_name = t('auth_last_name_error');
      if (!formData.date_of_birth) errors.date_of_birth = t('auth_dob_error');
      if (!formData.residence.trim()) errors.residence = t('auth_residence_error');
      if (!formData.phone_number.trim()) errors.phone_number = t('auth_phone_error');
      if (!formData.email.trim()) errors.email = t('auth_email_error');
      if (!formData.password) errors.password = t('auth_password_error');
      if (!formData.country_of_origin.trim()) errors.country_of_origin = t('auth_country_error');
      if (!formData.gdpr_consent) errors.gdpr_consent = t('auth_privacy_error');
      if (!formData.terms_and_conditions) errors.terms_and_conditions = t('auth_terms_error');
      break;
  }
  
  return errors;
};

const ProgressBar = ({ currentStep, totalSteps }) => {
  const { t } = useI18n();
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
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
  )
};

export default function StepByStepRegistration() {
  const { t } = useI18n();
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
  const [registeredEmail, setRegisteredEmail] = useState("");
  
  const router = useRouter();

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
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        date_of_birth: formData.date_of_birth, // ISO date string from <input type="date">
        residence: formData.residence.trim(),
        phone_number: formData.phone_number.trim(),
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
        throw new Error(result.error || result.message || t('auth_registration_failed'));
      }

      // Store the registered email to show in the modal
      setRegisteredEmail(formData.email);
      
      // Show confirmation modal instead of redirecting immediately
      setShowConfirmationModal(true);

    } catch (err) {
      console.error("Registration error:", err);
      setStatus({
        type: "error",
        message: err?.message || t('auth_registration_failed'),
      });
    } finally {
      setLoading(false);
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
    switch(currentStep) {
      case 1: return <Step1 formData={formData} updateForm={updateForm} errors={errors} />;
      case 2: return <Step2 formData={formData} updateForm={updateForm} errors={errors} />;
      case 3: return <Step3 formData={formData} updateForm={updateForm} errors={errors} />;
      case 4: return <Step4 formData={formData} updateForm={updateForm} errors={errors} />;
      case 5: return <Step5 formData={formData} updateForm={updateForm} errors={errors} />;
      case 6: return <Step6 formData={formData} updateForm={updateForm} errors={errors} />;
      case 7: return <Step7 formData={formData} updateForm={updateForm} errors={errors} />;
      case 8: return <Step8 formData={formData} updateForm={updateForm} errors={errors} />;
      case 9: return <Step9 formData={formData} updateForm={updateForm} errors={errors} />;
      case 10: return <Step10 formData={formData} errors={errors} handleSubmit={handleSubmit} loading={loading} />;
      default: return <Step1 formData={formData} updateForm={updateForm} errors={errors} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-black overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left visual panel */}
            <div className="hidden md:flex flex-col justify-center items-center gap-4 p-8 bg-gradient-to-br from-red-900 to-red-500 text-white">
              <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center">
                <img className="rounded-full w-full h-full" src="/logo.jpeg" alt="" />
              </div>
              <h2 className="text-2xl font-semibold">Join our community</h2>
              <p className="text-sm text-white/90 text-center px-2">
                Fast registration, secure storage, and access to your personal
                area. We respect your privacy.
              </p>
            </div>

            {/* Form */}
            <div className="p-6 md:p-10">
              <header className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-red-600">
                  Customer Registration
                </h1>
                <p className="text-sm text-gray-600">Step-by-step registration process</p>
              </header>

              {status.message && (
                <div
                  role="status"
                  className={`mb-4 px-4 py-3 rounded-md text-sm ${
                    status.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

              <AnimatePresence mode="wait">
                {renderCurrentStep()}
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-4 py-2 rounded-lg border ${
                    currentStep === 1 
                      ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" 
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t('auth_back')}
                </button>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {t('auth_next')}
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg ${
                      loading 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {loading ? t('auth_processing') : t('auth_complete_registration')}
                  </button>
                )}
              </div>

              {/* micro footer */}
              <footer className="mt-4 text-xs text-gray-500">
                {t('auth_already_registered')}{" "}
                <a href="/auth/login" className="text-red-600 underline">{t('auth_login_here')}</a>
                <span className="block mt-1">
                  {t('auth_need_help')}{" "}
                  <a className="text-red-600 underline">{t('auth_contact_support')}</a>
                </span>
              </footer>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          >
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth_registration_complete')}</h2>
            <p className="text-gray-600 mb-6">
              {t('auth_confirmation_sent')} <span className="font-semibold">{registeredEmail}</span>.
              {t('auth_check_your_email')}
            </p>
            <button
              onClick={handleGotIt}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
            >
              {t('auth_got_it')}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
