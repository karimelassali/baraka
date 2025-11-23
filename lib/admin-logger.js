import { createClient } from './supabase/server';
import { cookies } from 'next/headers';

/**
 * Logs an admin action to the database.
 * 
 * @param {Object} params
 * @param {string} params.action - The action performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} params.resource - The resource affected (e.g., 'customers', 'offers')
 * @param {string} [params.resourceId] - The ID of the affected resource
 * @param {Object} [params.details] - Additional details about the action
 * @param {string} [params.adminId] - The ID of the admin performing the action (optional, will try to fetch from session if not provided)
 */
export async function logAdminAction({ action, resource, resourceId, details, adminId }) {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        let finalAdminId = adminId;

        // If adminId is not provided, try to get it from the current session
        if (!finalAdminId) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Get the admin_user record for this auth user
                const { data: adminUser } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('auth_id', session.user.id)
                    .single();

                if (adminUser) {
                    finalAdminId = adminUser.id;
                }
            }
        }

        if (!finalAdminId) {
            console.warn('Could not determine admin ID for log action:', action);
            return;
        }

        const { error } = await supabase
            .from('admin_logs')
            .insert({
                admin_id: finalAdminId,
                action,
                resource,
                resource_id: resourceId,
                details,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error inserting admin log:', error);
        }
    } catch (error) {
        console.error('Error in logAdminAction:', error);
    }
}
