import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function DELETE(request) {
    try {
        const body = await request.json();
        const { authId, accessPassword } = body;

        // Verify access via password (no session needed)
        const expectedPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;
        if (!accessPassword || accessPassword !== expectedPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!authId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Initialize Supabase Admin Client with fallback for service role key
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!serviceRoleKey) {
            console.error('CRITICAL: Service Role Key is missing!');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            serviceRoleKey,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // First, delete from customers table to avoid foreign key constraint issues
        const { error: tableError } = await supabaseAdmin
            .from('customers')
            .delete()
            .eq('auth_id', authId);

        if (tableError) {
            console.warn("Could not delete from customers table:", tableError);
            // Continue anyway, might not exist
        }

        // Now delete user from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authId);

        if (deleteError) {
            // If user doesn't exist in auth, that's okay - goal is to remove them anyway
            if (deleteError.code === 'user_not_found') {
                console.log('Auth user not found, continuing with deletion...');
            } else {
                console.error('Error deleting auth user:', deleteError);
                throw deleteError;
            }
        }

        // Log the action (no admin session, so use null for adminId - deleted via add-client page)
        await logAdminAction({
            action: 'DELETE',
            resource: 'customers',
            resourceId: authId,
            details: { authId, source: 'add-client-page' },
            adminId: null
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

