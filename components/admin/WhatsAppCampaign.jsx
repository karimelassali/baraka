// components/admin/WhatsAppCampaign.jsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  MessageCircle,
  Users,
  Globe,
  Award,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';

export default function WhatsAppCampaign() {
  const [formData, setFormData] = useState({
    message: '',
    targetGroup: 'all',
    nationality: '',
    pointsThreshold: 0
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
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const loadRecipientPreview = async () => {
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
    // Reset recipient count when target group changes
    setRecipientCount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to send this campaign to ${recipientCount || 'all'} customers? This action cannot be undone.`
    );
    if (!confirmed) return;

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/admin/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: result.message || 'Campaign sent successfully' });
        setFormData({ message: '', targetGroup: 'all', nationality: '', pointsThreshold: 0 });
        setRecipientCount(null);
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send campaign' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred while sending the campaign' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            WhatsApp Campaign
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Create and send WhatsApp messages to your customers
          </p>
        </CardHeader>
      </GlassCard>

      <GlassCard>
        <CardContent className="pt-6">
          {status.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${status.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5" />
              )}
              <p className="flex-1">{status.message}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                placeholder="Enter your WhatsApp message here..."
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.message && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData.message.length} / 1000 characters
                </p>
              </div>
            </div>

            {/* Target Group */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Group</label>
              <select
                name="targetGroup"
                value={formData.targetGroup}
                onChange={handleTargetGroupChange}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Customers</option>
                <option value="nationality">By Nationality</option>
                <option value="points">By Points Threshold</option>
              </select>
            </div>

            {/* Conditional Fields */}
            <motion.div
              initial={false}
              animate={{ height: 'auto' }}
            >
              {formData.targetGroup === 'nationality' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Nationality
                  </label>
                  <Input
                    name="nationality"
                    placeholder="e.g., Italy, Morocco, Tunisia..."
                    value={formData.nationality}
                    onChange={handleChange}
                    className="bg-background"
                  />
                  {errors.nationality && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.nationality}
                    </p>
                  )}
                </motion.div>
              )}

              {formData.targetGroup === 'points' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Minimum Points
                  </label>
                  <Input
                    name="pointsThreshold"
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.pointsThreshold}
                    onChange={handleChange}
                    min="1"
                    className="bg-background"
                  />
                  {errors.pointsThreshold && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.pointsThreshold}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>

            {/* Recipient Preview */}
            <div className="bg-muted/30 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  Recipient Preview
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={loadRecipientPreview}
                  disabled={loadingPreview}
                >
                  {loadingPreview ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Refresh Count'
                  )}
                </Button>
              </div>

              {recipientCount !== null ? (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                    {recipientCount} {recipientCount === 1 ? 'customer' : 'customers'} will receive this message
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click "Refresh Count" to see how many customers will receive this message
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.message}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Campaign...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Campaign
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </GlassCard>
    </motion.div>
  );
}
