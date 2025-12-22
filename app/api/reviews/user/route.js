import { createClient } from '../../../../lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('auth_id', user.id)
        .eq('is_active', true)
        .single();

    if (adminUser) {
        return NextResponse.json({ eligible: true, lastReview: null });
    }

    // Get customer ID
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('auth_id', user.id)
        .single();

    if (customerError || !customer) {
        return NextResponse.json({ error: 'Customer profile not found' }, { status: 404 });
    }

    // Get latest review
    const { data: lastReview, error: reviewError } = await supabase
        .from('reviews')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (!lastReview) {
        return NextResponse.json({ eligible: true, lastReview: null });
    }

    const lastReviewDate = new Date(lastReview.created_at);
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    if (lastReviewDate > fifteenDaysAgo) {
        const nextReviewDate = new Date(lastReviewDate);
        nextReviewDate.setDate(nextReviewDate.getDate() + 15);
        const daysRemaining = Math.ceil((nextReviewDate - new Date()) / (1000 * 60 * 60 * 24));

        return NextResponse.json({
            eligible: false,
            lastReview,
            daysRemaining
        });
    }

    return NextResponse.json({ eligible: true, lastReview });
}
