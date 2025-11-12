import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.ADMIN_EMAIL;

export async function POST(request) {
  const { email, first_name } = await request.json();

  if (!email || !first_name) {
    return NextResponse.json({ error: 'Email and first name are required' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to our platform!',
      html: `<p>Hi ${first_name},</p><p>Thank you for registering. We're excited to have you on board!</p>`,
    });
    return NextResponse.json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
  }
}
