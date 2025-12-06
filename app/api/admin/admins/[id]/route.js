import { createServer } from '../../../../../lib/supabaseServer';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client only if SERVICE_ROLE_KEY is available
let supabaseAdmin = null;
if (process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

export async function DELETE(request, { params }) {
    const { id } = params;
    const supabase = createServer();

    // 1. Check Auth & Permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role, permissions')
        .eq('auth_id', session.user.id)
        .single();

    if (adminError || !adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const hasPermission = adminUser.role === 'super_admin' ||
        (adminUser.permissions && adminUser.permissions.includes('manage_admins'));

    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        // 2. Get the admin to be deleted to find their auth_id
        const { data: targetAdmin, error: fetchError } = await supabase
            .from('admin_users')
            .select('auth_id')
            .eq('id', id)
            .single();

        if (fetchError || !targetAdmin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        // 3. Delete from Supabase Auth
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error: Service role key not found' }, { status: 500 });
        }

        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetAdmin.auth_id);

        if (authDeleteError) {
            console.error('Error deleting auth user:', authDeleteError);
            // Continue to delete from DB even if auth delete fails (or handle as needed)
        }

        // 4. Delete from admin_users table
        const { error: dbDeleteError } = await supabase
            .from('admin_users')
            .delete()
            .eq('id', id);

        if (dbDeleteError) {
            return NextResponse.json({ error: dbDeleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting admin:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    const { id } = params;
    const supabase = createServer();

    // 1. Check Auth & Permissions
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role, permissions')
        .eq('auth_id', session.user.id)
        .single();

    if (adminError || !adminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const isSuperAdmin = adminUser.role === 'super_admin';
    const hasManageAdmins = adminUser.permissions && adminUser.permissions.includes('manage_admins');
    const isSelf = adminUser.id === id;

    const hasPermission = isSuperAdmin || hasManageAdmins || isSelf;

    if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const body = await request.json();
        const { role, permissions, fullName, phone } = body;

        // Prevent non-admins from changing role/permissions even for themselves
        if (!isSuperAdmin && !hasManageAdmins && (role !== undefined || permissions !== undefined)) {
            return NextResponse.json({ error: 'Forbidden: Cannot change own role or permissions' }, { status: 403 });
        }

        // 2. Update admin_users table
        const updates = {};
        if (role !== undefined) updates.role = role;
        if (permissions !== undefined) updates.permissions = permissions;
        if (fullName !== undefined) updates.full_name = fullName;
        if (phone !== undefined) {
            updates.phone = phone === '' ? null : phone;
        }

        const { data: updatedAdmin, error: updateError } = await supabase
            .from('admin_users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json(updatedAdmin);

    } catch (error) {
        console.error('Error updating admin:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
