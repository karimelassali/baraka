import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch QR code details
    const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('id', id)
        .single();

    if (qrError) {
        return NextResponse.json({ error: qrError.message }, { status: 500 });
    }

    // Fetch recent scans (last 50)
    const { data: scans, error: scansError } = await supabase
        .from('qr_scans')
        .select('*')
        .eq('qr_code_id', id)
        .order('scanned_at', { ascending: false })
        .limit(50);

    if (scansError) {
        return NextResponse.json({ error: scansError.message }, { status: 500 });
    }

    return NextResponse.json({ ...qrCode, scans });
}

export async function DELETE(request, { params }) {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
