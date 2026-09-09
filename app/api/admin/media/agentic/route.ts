import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMediaIntegrityAgent } from '@/lib/agents/media-integrity-agent';

export const POST = withPermission('media', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { mediaId?: string } | null;
  if (!body?.mediaId) return NextResponse.json({ error: 'mediaId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runMediaIntegrityAgent({ mediaId: body.mediaId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.mediaId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
