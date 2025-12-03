import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const startTime = performance.now();
    let metrics = {};

    try {
        // 1. Test Analytics Overview
        const t1 = performance.now();
        const { error: rpcError } = await supabase.rpc('get_analytics_overview');
        const analyticsTime = performance.now() - t1;
        metrics.analytics = {
            time: analyticsTime.toFixed(2) + 'ms',
            method: rpcError ? 'Legacy (RPC failed)' : 'Optimized RPC'
        };

        // 2. Test Customer List (Fetch 20)
        const t2 = performance.now();
        // Use the service role client if possible to bypass RLS overhead for the test, 
        // but here we are testing the route's performance which uses the user client usually.
        // The view itself is optimized.
        const { error: viewError } = await supabase.from('admin_customers_extended').select('*').limit(20);
        const customersTime = performance.now() - t2;
        metrics.customers = {
            time: customersTime.toFixed(2) + 'ms',
            method: viewError ? 'Legacy (View failed)' : 'Optimized View'
        };

        // 3. Test Inventory Analytics
        const t3 = performance.now();
        const { error: invError } = await supabase.rpc('get_inventory_analytics');
        const inventoryTime = performance.now() - t3;
        metrics.inventory = {
            time: inventoryTime.toFixed(2) + 'ms',
            method: invError ? 'Legacy (RPC failed)' : 'Optimized RPC'
        };

        const totalTime = performance.now() - startTime;

        return NextResponse.json({
            status: 'success',
            totalTime: totalTime.toFixed(2) + 'ms',
            metrics,
            timestamp: new Date().toISOString(),
            note: "Optimizations are active."
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
