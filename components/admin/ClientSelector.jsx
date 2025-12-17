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
    ChevronDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import GlassCard from '../ui/GlassCard';
import { countries } from '../../lib/constants/countries';
import { getAvatarUrl } from '@/lib/avatar';

export default function ClientSelector({ onSelectionChange, selectedIds = [] }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    // Local selection state to manage internal selection before prop updates
    const [localSelected, setLocalSelected] = useState(new Set(selectedIds));

    useEffect(() => {
        setLocalSelected(new Set(selectedIds));
    }, [selectedIds]);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            // Fetch all customers (or a reasonable limit for selection)
            // For a real production app with thousands of users, we'd need server-side search/pagination
            // But for this selector, we'll fetch a larger batch and filter client-side for responsiveness
            const response = await fetch('/api/admin/customers?limit=100');
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.customers || []);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(c => {
        const matchesSearch =
            c.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone_number?.includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCountry = countryFilter ? c.country_of_origin === countryFilter : true;

        // Only show customers with phone numbers for WhatsApp campaigns
        const hasPhone = !!c.phone_number;

        return matchesSearch && matchesCountry && hasPhone;
    });

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
        if (localSelected.size === filteredCustomers.length) {
            // Deselect all visible
            const newSelection = new Set(localSelected);
            filteredCustomers.forEach(c => newSelection.delete(c.id));
            setLocalSelected(newSelection);
            onSelectionChange(Array.from(newSelection));
        } else {
            // Select all visible
            const newSelection = new Set(localSelected);
            filteredCustomers.forEach(c => newSelection.add(c.id));
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
                        placeholder="Search by name, phone, or email..."
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
                        <option value="">All Countries</option>
                        {countries.map((c) => (
                            <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                    {localSelected.size} selected
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAll}
                    className="h-8"
                >
                    {localSelected.size > 0 && localSelected.size === filteredCustomers.length ? 'Deselect All' : 'Select All Visible'}
                </Button>
            </div>

            <div className="border rounded-xl overflow-hidden bg-background/40 backdrop-blur-sm max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <User className="h-8 w-8 mb-2 opacity-20" />
                        <p>No customers found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {filteredCustomers.map((customer) => {
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
                                        <img
                                            src={getAvatarUrl(customer.first_name)}
                                            alt={customer.first_name}
                                            className="w-full h-full"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                            {customer.first_name} {customer.last_name}
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
