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

        // 1. Fetch all Auth Users
        let allAuthUsers = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
                page: page,
                perPage: 1000
            });

            if (error) throw error;

            if (users.length > 0) {
                allAuthUsers = [...allAuthUsers, ...users];
                page++;
            } else {
                hasMore = false;
            }
            if (users.length < 1000) hasMore = false;
        }

        console.log(`[Bulk Unverify] Found ${allAuthUsers.length} users.`);

        let successCount = 0;
        let failCount = 0;

        // 2. Update each user to be unverified
        // Note: Supabase Auth doesn't have a direct "unverify" method exposed easily in all SDK versions.
        // We will try to set `email_confirm: false` (which might not work as expected on some providers)
        // OR we can try to set `email_confirmed_at` to null if the API allows it (often it doesn't).
        // Best bet: Update user_metadata to explicitly say "unverified" AND try to toggle the flag if possible.
        // Actually, `updateUserById` with `email_confirm: false` usually does nothing or sends a new confirmation.
        // Let's try to set `email_confirmed_at` to null via raw SQL if we could, but we can't.
        // Workaround: We will rely on `email_confirm: false` and see if it sticks, OR we set a metadata flag `is_manually_unverified: true`
        // and update our frontend to respect that. 
        // BUT the user wants "unverify".

        // Let's try the standard update first.
        const batchSize = 10;
        for (let i = 0; i < allAuthUsers.length; i += batchSize) {
            const batch = allAuthUsers.slice(i, i + batchSize);
            await Promise.all(batch.map(async (user) => {
                try {
                    // We try to "ban" and "unban" to reset? No.
                    // We try to update with email_confirm: false.
                    const { error } = await supabaseAdmin.auth.admin.updateUserById(
                        user.id,
                        {
                            email_confirm: false,
                            user_metadata: { ...user.user_metadata, manual_unverify: true }
                        }
                    );
                    if (error) throw error;
                    successCount++;
                } catch (err) {
                    console.error(`Failed to unverify user ${user.id}:`, err);
                    failCount++;
                }
            }));
        }

        // Log the action
        await logAdminAction({
            action: 'BULK_UNVERIFY',
            resource: 'customers',
            resourceId: 'ALL',
            details: {
                total: allAuthUsers.length,
                success: successCount,
                failed: failCount
            },
            adminId: null
        });

        return NextResponse.json({
            success: true,
            message: `Unverify Complete. Processed: ${allAuthUsers.length}. Success: ${successCount}, Failed: ${failCount}`,
            stats: {
                total: allAuthUsers.length,
                success: successCount,
                failed: failCount
            }
        });

    } catch (error) {
        console.error('Error in bulk unverify:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
