import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check for service role key - prefer non-public version for security
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        // Fallback to public version if available
        supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Supabase Environment Variables Missing in createAdminClient!");
        console.error("URL:", supabaseUrl ? "Set" : "Missing");
        console.error("Service Key:", supabaseServiceKey ? "Set" : "Missing");
        throw new Error("Supabase URL and Service Key are required for admin operations!");
    }

    console.log(`[createAdminClient] Initializing with URL: ${supabaseUrl}`);
    console.log(`[createAdminClient] Service Key found (length: ${supabaseServiceKey.length})`);
    if (supabaseServiceKey.startsWith('eyJ')) {
        console.log('[createAdminClient] Service Key appears to be a JWT');
    } else {
        console.log('[createAdminClient] Service Key does NOT appear to be a JWT (might be opaque token)');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
