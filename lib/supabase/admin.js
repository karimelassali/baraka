import { createClient } from '@supabase/supabase-js';

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Check for service role key - prefer non-public version for security
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        // Fallback to public version (less secure, but works)
        supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (supabaseServiceKey) {
            console.warn('⚠️  WARNING: Using NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
            console.warn('⚠️  This exposes your service role key to the client!');
            console.warn('⚠️  Please rename it to SUPABASE_SERVICE_ROLE_KEY in your .env file');
        }
    }

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("❌ Supabase Environment Variables Missing in createAdminClient!");
        console.error("URL:", supabaseUrl ? "Set" : "Missing");
        console.error("Service Key:", supabaseServiceKey ? "Set" : "Missing");
        throw new Error("Supabase URL and Service Key are required for admin operations!");
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
