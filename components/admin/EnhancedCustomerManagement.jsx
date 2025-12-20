// components/admin/EnhancedCustomerManagement.jsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Check,
  Search,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Loader,
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  Shield,
  Globe,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { useSearchParams } from 'next/navigation';
import { countries } from '../../lib/constants/countries';
import { useTranslations } from 'next-intl';
import { getAvatarUrl } from '@/lib/avatar';
import { formatDistanceToNow } from 'date-fns';

// --- Components ---

function AddCustomerModal({ isOpen, onClose, onSave }) {
  const t = useTranslations('Admin.Customers');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country_of_origin: '',
    residence: '',
    date_of_birth: '',
    password: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        country_of_origin: '',
        residence: '',
        date_of_birth: '',
        password: ''
      });
      setStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.first_name,
          lastName: formData.last_name,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone_number,
          country_of_origin: formData.country_of_origin,
          residence: formData.residence,
          date_of_birth: formData.date_of_birth,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: t('success_create') });
        onSave && onSave(result.user);
        setTimeout(() => {
          onClose();
          setStatus({ type: '', message: '' });
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || t('error_create') });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('error_generic') });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-background/95 border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="p-6">
          <div className="flex flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                {t('modal_add_title')}
              </h2>
              <p className="text-muted-foreground mt-1 ml-12">{t('modal_add_desc')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb - 6 p - 4 rounded - xl border ${status.type === 'success'
                ? 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                : 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                } `}
            >
              <div className="flex items-center gap-2">
                {status.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                <span className="font-medium">{status.message}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_first_name')}</label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_last_name')}</label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_email')}</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_password')}</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_phone')}</label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_country')}</label>
                <select
                  name="country_of_origin"
                  value={formData.country_of_origin}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  <option value="">{t('all_countries')}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_residence')}</label>
                <input
                  name="residence"
                  value={formData.residence}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_dob')}</label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-border/50">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground">
                {loading ? t('creating') : t('create')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function EditCustomerModal({ customer, isOpen, onClose, onSave }) {
  const t = useTranslations('Admin.Customers');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    country_of_origin: '',
    residence: '',
    date_of_birth: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        country_of_origin: customer.country_of_origin || '',
        residence: customer.residence || '',
        date_of_birth: customer.date_of_birth || ''
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: t('success_update') });
        onSave && onSave({ ...customer, ...formData });
        setTimeout(() => onClose(), 1500);
      } else {
        setStatus({ type: 'error', message: result.error || t('error_update') });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('error_generic') });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-background/95 border border-border/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="p-6">
          <div className="flex flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Edit className="h-6 w-6 text-blue-500" />
                </div>
                {t('modal_edit_title')}
              </h2>
              <p className="text-muted-foreground mt-1 ml-12">{t('modal_edit_desc', { name: customer.first_name })}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {status.message && (
            <div className={`mb - 6 p - 4 rounded - xl border ${status.type === 'success' ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'} `}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_first_name')}</label>
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_last_name')}</label>
                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_email')}</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_phone')}</label>
                <input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_country')}</label>
                <select
                  name="country_of_origin"
                  value={formData.country_of_origin}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="">{t('all_countries')}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('form_residence')}</label>
                <input
                  name="residence"
                  value={formData.residence}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">{t('form_dob')}</label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-input rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-border/50">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

const CustomerGridCard = ({ customer, onEdit }) => {
  const hasIssues = !customer.first_name || !customer.last_name || !customer.email || customer.email.includes('noemail') || !customer.country_of_origin;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <GlassCard className="h-full border-border/50 hover:border-primary/50 transition-colors overflow-hidden relative flex flex-col">
        {hasIssues && (
          <div className="absolute top-4 left-4 z-10" title="Missing Information">
            <div className="p-2 bg-red-500/10 rounded-full text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(customer)} className="rounded-full hover:bg-primary/10 hover:text-primary">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(customer, 'delete')} className="rounded-full hover:bg-red-500/10 hover:text-red-500 text-muted-foreground/50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <CardContent className="p-6 flex flex-col items-center text-center pt-8 flex-1">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner relative overflow-visible border-2 border-primary/10">
            <img
              src={getAvatarUrl(customer.first_name)}
              alt={customer.first_name}
              className="w-full h-full object-cover rounded-full overflow-hidden"
            />
            {customer.email_confirmed && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-background z-10 shadow-sm">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            {(() => {
              const countryCode = countries.find(c => c.name === customer.country_of_origin)?.code?.toLowerCase();
              return countryCode ? (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-background overflow-hidden z-20 shadow-md bg-white">
                  <img
                    src={`https://flagcdn.com/w80/${countryCode}.png`}
                    alt={customer.country_of_origin}
                    className="w-full h-full object-cover"
                  />
                </div >
              ) : null;
            })()}
          </div >

          <h3 className="font-bold text-lg truncate w-full px-2">{customer.first_name} {customer.last_name}</h3>
          <p className="text-sm text-muted-foreground truncate w-full px-2 mb-1">{customer.email}</p>
          <p className="text-xs text-muted-foreground/70 mb-4">
            Since {customer.created_at ? formatDistanceToNow(new Date(customer.created_at)) : 'N/A'}
          </p>

          <div className="w-full grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border/50">
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
              <MapPin className="w-4 h-4 text-muted-foreground mb-1" />
              <div className="flex items-center gap-1 text-xs font-medium truncate w-full justify-center">
                <span>{countries.find(c => c.name === customer.country_of_origin)?.flag}</span>
                <span className="truncate">{customer.country_of_origin || 'N/A'}</span>
              </div>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
              <Phone className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-medium truncate w-full text-center">{customer.phone_number || 'N/A'}</span>
            </div>
          </div>
        </CardContent >
      </GlassCard >
    </motion.div >
  );
};

function DataQualityModal({ issues, isOpen, onClose, onEdit }) {
  const t = useTranslations('Admin.Customers');
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    return issue.missing.includes(filter);
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-background/95 border border-border/50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-6 w-6" />
              {t('quality_issues_title') || 'Data Quality Issues'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t('quality_issues_desc') || 'The following customers have missing or invalid information.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 appearance-none"
              >
                <option value="all">All Issues</option>
                <option value="name">Missing Name</option>
                <option value="email">Invalid Email</option>
                <option value="location">Missing Location</option>
              </select>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No issues found matching this filter.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={getAvatarUrl(issue.first_name || 'unknown')}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">
                      {issue.first_name || issue.last_name ? `${issue.first_name || ''} ${issue.last_name || ''}` : 'Unknown Name'}
                    </h4>
                    <p className="text-xs text-muted-foreground">{issue.email || 'No Email'}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{issue.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {issue.missing.includes('name') && (
                      <Badge variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                        Missing Name
                      </Badge>
                    )}
                    {issue.missing.includes('email') && (
                      <Badge variant="outline" className="text-xs border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300">
                        Invalid Email
                      </Badge>
                    )}
                    {issue.missing.includes('location') && (
                      <Badge variant="outline" className="text-xs border-yellow-200 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                        Missing Location
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onEdit(issue);
                      onClose();
                    }}
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DeleteCustomerModal({ customer, isOpen, onClose, onDelete }) {
  const t = useTranslations('Admin.Customers');
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && customer) {
      setLoading(true);
      fetch(`/api/admin/customers/${customer.id}/details`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching details:', err);
          setLoading(false);
        });
    }
  }, [isOpen, customer]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onDelete(customer);
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen || !customer) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
      <motion.div
        className="bg-background/95 border border-red-200 dark:border-red-900/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="p-6 bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900 dark:text-red-400">
                {t('delete_customer_title') || 'Delete Customer'}
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300/80">
                {t('delete_customer_desc') || 'Are you sure you want to remove this customer?'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
              <img
                src={getAvatarUrl(customer.first_name)}
                alt={customer.first_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">{customer.first_name} {customer.last_name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : details ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider mb-1">Vouchers</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{details.vouchers.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">Points</p>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{details.points}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase tracking-wider mb-1">Eid Reservations</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{details.eidReservations.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase tracking-wider mb-1">Joined</p>
                  <p className="text-sm font-bold text-green-700 dark:text-green-300 mt-1">
                    {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {details.history.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent History</p>
                  <div className="space-y-2">
                    {details.history.map((log) => (
                      <div key={log.id} className="text-xs p-2 bg-muted/50 rounded-lg flex justify-between">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-muted-foreground">{formatDistanceToNow(new Date(log.created_at))} ago</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Could not load details.</p>
          )}

          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-sm text-red-800 dark:text-red-300">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>
                {t('delete_warning') || 'Warning: This action will deactivate the user account. They will no longer be able to log in.'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/10">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting || loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {t('deleting') || 'Deleting...'}
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('confirm_delete') || 'Delete Customer'}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

export default function EnhancedCustomerManagement() {
  const t = useTranslations('Admin.Customers');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const searchParams = useSearchParams();

  const LIMIT = 12; // Adjusted for grid

  // Filter states
  const [locationFilter, setLocationFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  // Quality Check State
  const [qualityIssues, setQualityIssues] = useState([]);
  const [showQualityModal, setShowQualityModal] = useState(false);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const checkQuality = async () => {
    try {
      const res = await fetch('/api/admin/customers/quality-check');
      const data = await res.json();
      if (data.issues) {
        setQualityIssues(data.issues);
      }
    } catch (error) {
      console.error('Failed to check quality:', error);
    }
  };

  useEffect(() => {
    checkQuality();
  }, []);

  const loadCustomers = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;

    if (reset) {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let url = `/api/admin/customers?limit=${LIMIT}&offset=${currentOffset}`;

      // Add sorting
      url += `&sort_by=${sortField}&sort_order=${sortDirection}`;

      // Add search
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }

      // Add filters
      if (locationFilter) {
        url += `&country=${encodeURIComponent(locationFilter)}`;
      }

      // Note: verifiedFilter is not currently supported by the API for filtering, 
      // but we can add it if needed. For now, we'll filter client-side or ignore it.
      // Ideally, the API should support 'is_verified'.

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        const newCustomers = data.customers || [];
        if (reset) {
          setCustomers(newCustomers);
        } else {
          setCustomers(prev => [...prev, ...newCustomers]);
        }
        if (newCustomers.length < LIMIT) {
          setHasMore(false);
        } else {
          setOffset(currentOffset + LIMIT);
        }
      } else {
        if (reset) setCustomers([]);
      }
    } catch (error) {
      if (reset) setCustomers([]);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadCustomers(true);
  }, [searchTerm, sortField, sortDirection, locationFilter]);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) setSearchTerm(search);
  }, [searchParams]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const loadMoreCustomers = async () => {
    if (!hasMore || loadingMore) return;
    await loadCustomers(false);
  };

  const handleEditClick = (customer, action = 'edit') => {
    if (action === 'delete') {
      setCustomerToDelete(customer);
      setShowDeleteModal(true);
    } else {
      setSelectedCustomer(customer);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    try {
      const response = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from list
        setCustomers(prev => prev.filter(c => c.id !== customer.id));
        // Also remove from quality issues if present
        setQualityIssues(prev => prev.filter(i => i.id !== customer.id));
      } else {
        console.error('Failed to delete customer');
        // Optionally show error toast
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };



  return (
    <motion.div
      className="space-y-8 pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Quality Alert Section */}
      <AnimatePresence>
        {qualityIssues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <div
              onClick={() => setShowQualityModal(true)}
              className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-400">
                    {t('attention_needed') || 'Attention Needed'}
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-500/80">
                    {t('quality_alert_msg', { count: qualityIssues.length }) || `We found ${qualityIssues.length} customer profiles with missing or invalid information.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-medium text-sm group-hover:translate-x-1 transition-transform">
                {t('view_details') || 'View Details'}
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Card */}
      <GlassCard className="border-l-4 border-l-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <CardHeader className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <User className="h-6 w-6 text-primary" />
                </div>
                {t('grid_title')}
              </CardTitle>
              <p className="text-muted-foreground mt-2 ml-1">
                {t('grid_subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-[260px] transition-all"
                />
              </div>
              <Button
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-2 px-5"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4" />
                {t('add_customer')}
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-border/50">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('filter_nationality')}</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                >
                  <option value="">{t('all_countries')}</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('filter_status')}</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <select
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                >
                  <option value="all">{t('all_customers')}</option>
                  <option value="verified">{t('verified_only')}</option>
                  <option value="not-verified">{t('unverified_only')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">{t('filter_sort')}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={`${sortField}-${sortDirection}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortField(field);
                      setSortDirection(direction);
                    }}
                    className="w-full px-3 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                  >
                    <option value="created_at-desc">{t('sort_newest')}</option>
                    <option value="created_at-asc">{t('sort_oldest')}</option>
                    <option value="first_name-asc">{t('sort_name_az')}</option>
                    <option value="first_name-desc">{t('sort_name_za')}</option>
                    <option value="country_of_origin-asc">{t('sort_nat_az')}</option>
                    <option value="country_of_origin-desc">{t('sort_nat_za')}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Customer Grid */}
      {loading && customers.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {customers.map((customer) => (
              <CustomerGridCard
                key={customer.id}
                customer={customer}
                onEdit={handleEditClick}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="bg-muted/30 p-6 rounded-full mb-4">
            <User className="h-10 w-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">{t('no_customers')}</p>
          <p className="text-sm">{t('try_adjusting')}</p>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center py-8">
          {loadingMore ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          ) : (
            <Button
              onClick={loadMoreCustomers}
              variant="outline"
              className="min-w-[200px] rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
            >
              {t('load_more')}
            </Button>
          )}
        </div>
      )}

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newCustomer) => {
          loadCustomers(true);
        }}
      />

      <EditCustomerModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSave={(updatedCustomer) => {
          setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
          setSelectedCustomer(null);
        }}
      />

      <DeleteCustomerModal
        customer={customerToDelete}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onDelete={handleDeleteCustomer}
      />

      <DataQualityModal
        issues={qualityIssues}
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        onEdit={setSelectedCustomer}
      />
    </motion.div>
  );
}