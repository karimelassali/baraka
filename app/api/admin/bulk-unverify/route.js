import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function POST(request) {
    try {
        const body = await request.json();
        const { accessPassword } = body;

        // Verify access via password
        const expectedPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;
        if (!accessPassword || accessPassword !== expectedPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        console.log('[Bulk Unverify] Calling SQL function unverify_all_users...');

        // Call the SQL function you created in Supabase
        const { data, error } = await supabaseAdmin.rpc('unverify_all_users');

        if (error) {
            console.error('[Bulk Unverify] SQL function failed:', error);
            throw new Error(`SQL function failed: ${error.message}`);
        }

        console.log('[Bulk Unverify] SQL function executed successfully');

        // Log the action
        await logAdminAction({
            action: 'BULK_UNVERIFY',
            resource: 'customers',
            resourceId: 'ALL',
            details: {
                method: 'sql_function'
            },
            adminId: null
        });

        return NextResponse.json({
            success: true,
            message: 'Tutti gli utenti sono stati de-verificati con successo.',
            stats: {
                method: 'sql_function'
            }
        });

    } catch (error) {
        console.error('Error in bulk unverify:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
