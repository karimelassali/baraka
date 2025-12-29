"use client";

import React, { useState, useEffect } from "react";
import CountryFlag from "react-country-flag";
import { countryCodes } from "@/lib/country-codes";
import { ChevronDown } from "lucide-react";

export default function PhoneInputWithCountry({
    value = "",
    onChange,
    id,
    name,
    placeholder = "123 456 7890",
    required = false,
    className = "",
    disabled = false
}) {
    const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]); // Default IT
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    // Initialize from value prop
    useEffect(() => {
        if (!value) {
            setPhoneNumber("");
            return;
        }

        // Try to find matching country prefix
        // Sort by length desc so +353 is matched before +3 (if that existed)
        // But for our list it's fine.
        const sortedCodes = [...countryCodes].sort((a, b) => b.dial_code.length - a.dial_code.length);

        let foundCountry = null;
        let cleanNumber = value;

        if (value.startsWith('+')) {
            foundCountry = sortedCodes.find(c => value.startsWith(c.dial_code));
            if (foundCountry) {
                cleanNumber = value.substring(foundCountry.dial_code.length);
            }
        }

        if (foundCountry) {
            setSelectedCountry(foundCountry);
        }
        setPhoneNumber(cleanNumber);
    }, [value]);

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        setIsOpen(false);
        // Trigger onChange with new prefix
        if (onChange) {
            const cleanPhone = phoneNumber.replace(/\D/g, ''); // keep only digits
            onChange(country.dial_code + cleanPhone);
        }
    };

    const handlePhoneChange = (e) => {
        const input = e.target.value;
        // Allow digits, spaces, dashes
        if (!/^[\d\s-]*$/.test(input)) return;

        setPhoneNumber(input);

        if (onChange) {
            const cleanPhone = input.replace(/\D/g, '');
            onChange(selectedCountry.dial_code + cleanPhone);
        }
    };

    return (
        <div className={`relative flex rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all ${className}`}>
            {/* Country Dropdown Trigger */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="flex items-center h-full px-3 gap-2 border-r border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-l-xl transition-colors min-w-[100px]"
                >
                    <CountryFlag
                        countryCode={selectedCountry.code}
                        svg
                        style={{ width: '1.5em', height: '1.5em' }}
                    />
                    <span className="text-gray-700 font-medium text-sm">{selectedCountry.dial_code}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-12 left-0 z-50 w-72 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl scrollbar-thin scrollbar-thumb-gray-200">
                        <div className="p-2 space-y-1">
                            {countryCodes.map((country) => (
                                <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${selectedCountry.code === country.code
                                            ? 'bg-red-50 text-red-700'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <CountryFlag
                                        countryCode={country.code}
                                        svg
                                        style={{ width: '1.5em', height: '1.5em' }}
                                    />
                                    <span className="flex-1 text-left truncate">{country.name}</span>
                                    <span className="text-gray-400 font-mono text-xs">{country.dial_code}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop for closing dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Phone Input */}
            <input
                id={id}
                name={name}
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                className="flex-1 block w-full px-4 py-3 bg-white rounded-r-xl outline-none text-gray-900 placeholder-gray-400"
            />
        </div>
    );
}
