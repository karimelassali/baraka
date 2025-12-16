import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const supabase = await createClient();

        // Parallelize queries for performance
        const [
            reservationsCount,
            sheepCount,
            goatCount,
            cattleGroupsCount,
            purchasesStats,
            reservationsFinancials
        ] = await Promise.all([
            supabase.from('eid_reservations').select('*', { count: 'exact', head: true }),
            supabase.from('eid_reservations').select('*', { count: 'exact', head: true }).eq('animal_type', 'SHEEP'),
            supabase.from('eid_reservations').select('*', { count: 'exact', head: true }).eq('animal_type', 'GOAT'),
            supabase.from('eid_cattle_groups').select('*', { count: 'exact', head: true }),
            supabase.rpc('calculate_eid_purchase_stats'), // We might need a custom RPC for complex sums if we want true speed, but let's try client-side sum of a lightweight query first or just simple fetch
            supabase.from('eid_deposits').select('amount') // Fetching just amounts is lighter
        ]);

        // For "Total Weight Sold", we need to sum final_weight from reservations
        // Doing this in JS for now as it's flexible, but for "Incredibly Optimized" we should use an RPC.
        // Let's create a simple RPC in the schema if the user runs it, otherwise fallback.
        // Fallback: Fetch only necessary columns
        const { data: weightData } = await supabase.from('eid_reservations').select('final_weight').not('final_weight', 'is', null);
        const totalWeightSold = weightData?.reduce((sum, r) => sum + (r.final_weight || 0), 0) || 0;
        const avgWeight = weightData?.length ? (totalWeightSold / weightData.length).toFixed(1) : 0;

        // Financials
        const totalRevenue = reservationsFinancials.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

        return NextResponse.json({
            total_reservations: reservationsCount.count || 0,
            total_sheep: sheepCount.count || 0,
            total_goats: goatCount.count || 0,
            total_cattle: cattleGroupsCount.count || 0,
            total_revenue: totalRevenue,
            total_weight_sold: totalWeightSold,
            avg_weight: avgWeight
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
