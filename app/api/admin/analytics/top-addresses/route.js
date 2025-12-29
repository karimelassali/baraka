import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from('admin_customers_extended')
            .select('residence, first_name, last_name, phone_number')
            .not('residence', 'is', null)
            .neq('residence', '')
            .limit(2000);

        if (error) throw error;

        const addressStats = {};

        const toTitleCase = (str) => {
            return str.replace(
                /\w\S*/g,
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
            );
        };

        data.forEach(c => {
            const rawAddress = (c.residence || 'Unknown').trim();
            if (!rawAddress) return;

            // Normalize key for grouping (lowercase)
            const addressKey = rawAddress.toLowerCase();
            // Create nice display name (Title Case)
            const displayAddress = toTitleCase(rawAddress);

            if (!addressStats[addressKey]) {
                addressStats[addressKey] = {
                    address: displayAddress,
                    count: 0,
                    users: []
                };
            }

            addressStats[addressKey].count++;

            if (addressStats[addressKey].users.length < 20) {
                addressStats[addressKey].users.push({
                    first_name: c.first_name,
                    last_name: c.last_name,
                    phone_number: c.phone_number
                });
            }
        });

        const sortedAddresses = Object.values(addressStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return NextResponse.json(sortedAddresses);
    } catch (error) {
        console.error('Top Addresses Error:', error);
        return NextResponse.json({ error: 'Failed to fetch top addresses' }, { status: 500 });
    }
}
