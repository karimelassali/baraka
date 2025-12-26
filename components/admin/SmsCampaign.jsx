// components/admin/SmsCampaign.jsx
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Send,
    MessageSquare,
    Users,
    Globe,
    Award,
    AlertCircle,
    CheckCircle2,
    Loader2,
    ChevronDown,
    History,
    Plus,
    UserCheck,
    Link as LinkIcon,
    Image as ImageIcon,
    X,
    Sparkles,
    Languages,
    Phone
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '../../components/ui/dropdown-menu';

import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { countries } from '../../lib/constants/countries';
import CampaignHistory from './CampaignHistory';
import ClientSelector from './ClientSelector';

export default function SmsCampaign() {
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

    // Form State
    const [formData, setFormData] = useState({
        message: '',
        targetGroup: 'all',
        nationality: '',
        pointsThreshold: 0,
        selectedCustomerIds: [],
        manualNumbers: '', // New field for manual numbers
        imageUrl: ''
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [recipientCount, setRecipientCount] = useState(null);

    const [loadingPreview, setLoadingPreview] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [animatedMessage, setAnimatedMessage] = useState('');

    // Animation effect for translation
    const animateText = (text) => {
        let currentText = '';
        const chars = text.split('');
        let i = 0;

        const interval = setInterval(() => {
            if (i >= chars.length) {
                clearInterval(interval);
                return;
            }
            currentText += chars[i];
            setAnimatedMessage(currentText);
            setFormData(prev => ({ ...prev, message: currentText }));
            i++;
        }, 15); // Speed of typing effect
    };

    // Offer Selection State
    const [showOfferPicker, setShowOfferPicker] = useState(false);
    const [offers, setOffers] = useState([]);
    const [loadingOffers, setLoadingOffers] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Fetch offers when picker opens
    const fetchOffers = async () => {
        if (offers.length > 0) return;
        setLoadingOffers(true);
        try {
            const response = await fetch('/api/admin/offers');
            const data = await response.json();
            if (response.ok) {
                setOffers(data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoadingOffers(false);
        }
    };

    const handleAddOfferLink = (offer) => {
        const offerLink = `${window.location.origin}/offers/${offer.id}`;

        // Handle localized title (JSONB) or string
        let title = offer.title;
        if (typeof title === 'object' && title !== null) {
            title = title.en || title.it || Object.values(title)[0] || 'Special Offer';
        }

        const newMessage = formData.message ? `${formData.message}\n\nCheck this out: ${offerLink}` : `Check out our special offer: ${title}\n${offerLink}`;

        setFormData(prev => ({
            ...prev,
            message: newMessage,
            imageUrl: offer.image_url || prev.imageUrl // Auto-fill image if available
        }));
        setSelectedOffer(offer);
        setShowOfferPicker(false);

    };

    const handleTranslate = async (targetLanguage) => {
        if (!formData.message) return;
        setTranslating(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: formData.message,
                    targetLanguage
                }),
            });
            const data = await response.json();

            if (response.ok && data.translatedText) {
                // setFormData(prev => ({ ...prev, message: data.translatedText }));
                animateText(data.translatedText);
            } else {
                console.error('Translation failed:', data.error);
                setStatus({ type: 'error', message: 'Translation failed: ' + (data.error || 'Unknown error') });
            }
        } catch (error) {
            console.error('Translation error:', error);
            setStatus({ type: 'error', message: 'Translation error' });
        } finally {
            setTranslating(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.message || formData.message.trim().length === 0) {
            newErrors.message = 'Message is required';
        }
        if (formData.message && formData.message.length > 160) {
            newErrors.message = 'SMS messages should be 160 characters or less';
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
        if (formData.targetGroup === 'manual') {
            if (!formData.manualNumbers.trim()) {
                newErrors.manualNumbers = 'Please enter at least one phone number';
            } else {
                // Basic validation for comma/newline separated numbers
                const numbers = formData.manualNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
                if (numbers.length === 0) newErrors.manualNumbers = 'Please enter valid phone numbers';
            }
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
        if (formData.targetGroup === 'manual') {
            const numbers = formData.manualNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
            setRecipientCount(numbers.length);
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
            `Are you sure you want to send this SMS campaign to ${recipientCount !== null ? recipientCount : 'selected'} customers?`
        );
        if (!confirmed) return;

        setStatus({ type: '', message: '' });
        setLoading(true);

        try {
            // Fetch the actual users to send to
            let users = [];

            if (formData.targetGroup === 'specific') {
                const response = await fetch('/api/admin/customers?limit=1000');
                const data = await response.json();
                users = data.customers.filter(c => formData.selectedCustomerIds.includes(c.id));
            } else if (formData.targetGroup === 'manual') {
                // Create temporary user objects for manual numbers
                users = formData.manualNumbers.split(/[\n,]+/)
                    .map(n => n.trim())
                    .filter(Boolean)
                    .map(phone => ({
                        id: 'manual_' + phone,
                        phone_number: phone,
                        first_name: 'Guest',
                        last_name: ''
                    }));
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

            // Generate unique campaign ID
            const uid = 'sms_' + Math.random().toString(36).substr(2, 9);

            // Store campaign data in sessionStorage for the animation page
            sessionStorage.setItem(`campaign_${uid}`, JSON.stringify({
                id: uid,
                message: formData.message,
                users: users,
                createdAt: new Date().toISOString(),
                status: 'running',
                type: 'sms',
                imageUrl: formData.imageUrl
            }));

            // Redirect to animation page which will send real SMS one by one
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
                                        <MessageSquare className="h-5 w-5 text-blue-600" />
                                        SMS Campaign Details
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
                                                { id: 'specific', icon: UserCheck, label: 'Select Clients' },
                                                { id: 'manual', icon: Phone, label: 'Manual Numbers' }
                                            ].map((type) => (
                                                <div
                                                    key={type.id}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, targetGroup: type.id }));
                                                        if (type.id !== 'specific' && type.id !== 'manual') {
                                                            setRecipientCount(null);
                                                        } else if (type.id === 'specific') {
                                                            setRecipientCount(formData.selectedCustomerIds.length);
                                                        } else {
                                                            const nums = formData.manualNumbers.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
                                                            setRecipientCount(nums.length || null);
                                                        }
                                                    }}
                                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.targetGroup === type.id
                                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                                        : 'border-transparent bg-muted/30 hover:bg-muted/50'
                                                        }`}
                                                >
                                                    <type.icon className={`h-6 w-6 mb-2 ${formData.targetGroup === type.id ? 'text-blue-600' : 'text-muted-foreground'
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
                                                    Sending SMS to all registered customers with phone numbers.
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
                                                            className="w-full px-4 py-2.5 rounded-lg border bg-background appearance-none focus:ring-2 focus:ring-blue-500"
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

                                            {formData.targetGroup === 'manual' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Enter Phone Numbers</label>
                                                    <textarea
                                                        name="manualNumbers"
                                                        value={formData.manualNumbers}
                                                        onChange={(e) => {
                                                            handleChange(e);
                                                            const nums = e.target.value.split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
                                                            setRecipientCount(nums.length || null);
                                                        }}
                                                        placeholder="Enter phone numbers separated by commas or new lines...&#10;+1234567890&#10;+9876543210"
                                                        rows={4}
                                                        className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Enter numbers in international format (e.g., +1234567890).
                                                    </p>
                                                    {errors.manualNumbers && <p className="text-sm text-red-500">{errors.manualNumbers}</p>}
                                                </div>
                                            )}

                                            {/* Recipient Count */}
                                            {formData.targetGroup !== 'specific' && formData.targetGroup !== 'manual' && (
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
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        {loadingPreview ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Calculate Audience'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <label className="text-sm font-medium flex justify-between w-full">
                                                    <span>SMS Message</span>
                                                    <span className={`text-xs ${formData.message.length > 140 ? 'text-amber-500' : formData.message.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                        {formData.message.length}/160
                                                    </span>
                                                </label>
                                            </div>

                                            <div className="relative">
                                                <textarea
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    placeholder="Enter your message here..."
                                                    rows={5}
                                                    className="w-full px-4 py-3 rounded-xl border bg-background focus:ring-2 focus:ring-blue-500 resize-none pr-12 transition-all"
                                                />
                                                <AnimatePresence>
                                                    {translating && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-20"
                                                        >
                                                            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center backdrop-blur-[2px]">
                                                                <div className="relative">
                                                                    <div className="absolute inset-0 blur-xl bg-blue-500/30 animate-pulse rounded-full" />
                                                                    <Sparkles className="h-8 w-8 text-blue-600 animate-spin-slow relative z-10" />
                                                                </div>
                                                                <motion.p
                                                                    initial={{ opacity: 0, y: 5 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    className="text-sm font-medium text-blue-600 mt-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                                                                >
                                                                    AI Translating...
                                                                </motion.p>
                                                            </div>
                                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div className="absolute right-2 top-2 flex flex-col gap-1 z-30">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-amber-500 hover:bg-amber-50"
                                                                title="AI Translate"
                                                                disabled={translating || !formData.message}
                                                            >
                                                                {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                                                            <DropdownMenuLabel>AI Translate to...</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {countries.map((country) => (
                                                                <DropdownMenuItem
                                                                    key={country.code}
                                                                    onClick={() => handleTranslate(country.name)}
                                                                >
                                                                    <span className="mr-2">{country.flag}</span>
                                                                    {country.name}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setShowOfferPicker(true);
                                                            fetchOffers();
                                                        }}
                                                        className="text-blue-600 hover:bg-blue-50"
                                                        title="Insert Offer Link"
                                                    >
                                                        <LinkIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {selectedOffer && (
                                                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                                    <div className="h-10 w-10 rounded-md bg-white overflow-hidden flex-shrink-0">
                                                        {selectedOffer.image_url ? (
                                                            <img src={selectedOffer.image_url} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-5 w-5 m-2.5 text-blue-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{selectedOffer.title?.en || selectedOffer.title}</div>
                                                        <div className="text-xs text-muted-foreground truncate">Link attached</div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => setSelectedOffer(null)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}

                                            {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Note: Standard SMS is 160 characters. Longer messages may be split into multiple segments.
                                            </p>

                                            {/* MMS Image Input */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium flex items-center gap-2">
                                                    <ImageIcon className="h-4 w-4 text-blue-600" />
                                                    Attach Image URL (MMS) <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                                </label>
                                                <Input
                                                    name="imageUrl"
                                                    value={formData.imageUrl}
                                                    onChange={handleChange}
                                                    placeholder="https://example.com/image.jpg"
                                                    className="bg-background"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading || !formData.message}
                                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg shadow-lg shadow-blue-200 dark:shadow-none transition-all hover:scale-[1.01]"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    Send SMS Campaign
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </GlassCard>
                        </div>

                        {/* Right Column: Phone Preview */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <div className="bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-gray-800 max-w-[320px] mx-auto">
                                    <div className="bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden h-[600px] relative flex flex-col">
                                        {/* Phone Header - SMS Style (Blue) */}
                                        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white flex items-center gap-3 shadow-md z-10">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                                <MessageSquare className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">Baraka Store</div>
                                                <div className="text-[10px] opacity-80">SMS Message</div>
                                            </div>
                                        </div>

                                        {/* Chat Area */}
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto relative">
                                            {formData.message ? (
                                                <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm max-w-[85%] ml-auto mb-4 relative z-10">
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {formData.message}
                                                    </p>
                                                    {formData.imageUrl && (
                                                        <div className="mt-2 rounded-lg overflow-hidden border border-white/20">
                                                            <img src={formData.imageUrl} alt="MMS Preview" className="w-full h-auto object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="text-[10px] text-white/70 text-right mt-1 flex items-center justify-end gap-1">
                                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic z-10 relative">
                                                    Preview your SMS here
                                                </div>
                                            )}
                                        </div>

                                        {/* Phone Footer */}
                                        <div className="bg-gray-100 dark:bg-gray-900 p-3 flex items-center gap-2 border-t">
                                            <div className="flex-1 h-10 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 flex items-center px-4">
                                                <span className="text-xs text-muted-foreground">Type a message...</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                <Send className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-muted-foreground mt-4">
                                    📱 SMS Preview
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


            {/* Offer Picker Modal */}
            <AnimatePresence>
                {showOfferPicker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-800"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Select an Offer</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowOfferPicker(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
                                {loadingOffers ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    </div>
                                ) : offers.length > 0 ? (
                                    offers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            onClick={() => handleAddOfferLink(offer)}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all group"
                                        >
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                                {offer.image_url ? (
                                                    <img src={offer.image_url} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <ImageIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate group-hover:text-blue-600 transition-colors">
                                                    {offer.title?.en || offer.title || 'Untitled Offer'}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span className="capitalize">{offer.offer_type?.toLowerCase()}</span>
                                                    <span>•</span>
                                                    <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Select
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No active offers found.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
