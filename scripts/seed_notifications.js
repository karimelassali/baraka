const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // OR SERVICE_ROLE_KEY if RLS is strict

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedNotifications() {
    console.log('Seeding notifications...');

    const notifications = [
        {
            type: 'info',
            title: 'Welcome to the new Notification System',
            message: 'This is a test notification to verify the new system.',
            link: '/admin',
            created_at: new Date().toISOString()
        },
        {
            type: 'success',
            title: 'New Order Received',
            message: 'Order #12345 has been placed by John Doe.',
            link: '/admin/orders/12345',
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
            type: 'warning',
            title: 'Low Stock Alert',
            message: 'Product "Premium Dates" is running low on stock (5 items left).',
            link: '/admin/inventory',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        },
        {
            type: 'error',
            title: 'Payment Failed',
            message: 'Payment for Order #12340 failed. Please check with the customer.',
            link: '/admin/orders/12340',
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
        }
    ];

    const { error } = await supabase.from('notifications').insert(notifications);

    if (error) {
        console.error('Error seeding notifications:', error);
    } else {
        console.log('Notifications seeded successfully!');
    }
}

seedNotifications();
