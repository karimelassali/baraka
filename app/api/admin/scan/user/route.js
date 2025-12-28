import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Service Client
// We use Service Role Key to bypass RLS and ensure we can find any user
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(req) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        console.log(`[API Scan Lookup] Searching for: ${code}`);

        // 1. Try Exact Barcode Match
        // This is the most reliable for scanned codes (Google Wallet Short ID should ideally be saved here, or Legacy Barcodes)
        let { data: customer, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('barcode_value', code)
            .maybeSingle();

        // 2. If not found, check if it is a valid UUID and try Exact ID Match
        if (!customer) {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
            if (isUuid) {
                const { data: idMatch } = await supabaseAdmin
                    .from('customers')
                    .select('*')
                    .eq('id', code)
                    .maybeSingle();
                customer = idMatch;
            }
        }

        // 3. If still not found, handle Short ID (First 8 chars of UUID) via Range Query
        // This effectively simulates 'STARTS WITH' for UUIDs.
        if (!customer && /^[0-9a-f]{8}$/i.test(code)) {
            // UUID Format: 8-4-4-4-12
            // We append the smallest and largest possible suffixes to create a range
            const minUuid = `${code}-0000-0000-0000-000000000000`;
            const maxUuid = `${code}-ffff-ffff-ffff-ffffffffffff`;

            console.log(`[API Scan Lookup] Attempting Range Search: ${minUuid} -> ${maxUuid}`);

            const { data: rangeMatch } = await supabaseAdmin
                .from('customers')
                .select('*')
                .gte('id', minUuid)
                .lte('id', maxUuid)
                .maybeSingle(); // Assuming 8 hex chars (4 billion unique prefixes) is distinct enough

            if (rangeMatch) {
                customer = rangeMatch;
            }
        }

        if (customer) {
            // Fetch points balance
            const { data: pointsData } = await supabaseAdmin
                .from('customer_points_balance')
                .select('total_points')
                .eq('customer_id', customer.id)
                .single();

            customer.total_points = pointsData?.total_points || 0;

            console.log(`[API Scan Lookup] Found user: ${customer.id}`);
            return NextResponse.json({ customer });
        } else {
            console.log(`[API Scan Lookup] No user found for: ${code}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

    } catch (error) {
        console.error('[API Scan Lookup] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
