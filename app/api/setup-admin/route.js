import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { email, password, fullName, secretKey } = await request.json();

        // Validate Secret Key
        const envSecret = process.env.ADMIN_SETUP_SECRET;
        if (!envSecret || secretKey !== envSecret) {
            return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
        }

        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // 1. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'User creation failed' }, { status: 400 });
        }

        // 2. Add to admin_users table
        const { error: dbError } = await supabase
            .from('admin_users')
            .insert([
                {
                    auth_id: authData.user.id,
                    email: email,
                    full_name: fullName,
                    role: 'admin',
                    is_active: true
                }
            ]);

        if (dbError) {
            // Optional: Cleanup auth user if DB insert fails
            return NextResponse.json({ error: 'Failed to create admin profile: ' + dbError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Admin user created successfully' });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
