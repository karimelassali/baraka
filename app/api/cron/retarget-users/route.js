import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';
        const targetPhone = searchParams.get('phone');
        const offerId = searchParams.get('offer_id');
        const imageUrl = searchParams.get('image_url'); // Optional: MMS Image

        const authHeader = request.headers.get('authorization');
        const isDev = process.env.NODE_ENV === 'development';

        if (!force || !isDev) {
            if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                return new Response('Unauthorized', { status: 401 });
            }
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase Environment Variables (Service Role)");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Determine Base URL for Short Links
        const host = request.headers.get('host') || 'baraka-tst-2025.vercel.app';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const shortLinkBase = `${protocol}://${host}/o`;

        let users = [];
        if (targetPhone) {
            const { data: specificUser } = await supabase
                .from('customers')
                .select('id, first_name, phone_number')
                .ilike('phone_number', `%${targetPhone}%`)
                .maybeSingle();

            if (specificUser) {
                users = [specificUser];
            } else {
                users = [{ id: null, first_name: '', phone_number: targetPhone }];
            }
        } else {
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() - 15);
            const isoThreshold = thresholdDate.toISOString();

            const { data: candidates, error } = await supabase
                .from('customers')
                .select('id, first_name, phone_number, last_scan_date')
                .lt('last_scan_date', isoThreshold)
                .or(`last_retarget_date.is.null,last_retarget_date.lt.${isoThreshold}`)
                .not('phone_number', 'is', null);

            if (error) throw error;
            users = candidates || [];
        }

        const report = [];

        for (const user of users) {
            if (user.id && !targetPhone) {
                const { data: balance } = await supabase.from('customer_points_balance').select('total_points').eq('customer_id', user.id).single();
                if ((balance?.total_points || 0) < 100) continue;
            }

            const pointsToAdd = 30;
            let phone = user.phone_number;

            if (phone) {
                phone = phone.replace(/[\s\-\(\)]/g, '');
                if (!phone.startsWith('+')) phone = '+39' + phone;
            }

            const greeting = user.first_name ? `Ciao ${user.first_name}!` : `Ciao!`;
            let msgBody = `${greeting} Ci manchi! Ecco ${pointsToAdd} punti per te se vieni nel weekend!`;

            if (offerId) {
                msgBody += ` Vedi offerta: ${shortLinkBase}/${offerId}`;
            }

            // Send SMS (with optional image)
            const smsResult = await sendSms(phone, msgBody, imageUrl);

            if (smsResult.success) {
                if (user.id) {
                    await supabase.from('loyalty_points').insert({
                        customer_id: user.id,
                        points: pointsToAdd,
                        transaction_type: 'RETARGETING_BONUS',
                        description: 'Bonus ritorno'
                    });
                    await supabase.from('customers').update({
                        last_retarget_date: new Date().toISOString()
                    }).eq('id', user.id);
                }
                report.push({ user: user.first_name || 'Guest', status: 'Sent', phone });
            } else {
                report.push({ user: user.first_name || 'Guest', status: 'Failed', error: smsResult.error });
            }
        }

        return NextResponse.json({ success: true, processed: users.length, details: report });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
