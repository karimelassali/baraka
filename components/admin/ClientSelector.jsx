"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    User,
    Check,
    CheckCircle2,
    X,
    Loader2,
    ChevronDown,
    AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';
import { countries } from '../../lib/constants/countries';
import { getAvatarUrl } from '@/lib/avatar';
import UserAvatar from '@/components/ui/UserAvatar';
import { useTranslations } from 'next-intl';

export default function ClientSelector({ onSelectionChange, selectedIds = [] }) {
    const t = useTranslations('Admin.Campaigns.client_selector');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    // Local selection state to manage internal selection before prop updates
    const [localSelected, setLocalSelected] = useState(new Set(selectedIds));

    useEffect(() => {
        setLocalSelected(new Set(selectedIds));
    }, [selectedIds]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCustomers();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, countryFilter]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: '50', // Fetch 50 results per search
                search: searchTerm,
                country: countryFilter
            });

            const response = await fetch(`/api/admin/customers?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                // Only show customers with phone numbers for SMS campaigns
                const validCustomers = (data.customers || []).filter(c => c.phone_number);
                setCustomers(validCustomers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        const newSelection = new Set(localSelected);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setLocalSelected(newSelection);
        onSelectionChange(Array.from(newSelection));
    };

    const selectAll = () => {
        if (localSelected.size === customers.length && customers.length > 0) {
            // Deselect all visible
            const newSelection = new Set(localSelected);
            customers.forEach(c => newSelection.delete(c.id));
            setLocalSelected(newSelection);
            onSelectionChange(Array.from(newSelection));
        } else {
            // Select all visible
            const newSelection = new Set(localSelected);
            customers.forEach(c => newSelection.add(c.id));
            setLocalSelected(newSelection);
            onSelectionChange(Array.from(newSelection));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-background/50"
                    />
                </div>
                <div className="relative w-full sm:w-48">
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-background/50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                    >
                        <option value="">{t('all_countries')}</option>
                        {countries.map((c) => (
                            <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    {t('selected_count', { count: localSelected.size })}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="h-8"
                >
                    {(customers.every(c => localSelected.has(c.id)) && customers.length > 0) ? t('deselect_all') : t('select_all')}
                </Button>
            </div>

            <div className="border rounded-xl overflow-hidden bg-background/40 backdrop-blur-sm max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <User className="h-8 w-8 mb-2 opacity-20" />
                        <p>{t('no_customers', { term: searchTerm })}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {customers.map((customer) => {
                            const isSelected = localSelected.has(customer.id);
                            return (
                                <div
                                    key={customer.id}
                                    onClick={() => toggleSelection(customer.id)}
                                    className={`p-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-primary border-primary text-primary-foreground'
                                        : 'border-muted-foreground/30'
                                        }`}>
                                        {isSelected && <Check className="h-3 w-3" />}
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                        <UserAvatar
                                            name={customer.email || customer.first_name}
                                            size={32}
                                            className="w-full h-full"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate flex items-center gap-2">
                                            {customer.first_name} {customer.last_name}
                                            {(!customer.first_name || !customer.last_name || !customer.email || customer.email.includes('noemail') || !customer.country_of_origin) && (
                                                <AlertCircle className="w-3 h-3 text-red-500" />
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
                                            <span>{customer.phone_number}</span>
                                            {customer.country_of_origin && (
                                                <span className="flex items-center gap-1">
                                                    • {countries.find(c => c.name === customer.country_of_origin)?.flag} {customer.country_of_origin}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
