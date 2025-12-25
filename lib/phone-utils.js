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

    // If starts with +39, also try without prefix
    if (cleaned.startsWith('+39')) {
        const withoutPrefix = cleaned.substring(3);
        variants.add(withoutPrefix);
    }

    // If doesn't start with +, add +39 prefix
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
        for (const variant of variants) {
            const { data, error } = await supabase
                .from(table)
                .select(selectColumns)
                .eq('phone_number', variant)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('[findUserByPhone] Query error for variant:', variant, error);
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
