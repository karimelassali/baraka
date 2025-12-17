import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { notifySuperAdmins } from '@/lib/email/notifications';
import { generateExpirationEmailHtml } from '@/lib/email/templates/expiration-report';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Initialize Supabase Admin client inside the handler to ensure env vars are loaded
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Check for standard secret key first, then fallback to public prefixed one (though not recommended for secrets)
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase environment variables');
            return NextResponse.json({
                error: 'Server configuration error: Missing Supabase keys'
            }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Optional: Check for Cron Secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch expiring products
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        const { data: products, error } = await supabaseAdmin
            .from('inventory_products')
            .select('*')
            .eq('is_active', true)
            .lte('expiration_date', sevenDaysFromNow.toISOString())
            .order('expiration_date', { ascending: true });

        if (error) throw error;

        // Process products to add status
        const processedProducts = products.map(product => {
            const expDate = new Date(product.expiration_date);
            const todayDate = new Date();
            todayDate.setHours(0, 0, 0, 0);
            expDate.setHours(0, 0, 0, 0);

            const diffTime = expDate - todayDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status = 'soon';
            if (diffDays < 0) status = 'expired';
            else if (diffDays === 0) status = 'today';
            else if (diffDays === 1) status = 'tomorrow';

            return { ...product, status };
        });

        // Only send email if there are expiring products
        if (processedProducts.length > 0) {
            const html = generateExpirationEmailHtml(processedProducts);

            // Send to all super admins
            await notifySuperAdmins({
                subject: `Alert Scadenze Baraka - ${processedProducts.length} prodotti richiedono attenzione`,
                html,
                useTemplate: false // Use the custom template from generateExpirationEmailHtml
            });

            return NextResponse.json({
                success: true,
                message: `Email sent to super admins`,
                count: processedProducts.length
            });
        }

        return NextResponse.json({
            success: true,
            message: 'No expiring products found, no email sent',
            count: 0
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
