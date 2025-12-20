// app/api/admin/inventory/products/[id]/route.js

import { createClient } from '../../../../../../lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { notifySuperAdmins } from '../../../../../../lib/email/notifications';
import { createNotification } from '@/lib/notifications';
import { logAdminAction } from '../../../../../../lib/admin-logger';

export async function GET(request, { params }) {
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

        const { data: product, error: productError } = await supabase
            .from('inventory_products')
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (productError) {
            console.error('Error fetching product:', productError);
            return NextResponse.json({ error: productError.message }, { status: 500 });
        }

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Error in GET /api/admin/inventory/products/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

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
            batch_number,
            is_active
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

        // Update product
        const { data: updatedProduct, error: updateError } = await supabase
            .from('inventory_products')
            .update({
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
                is_active: is_active !== undefined ? is_active : true,
                updated_by: adminData.id
            })
            .eq('id', id)
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .single();

        if (updateError) {
            console.error('Error updating product:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Check for low stock and notify
        if (updatedProduct.quantity <= updatedProduct.minimum_stock_level) {
            try {
                // System Notification
                await createNotification({
                    type: 'warning',
                    title: 'Avviso Scorte Basse',
                    message: `Il prodotto ${updatedProduct.name} scarseggia (rimasti ${updatedProduct.quantity}).`,
                    link: '/admin/inventory',
                    metadata: { productId: updatedProduct.id, quantity: updatedProduct.quantity }
                });

                await notifySuperAdmins({
                    subject: `Avviso Scorte Basse: ${updatedProduct.name}`,
                    level: 'WARNING',
                    html: `
                        <h3>Avviso Scorte Basse</h3>
                        <p>Il prodotto <strong>${updatedProduct.name}</strong> sta esaurendo le scorte.</p>
                        <ul>
                            <li><strong>Quantità Attuale:</strong> ${updatedProduct.quantity} ${updatedProduct.unit}</li>
                            <li><strong>Livello Minimo:</strong> ${updatedProduct.minimum_stock_level} ${updatedProduct.unit}</li>
                            <li><strong>SKU:</strong> ${updatedProduct.sku || 'N/A'}</li>
                            <li><strong>Posizione:</strong> ${updatedProduct.location_in_shop || 'N/A'}</li>
                        </ul>
                        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/inventory">Gestisci Inventario</a></p>
                    `
                });
            } catch (notifyError) {
                console.error('Failed to notify admins of low stock:', notifyError);
            }
        }

        // Log the action
        await logAdminAction({
            action: 'UPDATE',
            resource: 'inventory_products',
            resourceId: id,
            details: { name, quantity, is_active },
            adminId: adminData.id
        });

        return NextResponse.json({ product: updatedProduct });
    } catch (error) {
        console.error('Error in PUT /api/admin/inventory/products/[id]:', error);
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

        // Soft delete by setting is_active to false
        const { data: deletedProduct, error: deleteError } = await supabase
            .from('inventory_products')
            .update({
                is_active: false,
                updated_by: adminData.id
            })
            .eq('id', id)
            .select()
            .single();

        if (deleteError) {
            console.error('Error deleting product:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        if (!deletedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Log the action
        await logAdminAction({
            action: 'DELETE',
            resource: 'inventory_products',
            resourceId: id,
            details: { name: deletedProduct.name },
            adminId: adminData.id
        });

        return NextResponse.json({ message: 'Product deleted successfully', product: deletedProduct });
    } catch (error) {
        console.error('Error in DELETE /api/admin/inventory/products/[id]:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
