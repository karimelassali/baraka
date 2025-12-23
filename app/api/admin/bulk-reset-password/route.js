import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { logAdminAction } from '../../../../lib/admin-logger';

export async function POST(request) {
    try {
        const body = await request.json();
        const { newPassword, accessPassword } = body;

        // Verify access via password
        const expectedPassword = process.env.NEXT_PUBLIC_ADD_CLIENT_PASSWORD;
        if (!accessPassword || accessPassword !== expectedPassword) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
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

        // 1. Fetch all customers
        let allCustomers = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data: customers, error: fetchError } = await supabaseAdmin
                .from('customers')
                .select('id, auth_id, email, first_name, last_name, phone_number')
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (fetchError) throw fetchError;

            if (customers.length > 0) {
                allCustomers = [...allCustomers, ...customers];
                if (customers.length < pageSize) hasMore = false;
                page++;
            } else {
                hasMore = false;
            }
        }

        console.log(`Found ${allCustomers.length} customers total.`);

        // 2. Fetch all Auth Users to check metadata
        let allAuthUsers = {};
        let authPage = 1;
        let hasMoreAuth = true;

        while (hasMoreAuth) {
            const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
                page: authPage,
                perPage: 1000
            });

            if (authError) throw authError;

            if (users.length > 0) {
                users.forEach(u => {
                    allAuthUsers[u.id] = u;
                });
                authPage++;
            } else {
                hasMoreAuth = false;
            }
            // Safety break for very large datasets if needed, but 1000 per page is efficient
            if (users.length < 1000) hasMoreAuth = false;
        }

        console.log(`Found ${Object.keys(allAuthUsers).length} auth users.`);

        // 3. Filter Users
        const usersToUpdate = [];
        const usersToCreate = [];

        for (const customer of allCustomers) {
            if (customer.auth_id) {
                const authUser = allAuthUsers[customer.auth_id];
                if (authUser) {
                    // Check if user has default password (force_password_change === true)
                    // If force_password_change is missing or false, we assume they set their own password -> SKIP
                    if (authUser.user_metadata?.force_password_change === true) {
                        usersToUpdate.push(customer.auth_id);
                    }
                } else {
                    // Auth ID exists in customer table but not in Auth (Broken Link) -> Treat as Create?
                    // Safer to try to update if possible, or re-create. 
                    // Let's treat as Create if we can't find them, but we need to handle the ID conflict.
                    // Actually, if auth_id is invalid, we should probably clear it and create new.
                    // For now, let's just log it and maybe skip to avoid complex data fixes in this script.
                    console.warn(`Customer ${customer.id} has auth_id ${customer.auth_id} but not found in Auth.`);
                }
            } else if (customer.email) {
                // No Auth ID, but has email -> Create User
                usersToCreate.push(customer);
            }
        }

        console.log(`Targeting: ${usersToUpdate.length} updates, ${usersToCreate.length} creations.`);

        let successCount = 0;
        let failCount = 0;

        // 4. Perform Updates
        const batchSize = 10;

        // Updates
        for (let i = 0; i < usersToUpdate.length; i += batchSize) {
            const batch = usersToUpdate.slice(i, i + batchSize);
            await Promise.all(batch.map(async (authId) => {
                try {
                    const { error } = await supabaseAdmin.auth.admin.updateUserById(
                        authId,
                        {
                            password: newPassword,
                            // email_confirm: true, // REMOVED: Do not auto-verify on password reset
                            user_metadata: { force_password_change: true }
                        }
                    );
                    if (error) throw error;
                    successCount++;
                } catch (err) {
                    console.error(`Failed to update user ${authId}:`, err);
                    failCount++;
                }
            }));
        }

        // Creations
        for (let i = 0; i < usersToCreate.length; i += batchSize) {
            const batch = usersToCreate.slice(i, i + batchSize);
            await Promise.all(batch.map(async (customer) => {
                try {
                    // Create Auth User
                    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                        email: customer.email,
                        password: newPassword,
                        // email_confirm: true, // REMOVED: Do not auto-verify on password reset
                        user_metadata: {
                            first_name: customer.first_name,
                            last_name: customer.last_name,
                            phone_number: customer.phone_number,
                            force_password_change: true
                        }
                    });

                    if (createError) throw createError;

                    // Link back to Customer
                    const { error: linkError } = await supabaseAdmin
                        .from('customers')
                        .update({ auth_id: newUser.user.id })
                        .eq('id', customer.id);

                    if (linkError) {
                        console.error(`Failed to link new auth user to customer ${customer.id}:`, linkError);
                        // Not counting as full fail if auth created, but it's an issue.
                    }

                    successCount++;
                } catch (err) {
                    console.error(`Failed to create user for customer ${customer.id}:`, err);
                    failCount++;
                }
            }));
        }

        // Log the bulk action
        await logAdminAction({
            action: 'BULK_RESET_SMART',
            resource: 'customers',
            resourceId: 'ALL',
            details: {
                updates: usersToUpdate.length,
                creations: usersToCreate.length,
                successCount,
                failCount,
                source: 'add-client-page'
            },
            adminId: null
        });

        return NextResponse.json({
            success: true,
            message: `Operation complete. Updated: ${usersToUpdate.length}, Created: ${usersToCreate.length}. Success: ${successCount}, Failed: ${failCount}`,
            stats: {
                updated: usersToUpdate.length,
                created: usersToCreate.length,
                success: successCount,
                failed: failCount,
                total: usersToUpdate.length + usersToCreate.length
            }
        });

    } catch (error) {
        console.error('Error in bulk reset:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
