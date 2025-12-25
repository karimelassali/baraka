import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 60; // Allow 1 minute timeout for cron

export async function GET(request) {
    // 1. Verify CRON_SECRET for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Setup Supabase Service Role (Bypass RLS)
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Define the threshold (15 days ago)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 15);
    const isoThreshold = thresholdDate.toISOString();

    try {
        // 4. Find Target Users
        // Criteria:
        // - Gold or Legend (Assume > 100 points is decent, or specific tiers)
        // - Last scan was more than 15 days ago
        // - Hasn't been retargeted in the last 15 days (prevent spam loop)
        // - Has a phone number

        // Fetch users who haven't scanned recently
        const { data: users, error } = await supabase
            .from('customers')
            .select(`
                id,
                first_name,
                phone_number,
                last_scan_date,
                last_retarget_date,
                customer_points_balance!inner(total_points)
            `)
            .lt('last_scan_date', isoThreshold)  // Scan older than 15 days
            .or(`last_retarget_date.is.null,last_retarget_date.lt.${isoThreshold}`) // Not retargeted recently
            .not('phone_number', 'is', null) // Must have phone
            .gt('customer_points_balance.total_points', 100); // Only "Silver" or above (>100 pts)

        if (error) throw error;

        console.log(`Found ${users.length} users to retarget.`);
        const report = [];

        // 5. Process Each User
        for (const user of users) {
            const pointsToAdd = 20;
            const phone = user.phone_number; // Ensure format +39...

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
                    status: 'Sent & Points Added'
                });
            } else {
                report.push({
                    user: user.first_name,
                    status: 'Failed',
                    error: smsResult.error
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: users.length,
            details: report
        });

    } catch (err) {
        console.error("Cron Job Failed:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
