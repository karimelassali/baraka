// components/dashboard/Profile.jsx
"use client";

import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit3,
  Check,
  X,
  Camera,
  Shield,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
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
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="h-48 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
            <img src="/illus/undraw_a-moment-to-relax_mrkn.svg" className="w-96 h-96" alt="Profile Background" />
          </div>
        </div>

        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row items-end -mt-16 mb-6 gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full p-1 bg-white shadow-xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1.5" />
                  {profile?.email}
                </span>
                <span className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${profile?.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {t('active_member')}
                </span>
              </div>
            </div>

            <div className="mb-2">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center shadow-lg shadow-gray-200"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t('edit')}
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setFormData(profile);
                      setEditing(false);
                      setStatus({ type: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center shadow-lg shadow-red-200"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {t('save')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {status.message && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className={`overflow-hidden rounded-xl flex items-center p-4 ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}
              >
                {status.type === 'success' ? <Check className="w-5 h-5 mr-3 flex-shrink-0" /> : <X className="w-5 h-5 mr-3 flex-shrink-0" />}
                <span className="font-medium">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2 text-red-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('first_name')}
                    </label>
                    {editing ? (
                      <input
                        name="first_name"
                        type="text"
                        value={formData.first_name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2">
                        {profile?.first_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('last_name')}
                    </label>
                    {editing ? (
                      <input
                        name="last_name"
                        type="text"
                        value={formData.last_name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2">
                        {profile?.last_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('email')}
                    </label>
                    <div className="flex items-center text-gray-500 bg-gray-100 px-4 py-2.5 rounded-xl border border-gray-200">
                      <Lock className="w-4 h-4 mr-2" />
                      {profile?.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('phone')}
                    </label>
                    {editing ? (
                      <input
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2 flex items-center">
                        {profile?.phone_number || <span className="text-gray-400 italic text-base">{t('no_phone')}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  Address Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('country')}
                    </label>
                    {editing ? (
                      <select
                        name="country_of_origin"
                        value={formData.country_of_origin || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white"
                      >
                        <option value="">{t('select_country')}</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.name}>
                            {country.flag} {country.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2 flex items-center">
                        {profile?.country_of_origin ? (
                          <>
                            <span className="mr-2 text-2xl">{countries.find(c => c.name === profile.country_of_origin)?.flag}</span>
                            {profile.country_of_origin}
                          </>
                        ) : (
                          <span className="text-gray-400 italic text-base">Not specified</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {t('residence')}
                    </label>
                    {editing ? (
                      <input
                        name="residence"
                        type="text"
                        value={formData.residence || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all bg-white"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium text-lg border-b border-gray-200 pb-2">
                        {profile?.residence || <span className="text-gray-400 italic text-base">{t('no_address')}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border border-red-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-600" />
                  Account Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-50">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(user?.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-50">
                    <span className="text-sm text-gray-600">Last Login</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(user?.last_sign_in_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group">
                    <span>Change Password</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors group">
                    <span>Notification Settings</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors group">
                    <span>Delete Account</span>
                    <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
