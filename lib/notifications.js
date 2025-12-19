import { createAdminClient } from './supabase/admin';

/**
 * Creates a new notification in the database.
 * @param {Object} params
 * @param {'info' | 'warning' | 'success' | 'error'} params.type
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} [params.link]
 * @param {Object} [params.metadata]
 */
export async function createNotification({ type, title, message, link, metadata = {} }) {
    try {
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('notifications')
            .insert({
                type,
                title,
                message,
                link,
                metadata,
                is_read: false,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error creating notification:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Exception creating notification:', error);
        return false;
    }
}
