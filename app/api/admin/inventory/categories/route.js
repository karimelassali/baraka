// app/api/admin/inventory/categories/route.js

import { createClient } from '../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    try {
        // Fetch all categories with product count
        const { data: categories, error: categoriesError } = await supabase
            .from('product_categories')
            .select(`
        *,
        product_count:inventory_products(count)
      `)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (categoriesError) {
            console.error('Error fetching categories:', categoriesError);
            return NextResponse.json({ error: categoriesError.message }, { status: 500 });
        }

        // Transform the count from nested array to simple number
        const categoriesWithCount = categories.map(cat => ({
            ...cat,
            product_count: cat.product_count?.[0]?.count || 0
        }));

        return NextResponse.json({ categories: categoriesWithCount });
    } catch (error) {
        console.error('Error in GET /api/admin/inventory/categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, description, color, icon } = body;

        // Validation
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Create category
        const { data: newCategory, error: createError } = await supabase
            .from('product_categories')
            .insert([
                {
                    name: name.trim(),
                    description: description?.trim() || null,
                    color: color || '#8B5CF6',
                    icon: icon || 'package',
                    created_by: adminData.id,
                    updated_by: adminData.id
                }
            ])
            .select()
            .single();

        if (createError) {
            console.error('Error creating category:', createError);
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        return NextResponse.json({ category: newCategory }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/inventory/categories:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
