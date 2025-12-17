import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './transporter';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (supabaseUrl && supabaseServiceKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Fetches all admins with 'super_admin' role.
 */
async function getSuperAdmins() {
    if (!supabaseAdmin) {
        console.error('Cannot fetch super admins: Missing Service Role Key');
        return [];
    }

    try {
        const { data: admins, error } = await supabaseAdmin
            .from('admin_users')
            .select('email, full_name')
            .eq('role', 'super_admin');

        if (error) {
            console.error('Error fetching super admins:', error);
            return [];
        }

        return admins || [];
    } catch (error) {
        console.error('Unexpected error fetching super admins:', error);
        return [];
    }
}

/**
 * Sends a notification email to all super admins.
 * 
 * @param {Object} params
 * @param {string} params.subject - Email subject
 * @param {string} params.html - Email body (HTML)
 * @param {string} [params.level] - 'INFO', 'WARNING', 'ERROR' (default: 'INFO')
 */
export async function notifySuperAdmins({ subject, html, level = 'INFO', useTemplate = true }) {
    const superAdmins = await getSuperAdmins();

    if (superAdmins.length === 0) {
        console.warn('No super admins found to notify.');
        return;
    }

    const prefix = level === 'ERROR' ? '🚨 [CRITICAL ERROR] ' : level === 'WARNING' ? '⚠️ [WARNING] ' : 'ℹ️ [INFO] ';
    const finalSubject = `${prefix}${subject}`;

    const emailPromises = superAdmins.map(admin => {
        const finalHtml = useTemplate ? `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Hello ${admin.full_name},</h2>
                ${html}
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #888;">
                    This is an automated system notification from Baraka Admin.
                </p>
            </div>
        ` : html;

        return sendEmail({
            to: admin.email,
            subject: finalSubject,
            html: finalHtml
        });
    });

    await Promise.all(emailPromises);
}
