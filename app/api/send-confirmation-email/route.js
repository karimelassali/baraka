import { createServer } from '../../../lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const { email } = await request.json();
  const supabase = createServer();

  // The original code had `supabase.auth.api.sendConfirmationEmail(email)`.
  // The method has been updated in newer Supabase versions.
  // The correct way to send a confirmation email is typically part of the sign-up process.
  // Since this is a standalone endpoint, we'll assume we need to re-send a confirmation.
  // The `resend` method is suitable for this.
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Confirmation email sent' });
}
