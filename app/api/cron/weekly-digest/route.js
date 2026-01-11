import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { notifySuperAdmins } from '@/lib/email/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Optional: Check for Cron Secret
        const authHeader = request.headers.get('authorization');
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- 1. Weekly Stats (Last 7 Days) ---
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        // New Customers
        const { count: newCustomersCount } = await supabaseAdmin
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

        // Completed Orders Revenue
        const { data: completedOrders } = await supabaseAdmin
            .from('orders')
            .select('total_amount')
            .eq('status', 'completed')
            .gte('updated_at', sevenDaysAgo.toISOString());

        const ordersRevenue = completedOrders?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
        const ordersCount = completedOrders?.length || 0;

        // Payments Revenue (from /payments)
        const { data: payments } = await supabaseAdmin
            .from('payments')
            .select('amount')
            .gte('due_date', sevenDaysAgo.toISOString()); // Assuming due_date is relevant, or created_at if available

        const paymentsRevenue = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        // Eid Deposits Revenue
        const { data: eidDeposits } = await supabaseAdmin
            .from('eid_deposits')
            .select('amount')
            .gte('created_at', sevenDaysAgo.toISOString());

        const eidRevenue = eidDeposits?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;

        // Total Revenue Calculation
        const totalRevenue = ordersRevenue + paymentsRevenue + eidRevenue;

        // --- 2. Eid Reservations Status ---
        const { data: eidStats } = await supabaseAdmin
            .from('eid_reservations')
            .select('status, is_paid');

        const totalReservations = eidStats?.length || 0;
        const pendingReservations = eidStats?.filter(r => r.status === 'PENDING').length || 0;
        const confirmedReservations = eidStats?.filter(r => r.status === 'CONFIRMED').length || 0;
        const fullyPaidReservations = eidStats?.filter(r => r.is_paid).length || 0;

        // --- 3. Low Stock Items ---
        const { data: lowStockItems } = await supabaseAdmin
            .from('inventory_products')
            .select('name, quantity, minimum_stock_level')
            .eq('is_active', true)
            .lte('quantity', supabaseAdmin.rpc('minimum_stock_level')); // This might fail if rpc not exists, doing manual filter

        // Manual filter for low stock since we can't easily compare two columns in simple select without RPC
        const { data: allProducts } = await supabaseAdmin
            .from('inventory_products')
            .select('name, quantity, minimum_stock_level, unit')
            .eq('is_active', true);

        const lowStockList = allProducts?.filter(p => p.quantity <= p.minimum_stock_level) || [];


        // Generate HTML Report
        const currencyFormatter = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

        const html = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; background-color: #f9fafb; margin: 0; padding: 0;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(to right, #1f2937, #111827); padding: 32px; text-align: center;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 24px;">📊 Baraka Business Digest</h2>
                        <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">${sevenDaysAgo.toLocaleDateString('it-IT')} - ${today.toLocaleDateString('it-IT')}</p>
                    </div>

                    <div style="padding: 32px;">
                        <!-- Weekly Highlights -->
                        <div style="margin-bottom: 32px;">
                            <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 16px; font-size: 18px;">
                                📈 Punti Salienti della Settimana
                            </h3>
                            <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                                <div style="flex: 1; background-color: #eff6ff; padding: 16px; border-radius: 12px; text-align: center;">
                                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Nuovi Clienti</div>
                                    <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin-top: 4px;">+${newCustomersCount}</div>
                                </div>
                                <div style="flex: 1; background-color: #ecfdf5; padding: 16px; border-radius: 12px; text-align: center;">
                                    <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Entrate Totali</div>
                                    <div style="font-size: 24px; font-weight: bold; color: #059669; margin-top: 4px;">${currencyFormatter.format(totalRevenue)}</div>
                                </div>
                            </div>
                            
                            <!-- Revenue Breakdown -->
                            <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; border: 1px solid #e5e7eb;">
                                <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px;">Dettaglio Entrate:</div>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 4px 0; color: #6b7280;">Ordini Completati (${ordersCount})</td>
                                        <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #111827;">${currencyFormatter.format(ordersRevenue)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #6b7280;">Pagamenti Registrati</td>
                                        <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #111827;">${currencyFormatter.format(paymentsRevenue)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #6b7280;">Acconti Eid</td>
                                        <td style="padding: 4px 0; text-align: right; font-weight: 500; color: #111827;">${currencyFormatter.format(eidRevenue)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>

                        <!-- Eid Status -->
                        <div style="margin-bottom: 32px;">
                            <h3 style="color: #1f2937; border-bottom: 2px solid #8b5cf6; padding-bottom: 8px; margin-bottom: 16px; font-size: 18px;">
                                🐑 Prenotazioni Eid
                            </h3>
                            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                <div style="background-color: #f3f4f6; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #4b5563; font-size: 14px;">Totali</span>
                                    <span style="font-weight: bold; color: #111827;">${totalReservations}</span>
                                </div>
                                <div style="background-color: #fffbeb; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #92400e; font-size: 14px;">In Attesa</span>
                                    <span style="font-weight: bold; color: #d97706;">${pendingReservations}</span>
                                </div>
                                <div style="background-color: #ecfdf5; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #065f46; font-size: 14px;">Confermate</span>
                                    <span style="font-weight: bold; color: #059669;">${confirmedReservations}</span>
                                </div>
                                <div style="background-color: #ecfdf5; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #065f46; font-size: 14px;">Pagate</span>
                                    <span style="font-weight: bold; color: #059669;">${fullyPaidReservations}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Low Stock Warning -->
                        <div>
                            <h3 style="color: #1f2937; border-bottom: 2px solid #ef4444; padding-bottom: 8px; margin-bottom: 16px; font-size: 18px;">
                                ${lowStockList.length > 0 ? `⚠️ Avviso Scorte Basse (${lowStockList.length})` : '✅ Inventario OK'}
                            </h3>
                            
                            ${lowStockList.length > 0 ? `
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <thead>
                                        <tr style="background-color: #fee2e2;">
                                            <th style="padding: 10px; text-align: left; color: #991b1b; border-radius: 6px 0 0 6px;">Prodotto</th>
                                            <th style="padding: 10px; text-align: right; color: #991b1b; border-radius: 0 6px 6px 0;">Qta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${lowStockList.slice(0, 5).map(item => `
                                            <tr style="border-bottom: 1px solid #f3f4f6;">
                                                <td style="padding: 10px; color: #374151;">${item.name}</td>
                                                <td style="padding: 10px; text-align: right; color: #dc2626; font-weight: 600;">
                                                    ${item.quantity} ${item.unit}
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                                ${lowStockList.length > 5 ? `
                                    <p style="text-align: center; font-size: 12px; color: #6b7280; margin-top: 8px;">
                                        + altri ${lowStockList.length - 5} articoli...
                                    </p>
                                ` : ''}
                            ` : `
                                <div style="background-color: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center; color: #166534;">
                                    Tutti i livelli di stock sono nella norma.
                                </div>
                            `}
                        </div>

                        <div style="margin-top: 40px; text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display: inline-block; background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: background-color 0.2s;">
                                Vai alla Dashboard
                            </a>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} Baraka. Tutti i diritti riservati.<br>
                            Questa è una notifica automatica.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await notifySuperAdmins({
            subject: `Digest Settimanale Baraka - ${today.toLocaleDateString('it-IT')}`,
            html,
            useTemplate: false
        });

        return NextResponse.json({ success: true, message: 'Weekly digest sent' });

    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
