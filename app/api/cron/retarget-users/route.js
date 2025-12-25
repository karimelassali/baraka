import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request) {
    try {
        // 1. Verify CRON_SECRET for security
        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        const authHeader = request.headers.get('authorization');
        const isDev = process.env.NODE_ENV === 'development';

        if (!force || !isDev) {
            if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                return new Response('Unauthorized', { status: 401 });
            }
        }

        // 2. Setup Supabase Service Role
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Fallback to the user's variable name (although public prefix is not recommended for service keys)
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase Environment Variables (Service Role)");
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 3. Define the threshold (15 days ago)
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 15);
        const isoThreshold = thresholdDate.toISOString();

        // 4. Find Target Users (Step 1: Get Candidates by Date)
        // Removing the inner join on view to avoid relationship errors
        const { data: users, error } = await supabase
            .from('customers')
            .select(`
                id,
                first_name,
                phone_number,
                last_scan_date,
                last_retarget_date
            `)
            .lt('last_scan_date', isoThreshold)  // Scan older than 15 days
            .or(`last_retarget_date.is.null,last_retarget_date.lt.${isoThreshold}`) // Not retargeted recently
            .not('phone_number', 'is', null);

        if (error) throw error;

        console.log(`Found ${users.length} date-eligible candidates.`);
        const report = [];

        // 5. Process Each User (Filter by Points & Send)
        for (const user of users) {

            // Check Points Balance (Step 2)
            const { data: balance } = await supabase
                .from('customer_points_balance')
                .select('total_points')
                .eq('customer_id', user.id)
                .single();

            const currentPoints = balance?.total_points || 0;

            if (currentPoints < 100) {
                // Skip users with low points
                continue;
            }

            const pointsToAdd = 20;
            let phone = user.phone_number;

            // Format phone number: Ensure it starts with +, default to +39 (Italy) if not
            if (phone) {
                // Remove spaces/dashes
                phone = phone.replace(/[\s\-\(\)]/g, '');
                if (!phone.startsWith('+')) {
                    phone = '+39' + phone;
                }
            }

            // Send SMS
            const smsResult = await sendSms(
                phone,
                `Ciao ${user.first_name}! Ci manchi da Baraka. Ecco ${pointsToAdd} punti bonus per te se passi a trovarci questo weekend!`
            );

            if (smsResult.success) {
                // Add Points
                await supabase.from('loyalty_points').insert({
                    customer_id: user.id,
                    points: pointsToAdd,
                    transaction_type: 'RETARGETING_BONUS',
                    description: 'Bonus ritorno'
                });

                // Update Retarget Date
                await supabase.from('customers').update({
                    last_retarget_date: new Date().toISOString()
                }).eq('id', user.id);

                report.push({
                    user: user.first_name,
                    status: 'Sent & Points Added',
                    phone: phone
                });
            } else {
                console.error("SMS Failed for", user.first_name, smsResult.error);
                report.push({
                    user: user.first_name,
                    status: 'SMS Failed',
                    error: smsResult.error
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed_candidates: users.length,
            actions_taken: report.length,
            details: report
        });

    } catch (err) {
        console.error("Cron Job Failed:", err);
        return NextResponse.json({
            error: err.message,
            stack: err.stack
        }, { status: 500 });
    }
}
