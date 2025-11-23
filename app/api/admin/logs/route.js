
import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const filter = searchParams.get('filter'); // 'all', 'system', 'messaging'

    let systemLogs = [];
    let messageLogs = [];
    let errorMsg = null;

    // 1. Fetch System Logs (if not filtering for messages only)
    if (filter !== 'messaging') {
        try {
            const { data, error } = await supabase
                .from('admin_logs')
                .select(`
    *,
    admin: admin_users(
        full_name,
        email,
        role
    )
        `)
                .order('created_at', { ascending: false })
                .range(0, limit + offset); // Fetch extra to handle client-side merge/sort

            if (error) {
                // Handle missing table error (Postgres 42P01 or PostgREST PGRST205)
                if (error.code === '42P01' || error.code === 'PGRST205') {
                    console.warn('admin_logs table missing, skipping system logs');
                } else {
                    throw error;
                }
            } else {
                systemLogs = data.map(log => ({
                    id: log.id,
                    source: 'SYSTEM',
                    type: log.action,
                    details: log.details,
                    actor: log.admin?.full_name || 'Unknown',
                    status: 'SUCCESS', // System logs usually imply success unless we track failures
                    created_at: log.created_at,
                    metadata: { resource: log.resource, resource_id: log.resource_id }
                }));
            }
        } catch (err) {
            console.error('Error fetching system logs:', err);
            // Don't fail entirely, just log error
        }
    }

    // 2. Fetch Messaging Logs (if not filtering for system only)
    if (filter !== 'system') {
        try {
            const { data, error } = await supabase
                .from('whatsapp_messages')
                .select('*')
                .order('sent_at', { ascending: false })
                .range(0, limit + offset);

            if (error) throw error;

            messageLogs = data.map(msg => ({
                id: msg.id,
                source: 'MESSAGING',
                type: msg.message_type?.toUpperCase() || 'MESSAGE',
                details: { message: msg.message_content, phone: msg.phone_number },
                actor: 'System', // Or could be the admin who triggered it if we tracked that
                status: msg.status?.toUpperCase() || 'UNKNOWN',
                created_at: msg.sent_at || msg.created_at,
                metadata: { customer_id: msg.customer_id }
            }));
        } catch (err) {
            console.error('Error fetching message logs:', err);
        }
    }

    // 3. Merge and Sort
    const allLogs = [...systemLogs, ...messageLogs].sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

    // 4. Paginate
    const paginatedLogs = allLogs.slice(offset, offset + limit);

    return NextResponse.json({
        logs: paginatedLogs,
        total_approx: allLogs.length // This is an approximation since we limited the fetch
    });
}

