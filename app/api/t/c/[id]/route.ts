import { NextRequest, NextResponse } from 'next/server';
import { logClickEvent } from '@/lib/db/tracking-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    const decodedUrl = decodeURIComponent(url);

    // Log the click event
    try {
      logClickEvent(id, decodedUrl);
    } catch {
      // Silent fail for tracking
    }

    return NextResponse.redirect(decodedUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid tracking link' }, { status: 400 });
  }
}
