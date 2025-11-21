import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { table } = await request.json();

        // Debug Env Vars
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.error("Missing Env Vars in Seed Route:", { url: !!url, key: !!key });
            throw new Error(`Missing Environment Variables. URL: ${!!url}, Key: ${!!key}`);
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        let dataToInsert = {};
        let result;

        // Helper to get a random customer
        const getCustomer = async () => {
            const { data } = await supabase.from('customers').select('id').limit(1).single();
            return data?.id;
        };

        // Helper to get a random admin
        const getAdmin = async () => {
            const { data } = await supabase.from('admin_users').select('id').limit(1).single();
            return data?.id;
        };

        const timestamp = new Date().toISOString();
        const randomString = Math.random().toString(36).substring(7);

        switch (table) {
            case 'customers':
                dataToInsert = {
                    first_name: `TestUser_${randomString}`,
                    last_name: 'Doe',
                    email: `test_${randomString}@example.com`,
                    phone_number: `+1${Math.floor(Math.random() * 10000000000)}`,
                    auth_id: crypto.randomUUID(), // Mock auth ID
                    gdpr_consent: true,
                    gdpr_consent_at: timestamp,
                    is_active: true,
                    language_preference: 'en'
                };
                break;

            case 'loyalty_points':
                const customerIdForPoints = await getCustomer();
                if (!customerIdForPoints) throw new Error('No customers found to attach points to');
                dataToInsert = {
                    customer_id: customerIdForPoints,
                    points: Math.floor(Math.random() * 100),
                    transaction_type: 'EARNED',
                    description: `Test points earned ${randomString}`,
                    created_at: timestamp
                };
                break;

            case 'vouchers':
                const customerIdForVoucher = await getCustomer();
                if (!customerIdForVoucher) throw new Error('No customers found to attach voucher to');
                dataToInsert = {
                    code: `VOUCHER-${randomString.toUpperCase()}`,
                    customer_id: customerIdForVoucher,
                    points_redeemed: 50,
                    value: 10.00,
                    currency: 'EUR',
                    is_active: true,
                    expires_at: new Date(Date.now() + 86400000 * 30).toISOString() // 30 days from now
                };
                break;

            case 'offers':
                dataToInsert = {
                    title: JSON.stringify({ en: `Test Offer ${randomString}` }),
                    description: JSON.stringify({ en: 'This is a test offer description' }),
                    offer_type: 'WEEKLY',
                    is_active: true,
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
                };
                break;

            case 'reviews':
                const customerIdForReview = await getCustomer();
                if (!customerIdForReview) throw new Error('No customers found to attach review to');
                dataToInsert = {
                    customer_id: customerIdForReview,
                    review_text: `This is a test review ${randomString}`,
                    rating: Math.floor(Math.random() * 5) + 1,
                    is_approved: true,
                    created_at: timestamp
                };
                break;

            case 'admin_users':
                dataToInsert = {
                    full_name: `Admin ${randomString}`,
                    email: `admin_${randomString}@baraka.com`,
                    role: 'admin',
                    auth_id: crypto.randomUUID(),
                    is_active: true
                };
                break;

            case 'whatsapp_messages':
                const customerIdForMsg = await getCustomer();
                if (!customerIdForMsg) throw new Error('No customers found to attach message to');
                dataToInsert = {
                    customer_id: customerIdForMsg,
                    template_name: 'welcome_message',
                    message_type: 'PROMOTIONAL',
                    status: 'sent',
                    sent_at: timestamp
                };
                break;

            case 'settings':
                dataToInsert = {
                    setting_key: `test_setting_${randomString}`,
                    setting_value: 'test_value',
                    description: 'Test setting created via diagnostics page'
                };
                break;

            case 'gdpr_logs':
                const customerIdForLog = await getCustomer();
                if (!customerIdForLog) throw new Error('No customers found to attach log to');
                dataToInsert = {
                    customer_id: customerIdForLog,
                    action: 'CONSENT_UPDATE',
                    description: 'User updated consent settings',
                    performed_by: 'system',
                    performed_at: timestamp
                };
                break;

            default:
                return NextResponse.json({ success: false, error: 'Unknown table' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from(table)
            .insert([dataToInsert])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Successfully inserted into ${table}`,
            data
        });

    } catch (error) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const keyDefault = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
        const keyAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        return NextResponse.json({
            success: false,
            error: error.message,
            debug: {
                hasUrl: !!url,
                keyDefault: keyDefault ? keyDefault.substring(0, 5) : 'MISSING',
                keyAnon: keyAnon ? keyAnon.substring(0, 5) : 'MISSING',
                using: keyAnon ? 'ANON' : (keyDefault ? 'DEFAULT' : 'NONE')
            }
        }, { status: 500 });
    }
}
