import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
    const supabase = await createClient();

    try {
        const body = await request.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        // Verify the code exists
        const { data: qrCode, error: fetchError } = await supabase
            .from('qr_codes')
            .select('id')
            .eq('code', code)
            .single();

        if (fetchError || !qrCode) {
            return NextResponse.json({ error: 'Invalid QR code' }, { status: 404 });
        }

        // Track the scan
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        const { error: insertError } = await supabase
            .from('qr_scans')
            .insert({
                qr_code_id: qrCode.id,
                ip_address: ip,
                user_agent: userAgent,
                device_info: {} // Can be expanded later
            });

        if (insertError) {
            console.error('Error tracking scan:', insertError);
            return NextResponse.json({ error: 'Failed to track scan' }, { status: 500 });
        }

        // Create notification
        await createNotification({
            type: 'info',
            title: 'Codice QR Scansionato',
            message: `Il codice QR ${code} è stato scansionato.`,
            link: '/admin/qr-codes',
            metadata: { qrCodeId: qrCode.id, code }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in track-qr:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
