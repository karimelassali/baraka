//app/api/admin/notifications/route.js
import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Verify admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Fetch counts for different notification types

        // 1. New customers (last 24 hours)
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);

        const { data: newCustomers, error: customersError } = await supabase
            .from('customers')
            .select('id, first_name, last_name, created_at')
            .gte('created_at', oneDayAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(5);

        // 2. Expiring products (from inventory)
        const { data: expiringProducts, error: expiringError } = await supabase
            .from('inventory_products')
            .select('id, name, expiration_date')
            .eq('is_active', true)
            .gte('expiration_date', new Date().toISOString().split('T')[0])
            .lte('expiration_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            .order('expiration_date', { ascending: true })
            .limit(5);

        // 3. Low stock products
        const { data: lowStockProducts, error: lowStockError } = await supabase
            .rpc('get_low_stock_products')
            .limit(5);

        // 4. Pending reviews
        const { data: pendingReviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('id, customer_name, created_at')
            .eq('approved', false)
            .order('created_at', { ascending: false })
            .limit(5);

        const notifications = {
            new_customers: {
                count: newCustomers?.length || 0,
                items: newCustomers || [],
                icon: 'Users',
                color: 'blue'
            },
            expiring_products: {
                count: expiringProducts?.length || 0,
                items: expiringProducts || [],
                icon: 'AlertTriangle',
                color: 'red'
            },
            low_stock: {
                count: lowStockProducts?.length || 0,
                items: lowStockProducts || [],
                icon: 'Package',
                color: 'orange'
            },
            pending_reviews: {
                count: pendingReviews?.length || 0,
                items: pendingReviews || [],
                icon: 'MessageCircle',
                color: 'yellow'
            }
        };

        const totalCount = notifications.new_customers.count +
            notifications.expiring_products.count +
            notifications.low_stock.count +
            notifications.pending_reviews.count;

        return NextResponse.json({
            total: totalCount,
            notifications
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
