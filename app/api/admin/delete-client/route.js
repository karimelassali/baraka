import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function DELETE(request) {
    try {
        // Verify admin access first
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('id')
            .eq('auth_id', user.id)
            .eq('is_active', true)
            .single();

        if (adminError || !adminData) {
            return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
        }

        const { authId } = await request.json();

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

        // Log the action
        await logAdminAction({
            action: 'DELETE',
            resource: 'customers',
            resourceId: authId,
            details: { authId },
            adminId: adminData.id
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

