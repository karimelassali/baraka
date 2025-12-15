import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Fetch recent messages
    const { data: messages, error: messagesError } = await supabase
      .from('whatsapp_messages')
      .select(`
        id,
        message_content,
        sent_at,
        customers (first_name, last_name)
      `)
      .order('sent_at', { ascending: false })
      .limit(5);

    if (messagesError) throw messagesError;

    // Fetch recent customers
    const { data: newCustomers, error: customersError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, created_at, country_of_origin')
      .order('created_at', { ascending: false })
      .limit(5);

    if (customersError) throw customersError;

    // Fetch recent reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, rating, created_at, customer_name')
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewsError && reviewsError.code !== 'PGRST116') {
      console.warn("Error fetching reviews:", reviewsError);
    }

    // Fetch recent orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at, suppliers(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.warn("Error fetching orders:", ordersError);
    }

    // Combine and format
    const activity = [];

    if (messages) {
      messages.forEach(m => {
        activity.push({
          id: `msg-${m.id}`,
          type: 'message',
          content: m.message_content,
          date: m.sent_at,
          user: m.customers ? `${m.customers.first_name} ${m.customers.last_name}` : 'Unknown',
          status: 'sent'
        });
      });
    }

    if (newCustomers) {
      newCustomers.forEach(c => {
        activity.push({
          id: `cust-${c.id}`,
          type: 'customer',
          content: `New customer registered from ${c.country_of_origin || 'Unknown'}`,
          date: c.created_at,
          user: `${c.first_name} ${c.last_name}`,
          status: 'joined'
        });
      });
    }

    if (reviews) {
      reviews.forEach(r => {
        activity.push({
          id: `rev-${r.id}`,
          type: 'review',
          content: `New ${r.rating}-star review received`,
          date: r.created_at,
          user: r.customer_name || 'Anonymous',
          status: 'reviewed'
        });
      });
    }

    if (orders) {
      orders.forEach(o => {
        activity.push({
          id: `ord-${o.id}`,
          type: 'order',
          content: `Order #${o.order_number} ${o.status}`,
          date: o.created_at,
          user: o.suppliers?.name || 'Unknown Supplier',
          status: o.status
        });
      });
    }

    // Sort by date desc
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(activity.slice(0, 10));
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}