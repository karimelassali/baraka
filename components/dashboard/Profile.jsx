// components/dashboard/Profile.jsx
"use client";

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Globe, MapPin, Edit3, Check, X, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { countries } from '@/lib/constants/countries';

function Skeleton({ compact }) {
  if (compact) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        <div className="h-4 bg-gray-100 rounded w-full"></div>
        <div className="h-4 bg-gray-100 rounded w-2/3"></div>
      </div>
    );
  }
  return (
    <div className="p-8 rounded-xl bg-white border border-gray-200 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );
}

export default function Profile({ compact = false, user }) {
  const t = useTranslations('Dashboard.Profile');
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/customer/profile');
        const data = await response.json();

        if (response.ok) {
          setProfile(data);
          setFormData(data);
        } else {
          console.error('Failed to fetch profile:', data.error);
        }
      } catch (error) {
        console.error('An error occurred while fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setProfile(result);
        setEditing(false);
        setStatus({ type: 'success', message: t('success_update') });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: result.error || t('error_update') });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('error_generic') });
    }
  };

  if (loading) {
    return <Skeleton compact={compact} />;
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500 shadow-sm">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
              alt="User Avatar"
              className="w-full h-full rounded-full bg-white"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : (user?.user_metadata?.full_name || user?.email?.split('@')[0])}
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-[150px]">{profile?.email || user?.email}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm pt-2 border-t border-gray-50">
          {profile?.phone_number ? (
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {profile.phone_number}
            </div>
          ) : (
            <div className="flex items-center text-gray-400 italic">
              <Phone className="w-4 h-4 mr-2 text-gray-300" />
              {t('no_phone')}
            </div>
          )}
          {profile?.residence ? (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {profile.residence}
            </div>
          ) : (
            <div className="flex items-center text-gray-400 italic">
              <MapPin className="w-4 h-4 mr-2 text-gray-300" />
              {t('no_address')}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-red-500 to-orange-500 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
              <div className="w-full h-full rounded-full p-0.5 bg-gradient-to-br from-red-500 to-orange-500">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  alt="User Avatar"
                  className="w-full h-full rounded-full bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-gray-500">{profile?.email}</p>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">{t('active_member')}</span>
            </div>
          </div>

          <AnimatePresence>
            {status.message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
              >
                {status.type === 'success' ? <Check className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          {profile && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    {t('first_name')}
                  </label>
                  <input
                    name="first_name"
                    type="text"
                    value={formData.first_name || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200 ${editing ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    {t('last_name')}
                  </label>
                  <input
                    name="last_name"
                    type="text"
                    value={formData.last_name || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200 ${editing ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-1.5 text-gray-400" />
                    {t('phone')}
                  </label>
                  <input
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200 ${editing ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Globe className="w-4 h-4 mr-1.5 text-gray-400" />
                    {t('country')}
                  </label>
                  <select
                    name="country_of_origin"
                    value={formData.country_of_origin || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200 ${editing ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  >
                    <option value="">{t('select_country')}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                    {t('residence')}
                  </label>
                  <input
                    name="residence"
                    type="text"
                    value={formData.residence || ''}
                    onChange={handleChange}
                    disabled={!editing}
                    className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all duration-200 ${editing ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 flex justify-end">
                {editing ? (
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(profile);
                        setEditing(false);
                        setStatus({ type: '', message: '' });
                      }}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex items-center"
                    >
                      <X className="w-4 h-4 mr-1.5" />
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center shadow-md shadow-red-200"
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      {t('save')}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center shadow-sm"
                  >
                    <Edit3 className="w-4 h-4 mr-1.5" />
                    {t('edit')}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}
