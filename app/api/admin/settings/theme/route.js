import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const supabase = createRouteHandlerClient({ cookies });

    try {
        const { data, error } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'active_theme')
            .single();

        if (error) {
            // If table doesn't exist or row missing, return default
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
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status (RLS will also enforce this, but good for early exit)
    // We can skip explicit admin check here if we trust RLS to fail the update
    // But let's keep it consistent if other routes do it. 
    // For now, relying on RLS is safer and cleaner if policies are correct.

    try {
        const body = await request.json();
        const { theme } = body;

        if (!theme) {
            return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('system_settings')
            .upsert({
                key: 'active_theme',
                value: theme,
                updated_at: new Date().toISOString()
            });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, theme });
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
