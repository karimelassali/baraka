import { createServer } from '../../../../lib/supabaseServer';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifySuperAdmins } from '../../../../lib/email/notifications';
import { logSystemError } from '../../../../lib/admin-logger';

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

export async function GET(request) {
    const supabase = await createServer();

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check if user is an admin and has permission to view admins
    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role, permissions')
        .eq('auth_id', user.id)
        .single();

    if (adminError || !adminUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check permissions (assuming 'super_admin' role or 'manage_admins' permission)
    const hasPermission = adminUser.role === 'super_admin' ||
        (adminUser.permissions && adminUser.permissions.includes('manage_admins'));

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    // 3. Fetch all admins
    // Use supabaseAdmin to bypass RLS if needed
    if (!supabaseAdmin) {
        return NextResponse.json({ error: 'Server configuration error: Service role key not found' }, { status: 500 });
    }

    const { data: admins, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(admins);
}

export async function POST(request) {
    const supabase = await createServer();

    // 1. Check authentication and permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role, permissions')
        .eq('auth_id', user.id)
        .single();

    if (adminError || !adminUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const hasPermission = adminUser.role === 'super_admin' ||
        (adminUser.permissions && adminUser.permissions.includes('manage_admins'));

    if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { email, password, fullName, phone, role, permissions } = body;

        if (!email || !password || !fullName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Create user in Supabase Auth using Admin Client
        // We need the service role key for this
        if (!supabaseAdmin) {
            console.error('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY is missing in environment variables');
            return NextResponse.json({
                error: 'Server configuration error: Service role key not found. Check your environment variables.'
            }, { status: 500 });
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // 3. Create record in admin_users table
        // Use supabaseAdmin to ensure insertion happens regardless of RLS
        const { data: newAdmin, error: dbError } = await supabaseAdmin
            .from('admin_users')
            .insert([
                {
                    auth_id: authData.user.id,
                    email,
                    full_name: fullName,
                    role: role || 'admin', // Default to 'admin' if not provided
                    permissions: permissions || [],
                    created_by: adminUser.id
                }
            ])
            .select()
            .single();

        if (dbError) {
            // Rollback auth user creation if DB insert fails (optional but good practice)
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        // 4. Notify Super Admins
        await notifySuperAdmins({
            subject: 'Nuovo Account Admin Creato',
            html: `
                <p>È stato creato un nuovo account amministratore.</p>
                <ul>
                    <li><strong>Nome:</strong> ${fullName}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Ruolo:</strong> ${role || 'admin'}</li>
                    <li><strong>Creato da:</strong> ${adminUser.email}</li>
                </ul>
            `
        });

        return NextResponse.json(newAdmin);

    } catch (error) {
        await logSystemError({
            error,
            context: 'API: POST /api/admin/admins',
            details: { body: await request.clone().json().catch(() => ({})) }
        });
        console.error('Error creating admin:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
