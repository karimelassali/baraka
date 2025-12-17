import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const supabase = await createClient();

        // Verify admin access
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch customers with missing or invalid data
        // We can't easily do complex ORs with standard Supabase syntax for all these mixed conditions in one go efficiently 
        // without a complex query string or RPC, but we can fetch potential candidates or just fetch specific columns to check.
        // Given the requirements, let's try to construct a filter.

        // Actually, Supabase 'or' syntax can handle this.
        // condition: first_name is null or empty, last_name is null or empty, email is null or empty or contains @noemail, country is null or empty, residence is null or empty.

        // Since empty strings and NULLs are distinct, we check both if possible, or assume data cleaning converts empty to null.
        // Let's check for NULLs and specific patterns.

        const { data: customers, error } = await supabase
            .from('customers')
            .select('id, first_name, last_name, email, country_of_origin, residence, phone_number')
            .or('first_name.is.null,first_name.eq.,last_name.is.null,last_name.eq.,email.is.null,email.ilike.%@noemail%,country_of_origin.is.null,country_of_origin.eq.,residence.is.null,residence.eq.');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Post-process to categorize issues
        const issues = customers.map(c => {
            const missing = [];
            if (!c.first_name || !c.last_name) missing.push('name');
            if (!c.email || c.email.includes('@noemail')) missing.push('email');
            if (!c.country_of_origin || !c.residence) missing.push('location');

            return {
                ...c,
                missing
            };
        }).filter(c => c.missing.length > 0);

        return NextResponse.json({
            count: issues.length,
            issues
        });

    } catch (error) {
        console.error('Error in quality check:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
