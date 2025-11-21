// app/api/admin/inventory/expiring/route.js

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

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const weekFromNowStr = weekFromNow.toISOString().split('T')[0];

        // Get expired products (expiration date before today)
        const { data: expired, error: expiredError } = await supabase
            .from('inventory_products')
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .eq('is_active', true)
            .lt('expiration_date', todayStr)
            .order('expiration_date', { ascending: true });

        if (expiredError) {
            console.error('Error fetching expired products:', expiredError);
        }

        // Get products expiring today
        const { data: expiringToday, error: todayError } = await supabase
            .from('inventory_products')
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .eq('is_active', true)
            .eq('expiration_date', todayStr)
            .order('name', { ascending: true });

        if (todayError) {
            console.error('Error fetching products expiring today:', todayError);
        }

        // Get products expiring tomorrow
        const { data: expiringTomorrow, error: tomorrowError } = await supabase
            .from('inventory_products')
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .eq('is_active', true)
            .eq('expiration_date', tomorrowStr)
            .order('name', { ascending: true });

        if (tomorrowError) {
            console.error('Error fetching products expiring tomorrow:', tomorrowError);
        }

        // Get products expiring within the next 7 days (excluding today and tomorrow)
        const { data: expiringSoon, error: soonError } = await supabase
            .from('inventory_products')
            .select(`
        *,
        category:product_categories(id, name, color, icon)
      `)
            .eq('is_active', true)
            .gt('expiration_date', tomorrowStr)
            .lte('expiration_date', weekFromNowStr)
            .order('expiration_date', { ascending: true });

        if (soonError) {
            console.error('Error fetching products expiring soon:', soonError);
        }

        return NextResponse.json({
            expired: expired || [],
            expiring_today: expiringToday || [],
            expiring_tomorrow: expiringTomorrow || [],
            expiring_soon: expiringSoon || [],
            total_alerts: (expired?.length || 0) + (expiringToday?.length || 0) + (expiringTomorrow?.length || 0) + (expiringSoon?.length || 0)
        });
    } catch (error) {
        console.error('Error in GET /api/admin/inventory/expiring:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
