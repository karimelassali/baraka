// components/admin/WhatsAppCampaign.jsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Send,
  MessageCircle,
  Users,
  Globe,
  Award,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  History,
  Plus,
  Smartphone,

  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { countries } from '../../lib/constants/countries';
import CampaignHistory from './CampaignHistory';
import ClientSelector from './ClientSelector';

export default function WhatsAppCampaign() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  // Form State
  const [formData, setFormData] = useState({
    message: '',
    targetGroup: 'all',
    nationality: '',
    pointsThreshold: 0,
    selectedCustomerIds: []
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [recipientCount, setRecipientCount] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);





  const validate = () => {
    const newErrors = {};
    if (!formData.message || formData.message.trim().length === 0) {
      newErrors.message = 'Message is required';
    }
    if (formData.message && formData.message.length > 1000) {
      newErrors.message = 'Message must be less than 1000 characters';
    }
    if (formData.targetGroup === 'nationality' && !formData.nationality) {
      newErrors.nationality = 'Nationality is required';
    }
    if (formData.targetGroup === 'points' && (!formData.pointsThreshold || formData.pointsThreshold <= 0)) {
      newErrors.pointsThreshold = 'Points threshold must be greater than 0';
    }
    if (formData.targetGroup === 'specific' && formData.selectedCustomerIds.length === 0) {
      newErrors.selectedCustomerIds = 'Please select at least one customer';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClientSelection = (ids) => {
    setFormData(prev => ({ ...prev, selectedCustomerIds: ids }));
    setRecipientCount(ids.length);
    if (errors.selectedCustomerIds && ids.length > 0) {
      setErrors(prev => ({ ...prev, selectedCustomerIds: '' }));
    }
  };

  const loadRecipientPreview = async () => {
    if (formData.targetGroup === 'specific') {
      setRecipientCount(formData.selectedCustomerIds.length);
      return;
    }

    setLoadingPreview(true);
    try {
      const response = await fetch('/api/admin/campaigns/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGroup: formData.targetGroup,
          nationality: formData.nationality,
          pointsThreshold: formData.pointsThreshold
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setRecipientCount(result.count);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleTargetGroupChange = (e) => {
    handleChange(e);
    setRecipientCount(null);
  };

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send this campaign to ${recipientCount !== null ? recipientCount : 'selected'} customers?`
    );
    if (!confirmed) return;

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      // For demo: Fetch the actual users to simulate sending
      let users = [];

      if (formData.targetGroup === 'specific') {
        // If specific users are selected, we need to fetch their details if we don't have them
        // But ClientSelector passes IDs. We might need to fetch details or just use what we have if we had the full objects.
        // Since ClientSelector only passes IDs back, let's fetch the details for these IDs.
        // We can use the same preview endpoint but we might need to adjust it to accept IDs or just use a different way.
        // Actually, for 'specific', let's just fetch them by ID.
        // Or simpler: The preview endpoint doesn't support list of IDs yet. 
        // Let's just use the preview endpoint for all other cases, and for specific, we might need to fetch them.
        // However, to keep it simple and consistent, let's just fetch all users from the preview endpoint 
        // and filter them if needed, or better, just rely on the preview endpoint logic I added.
        // Wait, my preview endpoint modification handles 'nationality' and 'points'. 
        // It does NOT handle 'specific' list of IDs.

        // Let's handle 'specific' case here or update the API. 
        // Updating API is cleaner. But I already updated it.
        // Let's update the API to handle 'specific' list of IDs? 
        // Or just fetch them here?
        // Actually, ClientSelector has the data. But it's internal state.
        // Let's just fetch them.

        const response = await fetch('/api/admin/customers?limit=1000'); // Fetch all to filter
        const data = await response.json();
        users = data.customers.filter(c => formData.selectedCustomerIds.includes(c.id));

      } else {
        const response = await fetch('/api/admin/campaigns/preview?returnUsers=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetGroup: formData.targetGroup,
            nationality: formData.nationality,
            pointsThreshold: formData.pointsThreshold
          }),
        });
        const result = await response.json();
        if (response.ok) {
          users = result.users || [];
        } else {
          throw new Error(result.error || 'Failed to fetch recipients');
        }
      }

      if (users.length === 0) {
        setStatus({ type: 'error', message: 'No recipients found for this selection.' });
        setLoading(false);
        return;
      }

      // Generate UID
      const uid = 'camp_' + Math.random().toString(36).substr(2, 9);

      // Store campaign data in sessionStorage
      sessionStorage.setItem(`campaign_${uid}`, JSON.stringify({
        id: uid,
        message: formData.message,
        users: users,
        createdAt: new Date().toISOString(),
        status: 'running'
      }));

      // Redirect to animation page
      router.push(`/admin/campaigns/${uid}`);

    } catch (error) {
      console.error('Error starting campaign:', error);
      setStatus({ type: 'error', message: 'An error occurred while starting the campaign' });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex p-1 bg-muted/30 rounded-xl w-fit border border-white/10">
        <button
          onClick={() => setActiveTab('new')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'new'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
        >
          <History className="h-4 w-4" />
          History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'new' ? (
          <motion.div
            key="new"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Campaign Settings */}
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                  <CardTitle className="flex items-center gap-2 text-lg">

                    Campaign Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {status.message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                      {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      <p>{status.message}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Target Group Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: 'all', icon: Users, label: 'All Customers' },
                        { id: 'nationality', icon: Globe, label: 'By Nationality' },
                        { id: 'points', icon: Award, label: 'By Points' },
                        { id: 'specific', icon: UserCheck, label: 'Select Clients' }
                      ].map((type) => (
                        <div
                          key={type.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, targetGroup: type.id }));
                            if (type.id !== 'specific') {
                              setRecipientCount(null);
                            } else {
                              setRecipientCount(formData.selectedCustomerIds.length);
                            }
                          }}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.targetGroup === type.id
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                            : 'border-transparent bg-muted/30 hover:bg-muted/50'
                            }`}
                        >
                          <type.icon className={`h-6 w-6 mb-2 ${formData.targetGroup === type.id ? 'text-indigo-600' : 'text-muted-foreground'
                            }`} />
                          <div className="font-medium text-sm">{type.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Conditional Inputs */}
                    <div className="bg-muted/10 rounded-xl p-4 border border-border/50">
                      {formData.targetGroup === 'all' && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Sending to all registered customers with phone numbers.
                        </p>
                      )}

                      {formData.targetGroup === 'nationality' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Nationality</label>
                          <div className="relative">
                            <select
                              name="nationality"
                              value={formData.nationality}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-lg border bg-background appearance-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Choose country...</option>
                              {countries.map((c) => (
                                <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                          {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
                        </div>
                      )}

                      {formData.targetGroup === 'points' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Minimum Points Threshold</label>
                          <Input
                            name="pointsThreshold"
                            type="number"
                            value={formData.pointsThreshold}
                            onChange={handleChange}
                            className="bg-background"
                            placeholder="e.g. 100"
                          />
                          {errors.pointsThreshold && <p className="text-sm text-red-500">{errors.pointsThreshold}</p>}
                        </div>
                      )}

                      {formData.targetGroup === 'specific' && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Select Recipients</label>
                          <ClientSelector
                            onSelectionChange={handleClientSelection}
                            selectedIds={formData.selectedCustomerIds}
                          />
                          {errors.selectedCustomerIds && <p className="text-sm text-red-500">{errors.selectedCustomerIds}</p>}
                        </div>
                      )}

                      {/* Recipient Count */}
                      {formData.targetGroup !== 'specific' && (
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="text-sm">
                            {recipientCount !== null ? (
                              <span className="text-green-600 font-medium flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {recipientCount} recipients found
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Estimate recipients before sending</span>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={loadRecipientPreview}
                            disabled={loadingPreview}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            {loadingPreview ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Calculate Audience'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex justify-between">
                        Message Content
                        <span className={`text-xs ${formData.message.length > 900 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {formData.message.length}/1000
                        </span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Type your message here... Use emojis to make it engaging! 🚀"
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !formData.message}
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.01]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Campaign Now
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </GlassCard>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-gray-800 max-w-[320px] mx-auto">
                  <div className="bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden h-[600px] relative flex flex-col">
                    {/* Phone Header */}
                    <div className="bg-[#075E54] p-4 text-white flex items-center gap-3 shadow-md z-10">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Baraka Store</div>
                        <div className="text-[10px] opacity-80">Business Account</div>
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 bg-[#e5ded8] dark:bg-gray-800 p-4 overflow-y-auto bg-opacity-90 relative">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5 pointer-events-none"
                        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}
                      />

                      {formData.message ? (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] mb-4 relative z-10">
                          <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                            {formData.message}
                          </p>
                          <div className="text-[10px] text-gray-400 text-right mt-1">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm italic z-10 relative">
                          Preview your message here
                        </div>
                      )}
                    </div>

                    {/* Phone Footer */}
                    <div className="bg-gray-100 dark:bg-gray-900 p-3 flex items-center gap-2 border-t">
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700" />
                      <div className="flex-1 h-8 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700" />
                      <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center text-white">
                        <Send className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Live Preview
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CampaignHistory />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
