import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

// Initialize region names formatter
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// Generate the list programmatically
const allCountries = getCountries().map((country) => {
    try {
        return {
            code: country,
            name: regionNames.of(country) || country,
            dial_code: '+' + getCountryCallingCode(country)
        };
    } catch (e) {
        return null;
    }
}).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));

// Move Italy to the top
const italy = allCountries.find(c => c.code === 'IT');
const others = allCountries.filter(c => c.code !== 'IT');

export const countryCodes = italy ? [italy, ...others] : allCountries;

export const getCountryByDialCode = (dialCode) => {
    // Try exact match first
    let match = countryCodes.find(c => c.dial_code === dialCode);

    // If no exact match (e.g. user typed +1234 but code is +1), try to find longest prefix match
    if (!match && dialCode) {
        match = countryCodes
            .filter(c => dialCode.startsWith(c.dial_code))
            .sort((a, b) => b.dial_code.length - a.dial_code.length)[0];
    }

    return match || countryCodes[0]; // Default to first (Italy)
};
