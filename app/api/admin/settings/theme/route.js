import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'active_theme')
            .single();

        if (error) {
            console.error('Error fetching theme:', error);
            return NextResponse.json({ theme: 'default' });
        }

        return NextResponse.json({ theme: data?.value || 'default' });
    } catch (err) {
        console.error('Unexpected error fetching theme:', err);
        return NextResponse.json({ theme: 'default' });
    }
}

export async function PUT(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // 1. Check authentication (Try getUser, fallback to getSession)
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            user = session.user;
        } else {
            console.error("Auth failed in theme route. User:", user, "Error:", authError);
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // 2. Verify Admin Status
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { theme } = body;

        if (!theme) {
            return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
        }

        // 3. Use Service Role Client to ensure write permission (Bypass RLS)
        const supabaseAdmin = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { error } = await supabaseAdmin
            .from('system_settings')
            .upsert({
                key: 'active_theme',
                value: theme,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error updating theme:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, theme });
    } catch (err) {
        console.error('Server error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
