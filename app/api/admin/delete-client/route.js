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

        // Delete user from Supabase Auth
        // This usually cascades to public tables if foreign keys are set up with ON DELETE CASCADE
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authId);

        if (deleteError) throw deleteError;

        // Optionally, we can try to delete from 'customers' table explicitly if cascade isn't set,
        // but usually auth deletion is the source of truth. 
        // Let's also try to delete from customers just in case, or rely on cascade.
        // If we delete from auth, the user can't login.
        // Let's assume cascade or manual cleanup. 
        // To be safe and ensure UI consistency, let's try to delete from customers table too if it still exists.

        const { error: tableError } = await supabaseAdmin
            .from('customers')
            .delete()
            .eq('auth_id', authId);

        if (tableError) {
            console.warn("Could not delete from customers table (might already be gone via cascade):", tableError);
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

