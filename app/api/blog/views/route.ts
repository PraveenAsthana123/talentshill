import { NextRequest, NextResponse } from 'next/server';
import { trackView } from '@/lib/db/blog-queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, sessionId } = body;

    if (!postId || !sessionId) {
      return NextResponse.json({ error: 'postId and sessionId are required' }, { status: 400 });
    }

    const result = trackView(postId, sessionId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
