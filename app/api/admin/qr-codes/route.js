import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch QR codes with scan counts
    const { data, error } = await supabase
        .from('qr_codes')
        .select(`
            *,
            qr_scans (count)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to include scan count as a number
    const formattedData = data.map(item => ({
        ...item,
        scan_count: item.qr_scans[0]?.count || 0
    }));

    return NextResponse.json(formattedData);
}

export async function POST(request) {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { code, description, image_url } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        // For static QR codes, target_url is always the domain + query param
        const targetUrl = `https://www.barakasrl.it/?qr_code=${code}`;

        const { data, error } = await supabase
            .from('qr_codes')
            .insert({
                code,
                target_url: targetUrl,
                description,
                image_url,
                created_by: user.id
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
