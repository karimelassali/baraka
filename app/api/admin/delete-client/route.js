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

        console.log('Attempting to delete customer with auth_id:', authId);

        // First, get the customer record to find the customer id
        const { data: customer, error: findError } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('auth_id', authId)
            .single();

        let customerId = customer?.id;

        // If not found by auth_id, maybe authId is actually the customer id
        if (!customer && !findError) {
            customerId = authId;
        }

        console.log('Customer ID to delete:', customerId);

        if (customerId) {
            // Delete related records FIRST to avoid foreign key constraint errors

            // 1. Delete loyalty_points
            const { error: pointsError } = await supabaseAdmin
                .from('loyalty_points')
                .delete()
                .eq('customer_id', customerId);

            if (pointsError) {
                console.warn('Error deleting loyalty_points:', pointsError.message);
            } else {
                console.log('Deleted loyalty_points for customer:', customerId);
            }

            // 2. Delete vouchers
            const { error: vouchersError } = await supabaseAdmin
                .from('vouchers')
                .delete()
                .eq('customer_id', customerId);

            if (vouchersError) {
                console.warn('Error deleting vouchers:', vouchersError.message);
            } else {
                console.log('Deleted vouchers for customer:', customerId);
            }

            // 3. Delete any other related records (add more as needed)
            // E.g., reviews, messages, etc.
            const { error: reviewsError } = await supabaseAdmin
                .from('reviews')
                .delete()
                .eq('customer_id', customerId);

            if (reviewsError) {
                console.warn('Error deleting reviews:', reviewsError.message);
            }

            // Now delete the customer record
            const { data: deleteData, error: tableError } = await supabaseAdmin
                .from('customers')
                .delete()
                .eq('id', customerId)
                .select();

            console.log('Delete from customers result:', { deleteData, tableError });

            if (tableError) {
                console.error("Failed to delete from customers table:", tableError);
                return NextResponse.json({ error: 'Failed to delete customer: ' + tableError.message }, { status: 500 });
            }

            if (!deleteData || deleteData.length === 0) {
                console.error('No customer deleted with id:', customerId);
                return NextResponse.json({ error: 'Customer not found or already deleted' }, { status: 404 });
            }
        }

        // Now delete user from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authId);

        if (deleteError) {
            // If user doesn't exist in auth, that's okay - goal is to remove them anyway
            if (deleteError.code === 'user_not_found') {
                console.log('Auth user not found, but customer was deleted from customers table');
            } else {
                console.error('Error deleting auth user:', deleteError);
                // Don't throw - customer table delete succeeded
            }
        }

        console.log('Delete successful for auth_id:', authId);

        // Log the action
        await logAdminAction({
            action: 'DELETE',
            resource: 'customers',
            resourceId: authId,
            details: { authId, customerId, source: 'add-client-page' },
            adminId: null
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
