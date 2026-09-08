import { NextRequest } from 'next/server';
import { logOpenEvent } from '@/lib/db/tracking-queries';
import { TRACKING_PIXEL } from '@/lib/tracking/pixel';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Log the open event (non-blocking - don't let errors prevent pixel delivery)
    try {
      logOpenEvent(id);
    } catch {
      // Silent fail for tracking - don't break email display
    }

    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch {
    return new Response(TRACKING_PIXEL, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    });
  }
}
