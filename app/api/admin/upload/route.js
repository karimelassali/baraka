import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const bucket = formData.get('bucket') || 'qr-codes';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;

        // Use service role client for storage operations to bypass RLS if needed, 
        // or ensure the user has permissions. 
        // For simplicity, we'll use the authenticated client first.
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (error) {
            console.error('Storage upload error:', error);
            // If bucket doesn't exist, we might need to create it or handle it.
            // But usually buckets are created in dashboard.
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase
            .storage
            .from(bucket)
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
