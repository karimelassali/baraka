import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);

        // Try to get the session to verify connection
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message,
                type: 'Auth Error'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Server-side connection established',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message,
            type: 'Unexpected Error'
        }, { status: 500 });
    }
}
