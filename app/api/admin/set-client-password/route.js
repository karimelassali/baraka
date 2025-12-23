import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function POST(request) {
    try {
        const body = await request.json();
        const { authId, newPassword, accessPassword } = body;

        // Verify access via password
        const expectedPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;
        if (!accessPassword || accessPassword !== expectedPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!authId || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

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

        // Update user password
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            authId,
            {
                password: newPassword,
                email_confirm: true,
                user_metadata: { force_password_change: true }
            }
        );

        if (error) throw error;

        // Log the action
        await logAdminAction({
            action: 'UPDATE',
            resource: 'customers',
            resourceId: authId,
            details: {
                field: 'password',
                source: 'add-client-page'
            },
            adminId: null
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating password:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
