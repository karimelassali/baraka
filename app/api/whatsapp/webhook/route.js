// app/api/whatsapp/webhook/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  const data = await request.json();
  // TODO: Process webhook data and update message status
  console.log('Received WhatsApp webhook:', data);
  return NextResponse.json({ status: 'ok' });
}
