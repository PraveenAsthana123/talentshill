import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runVoiceAssetReadinessAgent } from '@/lib/agents/voice-asset-readiness-agent';

export const POST = withPermission('voice_ai', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { assetId?: string } | null;
  if (!body?.assetId) return NextResponse.json({ error: 'assetId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runVoiceAssetReadinessAgent({ assetId: body.assetId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.assetId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
