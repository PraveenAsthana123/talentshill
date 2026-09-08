import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken, captureEmail } from '@/lib/db/chat-queries';
import { getContactByEmail } from '@/lib/db/contact-crm-queries';

export async function POST(request: NextRequest) {
  try {
    const { sessionToken, email, name } = await request.json();
    if (!sessionToken || !email) {
      return NextResponse.json({ error: 'Session token and email are required' }, { status: 400 });
    }

    const session = getSessionByToken(sessionToken);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    captureEmail(session.id, email, name);

    // Link to CRM contact if exists
    const contact = getContactByEmail(email);

    return NextResponse.json({
      success: true,
      contactLinked: !!contact,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to capture email' }, { status: 500 });
  }
}
