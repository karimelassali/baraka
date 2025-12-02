'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );
}

export async function upsertOrderItem(itemData) {
    const supabase = await getSupabase();

    // If id is present, it's an update, otherwise insert
    const { data, error } = await supabase
        .from('order_items')
        .upsert(itemData)
        .select()
        .single();

    if (error) {
        console.error('Error upserting order item:', error);
        throw new Error('Failed to save order item');
    }

    return data;
}

export async function deleteOrderItem(id) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting order item:', error);
        throw new Error('Failed to delete order item');
    }

    return true;
}
