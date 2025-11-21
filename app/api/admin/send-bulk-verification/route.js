import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { emails } = body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
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

        const results = {
            success: [],
            failed: []
        };

        // Process emails in parallel but with some concurrency limit if needed.
        // For now, Promise.all is fine for reasonable batch sizes.
        await Promise.all(emails.map(async (email) => {
            try {
                const { error } = await supabaseAdmin.auth.resend({
                    type: 'signup',
                    email: email
                });

                if (error) throw error;
                results.success.push(email);
            } catch (err) {
                console.error(`Failed to send verification to ${email}:`, err);
                results.failed.push({ email, error: err.message });
            }
        }));

        return NextResponse.json({
            message: `Processed ${emails.length} emails`,
            results
        });

    } catch (error) {
        console.error('Error sending bulk verification:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
