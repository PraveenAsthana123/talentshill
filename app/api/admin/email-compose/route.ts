import { NextRequest, NextResponse } from 'next/server';
import { sendWithProfile } from '@/lib/email/profile-mailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, html, profileId } = body;

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    await sendWithProfile('broadcast', { to, subject, html });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
