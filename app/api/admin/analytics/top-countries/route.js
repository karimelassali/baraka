import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        // Fetch all customers' country and name for aggregation
        // We limit to 1000 for performance, or maybe more if needed.
        const { data, error } = await supabase
            .from('admin_customers_extended')
            .select('country_of_origin, first_name, last_name, phone_number')
            .limit(2000);

        if (error) throw error;

        const countryStats = {};

        data.forEach(c => {
            const country = c.country_of_origin || 'Unknown';
            if (!countryStats[country]) {
                countryStats[country] = {
                    country,
                    count: 0,
                    users: []
                };
            }
            countryStats[country].count++;
            if (countryStats[country].users.length < 20) {
                countryStats[country].users.push({
                    first_name: c.first_name,
                    last_name: c.last_name,
                    phone_number: c.phone_number
                });
            }
        });

        const sortedCountries = Object.values(countryStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return NextResponse.json(sortedCountries);
    } catch (error) {
        console.error('Top Countries Error:', error);
        return NextResponse.json({ error: 'Failed to fetch top countries' }, { status: 500 });
    }
}
