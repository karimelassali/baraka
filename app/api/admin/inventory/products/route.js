// app/api/admin/inventory/products/route.js

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

    const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminError || !adminData) {
        return NextResponse.json({ error: 'Access denied: Admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('category_id');
    const expirationFilter = searchParams.get('expiration'); // 'expired', 'expiring_soon', 'all'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0;

    try {
        // Build query
        let query = supabase
            .from('inventory_products')
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .eq('is_active', true)
            .range(offset, offset + limit - 1)
            .order('expiration_date', { ascending: true });

        // Apply filters
        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
        }

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        // Expiration filter
        const today = new Date().toISOString().split('T')[0];
        if (expirationFilter === 'expired') {
            query = query.lt('expiration_date', today);
        } else if (expirationFilter === 'expiring_soon') {
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            query = query.gte('expiration_date', today).lte('expiration_date', weekFromNow.toISOString().split('T')[0]);
        }

        const { data: products, error: productsError } = await query;

        if (productsError) {
            console.error('Error fetching products:', productsError);
            return NextResponse.json({ error: productsError.message }, { status: 500 });
        }

        // Get total count
        let countQuery = supabase
            .from('inventory_products')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true);

        if (search) {
            countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
        }
        if (categoryId) {
            countQuery = countQuery.eq('category_id', categoryId);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
            console.error('Error counting products:', countError);
        }

        return NextResponse.json({
            products,
            total: count || 0,
            limit,
            offset
        });
    } catch (error) {
        console.error('Error in GET /api/admin/inventory/products:', error);
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
        const {
            category_id,
            name,
            description,
            quantity,
            unit,
            minimum_stock_level,
            purchase_price,
            selling_price,
            currency,
            supplier_name,
            supplier_contact,
            sku,
            barcode,
            location_in_shop,
            expiration_date,
            batch_number
        } = body;

        // Validation
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
        }

        if (!expiration_date) {
            return NextResponse.json({ error: 'Expiration date is required' }, { status: 400 });
        }

        if (quantity === undefined || quantity === null || quantity < 0) {
            return NextResponse.json({ error: 'Valid quantity is required' }, { status: 400 });
        }

        // Create product
        const { data: newProduct, error: createError } = await supabase
            .from('inventory_products')
            .insert([
                {
                    category_id: category_id || null,
                    name: name.trim(),
                    description: description?.trim() || null,
                    quantity: parseFloat(quantity),
                    unit: unit || 'pcs',
                    minimum_stock_level: minimum_stock_level ? parseFloat(minimum_stock_level) : 0,
                    purchase_price: purchase_price ? parseFloat(purchase_price) : null,
                    selling_price: selling_price ? parseFloat(selling_price) : null,
                    currency: currency || 'EUR',
                    supplier_name: supplier_name?.trim() || null,
                    supplier_contact: supplier_contact?.trim() || null,
                    sku: sku?.trim() || null,
                    barcode: barcode?.trim() || null,
                    location_in_shop: location_in_shop?.trim() || null,
                    expiration_date,
                    batch_number: batch_number?.trim() || null,
                    created_by: adminData.id,
                    updated_by: adminData.id
                }
            ])
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .single();

        if (createError) {
            console.error('Error creating product:', createError);
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        return NextResponse.json({ product: newProduct }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/admin/inventory/products:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
