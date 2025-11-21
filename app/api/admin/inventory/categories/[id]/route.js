// app/api/admin/inventory/categories/[id]/route.js

import { createClient } from '../../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request, { params }) {
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
        const { id } = await params;
        const body = await request.json();
        const { name, description, color, icon, is_active } = body;

        // Validation
        if (!name || name.trim() === '') {
            return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
        }

        // Update category
        const { data: updatedCategory, error: updateError } = await supabase
            .from('product_categories')
            .update({
                name: name.trim(),
                description: description?.trim() || null,
                color: color || '#8B5CF6',
                icon: icon || 'package',
                is_active: is_active !== undefined ? is_active : true,
                updated_by: adminData.id
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating category:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        if (!updatedCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ category: updatedCategory });
    } catch (error) {
        console.error('Error in PUT /api/admin/inventory/categories/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
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
        const { id } = await params;

        // Check if category has products
        const { count, error: countError } = await supabase
            .from('inventory_products')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', id)
            .eq('is_active', true);

        if (countError) {
            console.error('Error checking category products:', countError);
            return NextResponse.json({ error: countError.message }, { status: 500 });
        }

        if (count > 0) {
            return NextResponse.json({
                error: 'Cannot delete category with existing products. Please reassign or delete the products first.'
            }, { status: 400 });
        }

        // Soft delete by setting is_active to false
        const { data: deletedCategory, error: deleteError } = await supabase
            .from('product_categories')
            .update({
                is_active: false,
                updated_by: adminData.id
            })
            .eq('id', id)
            .select()
            .single();

        if (deleteError) {
            console.error('Error deleting category:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        if (!deletedCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted successfully', category: deletedCategory });
    } catch (error) {
        console.error('Error in DELETE /api/admin/inventory/categories/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
