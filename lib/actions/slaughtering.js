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

export async function getSlaughteringRecords(filters = {}) {
    const supabase = await getSupabase();

    let query = supabase
        .from('slaughtering_records')
        .select(`
            *,
            supplier:suppliers(id, name)
        `)
        .order('record_date', { ascending: filters.ascending === true });

    // Date Filtering
    if (filters.month !== undefined && filters.year) {
        const start = new Date(filters.year, filters.month, 1).toISOString();
        const end = new Date(filters.year, filters.month + 1, 0).toISOString(); // Last day of month

        query = query.gte('record_date', start).lte('record_date', end);
    } else if (filters.year) {
        const start = new Date(filters.year, 0, 1).toISOString();
        const end = new Date(filters.year, 11, 31).toISOString();
        query = query.gte('record_date', start).lte('record_date', end);
    }

    // Other Filters
    if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
    }

    if (filters.animal_type) {
        query = query.eq('animal_type', filters.animal_type);
    }

    // Search (by supplier name)
    if (filters.search) {
        query = query.ilike('supplier.name', `%${filters.search}%`);
    }

    // Pagination
    if (filters.limit) {
        query = query.limit(filters.limit);
    }

    if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching slaughtering records:', error);
        throw new Error('Failed to fetch slaughtering records');
    }

    return data;
}

export async function createSlaughteringRecord(recordData) {
    const supabase = await getSupabase();

    // Basic validation/sanitization could go here

    // Get current user for created_by
    const { data: { user } } = await supabase.auth.getUser();
    let createdBy = null;

    if (user) {
        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (adminUser) {
            createdBy = adminUser.id;
        }
    }

    const { data, error } = await supabase
        .from('slaughtering_records')
        .insert([{ ...recordData, created_by: createdBy }])
        .select()
        .single();

    if (error) {
        console.error('Error creating slaughtering record:', error);
        throw new Error('Failed to create slaughtering record');
    }

    return data;
}

export async function updateSlaughteringRecord(id, updates) {
    const supabase = await getSupabase();

    const { data, error } = await supabase
        .from('slaughtering_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating slaughtering record:', error);
        throw new Error('Failed to update slaughtering record');
    }

    return data;
}

export async function deleteSlaughteringRecord(id) {
    const supabase = await getSupabase();
    const { error } = await supabase
        .from('slaughtering_records')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting slaughtering record:', error);
        throw new Error('Failed to delete slaughtering record');
    }

    return true;
}

export async function getSlaughteringStats(startDate, endDate) {
    const supabase = await getSupabase();

    // We'll fetch all records within range and aggregate in JS for flexibility
    // Or use RPC if performance becomes an issue

    let query = supabase
        .from('slaughtering_records')
        .select(`
            *,
            supplier:suppliers(name)
        `);

    if (startDate) query = query.gte('record_date', startDate);
    if (endDate) query = query.lte('record_date', endDate);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching stats:', error);
        throw new Error('Failed to fetch stats');
    }

    return data;
}
