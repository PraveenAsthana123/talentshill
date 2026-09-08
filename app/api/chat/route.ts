import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessionByToken, createRequest } from '@/lib/db/chat-queries';
import { processMessage } from '@/lib/chat/response-engine';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionToken } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create session
    let token = sessionToken;
    let session: { id: string; visitorEmail: string | null; visitorName: string | null } | null =
      token ? (getSessionByToken(token) ?? null) : null;

    if (!session) {
      token = randomUUID();
      const ipHash = request.headers.get('x-forwarded-for') || 'unknown';
      const userAgent = request.headers.get('user-agent') || '';
      const sessionId = createSession({
        sessionToken: token,
        ipHash,
        userAgent,
      });
      session = { id: sessionId, visitorEmail: null, visitorName: null };
    }

    // Auto-create request on first substantive message (>10 chars)
    let requestId: string | undefined;
    if (message.length > 10) {
      requestId = createRequest({
        sessionId: session.id,
        subject: message.substring(0, 100),
        category: 'general',
      });
    }

    // Process message (persist + evaluate + generate response + evaluate response)
    const result = await processMessage(message, {
      sessionId: session.id,
      requestId,
      visitorEmail: session.visitorEmail ?? undefined,
      visitorName: session.visitorName ?? undefined,
    });

    return NextResponse.json({
      response: result.responseText,
      sessionToken: token,
    });
  } catch {
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}
