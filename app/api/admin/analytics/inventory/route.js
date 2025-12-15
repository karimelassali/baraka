import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    try {
        // Fetch all products with category information
        const { data: products, error } = await supabase
            .from('inventory_products')
            .select(`
                *,
                category:product_categories(id, name, color)
            `);

        if (error) throw error;

        // Calculate analytics manually
        const totalProducts = products.length;

        let totalValue = 0;
        let totalSalesValue = 0;
        let lowStockCount = 0;
        let expiringSoonCount = 0;
        const categoryMap = {};
        const lowStockItems = [];
        const expiringSoonItems = [];

        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        products.forEach(product => {
            // Value calculation
            const quantity = parseFloat(product.quantity) || 0;
            const purchasePrice = parseFloat(product.purchase_price) || 0;
            const sellingPrice = parseFloat(product.selling_price) || 0;

            totalValue += quantity * purchasePrice;
            totalSalesValue += quantity * sellingPrice;

            // Low stock check
            const minStock = parseFloat(product.minimum_stock_level) || 0;
            if (quantity <= minStock) {
                lowStockCount++;
                lowStockItems.push(product);
            }

            // Expiration check
            if (product.expiration_date) {
                const expDate = new Date(product.expiration_date);
                if (expDate <= sevenDaysFromNow && expDate >= today) {
                    expiringSoonCount++;
                    expiringSoonItems.push(product);
                }
            }

            // Category stats
            const catName = product.category?.name || 'Uncategorized';
            const catColor = product.category?.color || '#cccccc';
            if (!categoryMap[catName]) {
                categoryMap[catName] = { name: catName, value: 0, color: catColor };
            }
            categoryMap[catName].value++;
        });

        const categoryStats = Object.values(categoryMap);

        const analyticsData = {
            totalProducts,
            totalValue,
            totalSalesValue,
            lowStockCount,
            expiringSoonCount,
            categoryStats,
            lowStockItems: lowStockItems.slice(0, 5), // Limit to 5 for preview
            expiringSoonItems: expiringSoonItems.slice(0, 5) // Limit to 5 for preview
        };

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error('Inventory Analytics Error:', error);
        return NextResponse.json({ error: 'Failed to fetch inventory analytics' }, { status: 500 });
    }
}
