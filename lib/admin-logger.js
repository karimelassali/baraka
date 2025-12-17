import { createClient } from './supabase/server';
import { cookies } from 'next/headers';
import { notifySuperAdmins } from './email/notifications';

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
        const supabase = await createClient();

        let finalAdminId = adminId;

        // If adminId is not provided, try to get it from the current session
        if (!finalAdminId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Get the admin_user record for this auth user
                const { data: adminUser } = await supabase
                    .from('admin_users')
                    .select('id')
                    .eq('auth_id', user.id)
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

/**
 * Logs a system error and notifies super admins.
 * 
 * @param {Object} params
 * @param {Error|string} params.error - The error object or message
 * @param {string} params.context - Where the error occurred (e.g., 'API: /api/admin/admins')
 * @param {Object} [params.details] - Additional details
 */
export async function logSystemError({ error, context, details = {} }) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;

    console.error(`[SYSTEM ERROR] ${context}:`, error);

    // 1. Try to log to database
    try {
        const supabase = await createClient();

        await supabase.from('admin_logs').insert({
            action: 'SYSTEM_ERROR',
            resource: 'SYSTEM',
            details: {
                context,
                message: errorMessage,
                stack: errorStack,
                ...details
            },
            created_at: new Date().toISOString()
        });
    } catch (dbError) {
        console.error('Failed to log system error to database:', dbError);
    }

    // 2. Notify Super Admins
    try {
        await notifySuperAdmins({
            subject: `System Error in ${context}`,
            level: 'ERROR',
            html: `
                <h3>Critical System Error Detected</h3>
                <p><strong>Context:</strong> ${context}</p>
                <p><strong>Message:</strong> ${errorMessage}</p>
                ${errorStack ? `<pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">${errorStack}</pre>` : ''}
                <p><strong>Additional Details:</strong></p>
                <pre>${JSON.stringify(details, null, 2)}</pre>
            `
        });
    } catch (notifyError) {
        console.error('Failed to notify super admins of system error:', notifyError);
    }
}
