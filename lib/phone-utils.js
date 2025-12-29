import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Normalizes a phone number to a standard format (digits and leading + only).
 * @param {string} phone The phone number to normalize
 * @returns {string} The normalized phone number
 */
export function normalizePhone(phone) {
    if (!phone) return "";
    return phone.replace(/[^\d+]/g, "");
}

/**
 * Gets all possible variants of a phone number for matching.
 * @param {string} phone The phone number
 * @returns {string[]} Array of possible phone number variants
 */
export function getPhoneVariants(phone) {
    const cleaned = normalizePhone(phone);
    if (!cleaned) return [];

    const variants = new Set();

    // Add original and cleaned
    variants.add(phone);
    variants.add(cleaned);

    // Get just the digits (no +)
    const digitsOnly = cleaned.replace(/\+/g, '');
    variants.add(digitsOnly);

    // INTELLIGENT VARIANT: Handle "Double Country Code" user error
    // e.g. User selects Ireland (+353) and types 353... -> Input is +353353...
    try {
        const parsed = parsePhoneNumberFromString(cleaned);
        if (parsed && parsed.isValid()) {
            // Add the canonical E.164 format
            variants.add(parsed.number);
        }

        // Even if invalid (due to extra length), try to detect double prefix
        // We use the raw text to try to extract a country code if possible, or use simplified logic
        // Since parsePhoneNumberFromString might fail on +353353... (too long), we manually check common logic or rely on partial parsing if available.
        // Actually, let's use a simpler heuristic for double-prefix if parsing failed or just to be safe:
        // Check if the string starts with +CC... and followed by CC...

        // Brute force check for common codes if they seem repeated
        // For the specific user case: +353...
        if (cleaned.startsWith('+')) {
            // Check if the first 3 digits after + are repeated? 
            // e.g. +353 353...
            // Dial codes are 1-3 digits. 
            const withoutPlus = cleaned.substring(1);

            // Try 3 digit code
            if (withoutPlus.length >= 6) {
                const possibleCode3 = withoutPlus.substring(0, 3);
                if (withoutPlus.startsWith(possibleCode3 + possibleCode3)) {
                    variants.add('+' + withoutPlus.substring(3)); // Add +353... (stripped one layer)
                }
            }
            // Try 2 digit code (e.g. +39 39...)
            if (withoutPlus.length >= 4) {
                const possibleCode2 = withoutPlus.substring(0, 2);
                if (withoutPlus.startsWith(possibleCode2 + possibleCode2)) {
                    variants.add('+' + withoutPlus.substring(2));
                }
            }
            // Try 1 digit code (e.g. +1 1...)
            if (withoutPlus.length >= 2) {
                const possibleCode1 = withoutPlus.substring(0, 1);
                if (withoutPlus.startsWith(possibleCode1 + possibleCode1)) {
                    variants.add('+' + withoutPlus.substring(1));
                }
            }
        }

    } catch (e) {
        // ignore parsing errors
    }

    // SPECIFIC HEURISTIC: Italian Mobile (353) vs Ireland Country Code (353)
    // User has Italian number +39 353... but is stored in DB as Irish +353...
    // If input is +39353..., also check +353...
    if (cleaned.startsWith('+39353')) {
        const potentialIrish = '+' + cleaned.substring(3); // Remove +39, keep 353...
        variants.add(potentialIrish);
    }

    // GENERAL HEURISTIC: Ireland 353 vs Italian 353 mismatch (Inverse)
    // If user inputs +353... (Ireland) but meant +39353... (Italy)
    // This is safer to add: if starts with +353, add +39353...
    if (cleaned.startsWith('+353')) {
        const potentialItalian = '+39' + cleaned.substring(1); // Remove +, add +39...
        variants.add(potentialItalian);
    }


    // CRITICAL FIX: Try adding '+' directly to the input first.
    if (!cleaned.startsWith('+')) {
        variants.add('+' + cleaned);
    }

    // If starts with +39, also try without prefix
    if (cleaned.startsWith('+39')) {
        const withoutPrefix = cleaned.substring(3);
        variants.add(withoutPrefix);
    }

    // If doesn't start with +, add +39 prefix (Italy Fallback)
    if (!cleaned.startsWith('+')) {
        variants.add('+39' + cleaned);
    }

    // If starts with 39 (no +), add + version
    if (digitsOnly.startsWith('39') && digitsOnly.length > 10) {
        variants.add('+' + digitsOnly);
        variants.add(digitsOnly.substring(2)); // without 39
    }

    // Also add versions without leading zeros if any
    if (digitsOnly.startsWith('0')) {
        variants.add(digitsOnly.substring(1));
        variants.add('+39' + digitsOnly.substring(1));
    }

    return Array.from(variants).filter(v => v.length >= 7);
}

/**
 * Robustly finds a user by phone number, handling various formats.
 * Uses multiple individual queries for reliability.
 * @param {object} supabase The Supabase client (admin or regular)
 * @param {string} phone The phone number to search for
 * @param {string} table The table to search (default: 'customers')
 * @param {string} selectColumns Columns to select (default: '*')
 * @returns {Promise<{data: any, error: any}>} The found user data or error
 */
export async function findUserByPhone(supabase, phone, table = 'customers', selectColumns = '*') {
    try {
        const variants = getPhoneVariants(phone);

        if (variants.length === 0) {
            return { data: null, error: "Invalid phone number" };
        }

        console.log('[findUserByPhone] Searching for variants:', variants);

        // Try each variant with individual queries (most reliable approach)
        let lastError = null;

        for (const variant of variants) {
            const { data, error } = await supabase
                .from(table)
                .select(selectColumns)
                .eq('phone_number', variant)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('[findUserByPhone] Query error for variant:', variant, error);
                lastError = error;
                continue; // Try next variant
            }

            if (data) {
                console.log('[findUserByPhone] Found user with variant:', variant);
                return { data, error: null };
            }
        }

        // Fallback: Try suffix matching (last 9 digits)
        const cleaned = normalizePhone(phone);
        const digitsOnly = cleaned.replace(/\D/g, '');
        if (digitsOnly.length >= 9) {
            const suffix = digitsOnly.slice(-9);
            console.log('[findUserByPhone] Trying suffix match:', suffix);

            const { data: suffixMatches, error: suffixError } = await supabase
                .from(table)
                .select(selectColumns)
                .ilike('phone_number', `%${suffix}`);

            if (suffixError) {
                lastError = suffixError;
            }

            if (!suffixError && suffixMatches && suffixMatches.length > 0) {
                // Verify match by normalizing
                const match = suffixMatches.find(user => {
                    const userDigits = (user.phone_number || '').replace(/\D/g, '');
                    return userDigits.endsWith(suffix);
                });
                if (match) {
                    console.log('[findUserByPhone] Found user with suffix match');
                    return { data: match, error: null };
                }
            }
        }

        if (lastError) {
            console.error('[findUserByPhone] No user found, but DB errors occurred:', lastError);
            return { data: null, error: lastError };
        }

        console.log('[findUserByPhone] No user found for phone:', phone);
        return { data: null, error: null };

    } catch (err) {
        console.error("findUserByPhone error:", err);
        return { data: null, error: err };
    }
}

/**
 * Checks if a phone number already exists in the database (any format).
 * @param {object} supabase The Supabase client
 * @param {string} phone The phone number to check
 * @returns {Promise<boolean>} True if phone exists
 */
export async function phoneExists(supabase, phone) {
    const { data } = await findUserByPhone(supabase, phone, 'customers', 'id');
    return !!data;
}
