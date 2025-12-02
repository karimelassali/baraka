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

export async function createOrderDraft() {
    const supabase = await getSupabase();

    // Create a new empty draft order
    const { data, error } = await supabase
        .from('orders')
        .insert([{ status: 'draft' }])
        .select()
        .single();

    if (error) {
        console.error('Error creating order draft:', error);
        throw new Error('Failed to create order draft');
    }

    return data;
}

export async function getOrders() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      suppliers (name)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        throw new Error('Failed to fetch orders');
    }

    return data;
}

export async function getOrder(id) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      suppliers (*),
      order_items (*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching order:', error);
        return null;
    }

    // Sort items by created_at if needed, though usually insertion order is fine.
    // We can do client side sorting or add .order() to the query if we split it.
    if (data && data.order_items) {
        data.order_items.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    return data;
}

export async function updateOrder(id, updateData) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating order:', error);
        throw new Error('Failed to update order');
    }

    return data;
}

export async function deleteOrder(id) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting order:', error);
        throw new Error('Failed to delete order');
    }

    return true;
}

export async function duplicateOrder(id) {
    const supabase = await getSupabase();

    // 1. Fetch original order with items
    const { data: originalOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

    if (fetchError || !originalOrder) {
        throw new Error('Original order not found');
    }

    // 2. Create new order
    const { data: newOrder, error: createError } = await supabase
        .from('orders')
        .insert([{
            supplier_id: originalOrder.supplier_id,
            status: 'draft',
            internal_note: originalOrder.internal_note ? `${originalOrder.internal_note} (Copy)` : '(Copy)'
        }])
        .select()
        .single();

    if (createError) {
        throw new Error('Failed to create new order');
    }

    // 3. Copy items
    if (originalOrder.order_items && originalOrder.order_items.length > 0) {
        const itemsToInsert = originalOrder.order_items.map(item => ({
            order_id: newOrder.id,
            product_name: item.product_name,
            quantity: item.quantity,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) {
            console.error('Error copying items:', itemsError);
            // We don't rollback here for simplicity, but in production we might want to.
        }
    }

    return newOrder;
}
