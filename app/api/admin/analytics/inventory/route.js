import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const [
            { count: totalProducts },
            { data: products },
            { data: categories }
        ] = await Promise.all([
            supabase.from('inventory_products').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('inventory_products').select('quantity, minimum_stock_level, purchase_price, selling_price, expiration_date, category_id').eq('is_active', true),
            supabase.from('product_categories').select('id, name, color')
        ]);

        const lowStockItems = products?.filter(p => p.quantity <= p.minimum_stock_level) || [];

        const expiringSoonItems = products?.filter(p => {
            if (!p.expiration_date) return false;
            const expDate = new Date(p.expiration_date);
            return expDate >= today && expDate <= thirtyDaysFromNow;
        }) || [];

        const totalCostValue = products?.reduce((sum, p) => sum + ((p.quantity || 0) * (p.purchase_price || 0)), 0) || 0;
        const totalSalesValue = products?.reduce((sum, p) => sum + ((p.quantity || 0) * (p.selling_price || 0)), 0) || 0;

        // Category distribution
        const categoryStats = categories?.map(cat => {
            const count = products?.filter(p => p.category_id === cat.id).length || 0;
            return {
                name: cat.name,
                value: count,
                color: cat.color || '#8B5CF6'
            };
        }).filter(c => c.value > 0) || [];

        return NextResponse.json({
            totalProducts: totalProducts || 0,
            lowStockCount: lowStockItems.length,
            expiringSoonCount: expiringSoonItems.length,
            lowStockItems: lowStockItems.slice(0, 5), // Top 5
            expiringSoonItems: expiringSoonItems.slice(0, 5), // Top 5
            totalValue: totalCostValue,
            totalSalesValue,
            categoryStats
        });
    } catch (error) {
        console.error('Inventory Analytics Error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory analytics' }, { status: 500 });
    }
}
