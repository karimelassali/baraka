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

export async function getSuppliers() {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching suppliers:', error);
        throw new Error('Failed to fetch suppliers');
    }

    return data;
}

export async function createSupplier(supplierData) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();

    if (error) {
        console.error('Error creating supplier:', error);
        throw new Error('Failed to create supplier');
    }

    return data;
}

export async function updateSupplier(id, supplierData) {
    const supabase = await getSupabase();
    const { data, error } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating supplier:', error);
        throw new Error('Failed to update supplier');
    }

    return data;
}

export async function deleteSupplier(id) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting supplier:', error);
        throw new Error('Failed to delete supplier');
    }

    return true;
}
