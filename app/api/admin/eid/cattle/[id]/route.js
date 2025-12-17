import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error: Service role key not found' }, { status: 500 });
        }

        const { error } = await supabaseAdmin
            .from('eid_cattle_groups')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { group_name, cattle_weight, status } = body;

        // Use admin client for updates to bypass RLS
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error: Service role key not found' }, { status: 500 });
        }

        const { data, error } = await supabaseAdmin
            .from('eid_cattle_groups')
            .update({ group_name, cattle_weight, status })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating cattle group:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
