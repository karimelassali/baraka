"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, User, Plus, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { countries } from '@/lib/constants/countries';
import { useTranslations } from 'next-intl';
import { getAvatarUrl } from '@/lib/avatar';

export default function CustomerSearch({ onSelect, selectedCustomer }) {
    const t = useTranslations('Admin.Eid.CustomerSearch');
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [localSelected, setLocalSelected] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Check if the search term matches the selected customer (prop or local) to avoid re-fetching
            const currentSelection = selectedCustomer || localSelected;
            const isSelectionMatch = currentSelection &&
                `${currentSelection.first_name} ${currentSelection.last_name}` === searchTerm;

            if (searchTerm.length > 1 && !isSelectionMatch) {
                searchCustomers();
            } else if (searchTerm.length <= 1) {
                setCustomers([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCustomer, localSelected]);

    const searchCustomers = async () => {
        setLoading(true);
        try {
            // Server-side search
            const response = await fetch(`/api/admin/customers?search=${searchTerm}&limit=20`);
            if (response.ok) {
                const data = await response.json();
                setCustomers(data.customers || []);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Error searching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (customer) => {
        setLocalSelected(customer);
        onSelect(customer);
        setSearchTerm(`${customer.first_name} ${customer.last_name}`);
        setShowResults(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t('placeholder')}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!e.target.value) {
                            onSelect(null);
                            setLocalSelected(null);
                        }
                    }}
                    className="pl-9 focus-visible:ring-red-500"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
            </div>

            {showResults && customers.length > 0 && (
                <div className="absolute z-[999] w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {customers.map((customer) => (
                        <div
                            key={customer.id}
                            className="p-3 hover:bg-red-50 cursor-pointer flex items-center gap-3 border-b last:border-0"
                            onClick={() => handleSelect(customer)}
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-red-100 flex-shrink-0 border border-red-200">
                                <img
                                    src={getAvatarUrl(customer.first_name)}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="font-medium text-foreground flex items-center gap-2">
                                    {customer.first_name} {customer.last_name}
                                    {(!customer.first_name || !customer.last_name || !customer.email || customer.email.includes('noemail') || !customer.country_of_origin) && (
                                        <AlertCircle className="w-3 h-3 text-red-500" />
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">{customer.phone_number}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showResults && customers.length === 0 && !loading && (
                <div className="absolute z-[999] w-full mt-1 bg-white border rounded-md shadow-lg p-4 text-center text-muted-foreground">
                    {t('no_results')}
                </div>
            )}
        </div>
    );
}
