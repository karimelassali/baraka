import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createNotification } from '@/lib/notifications';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { product_name, description } = body;

        if (!product_name) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('wishlists')
            .insert([
                {
                    user_id: user.id,
                    product_name,
                    description,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating wishlist item:', error);
            return NextResponse.json(
                { error: 'Failed to create wishlist item' },
                { status: 500 }
            );
        }

        // Create notification
        await createNotification({
            type: 'info',
            title: 'Nuova Richiesta Desideri',
            message: `Nuova richiesta per: ${product_name}`,
            link: '/admin/wishlist',
            metadata: { wishlistId: data.id, productName: product_name }
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
