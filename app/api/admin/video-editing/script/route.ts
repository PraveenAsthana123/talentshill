import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { generateVideoScript, getScriptsForClipPlan } from '@/lib/video/video-script-engine';

// Reuses the 'video_editing' RBAC resource -- this extends the existing
// Video Repurposing Factory module.
export const GET = withPermission('video_editing', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const clipPlanId = searchParams.get('clipPlanId');
  if (!clipPlanId) return NextResponse.json({ error: 'clipPlanId is required' }, { status: 400 });
  return NextResponse.json({ scripts: getScriptsForClipPlan(clipPlanId) });
});

export const POST = withPermission('video_editing', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { topic?: string; targetPlatform?: string; clipPlanId?: string } | null;
  if (!body?.topic || !body.targetPlatform) return NextResponse.json({ error: 'topic and targetPlatform are required' }, { status: 400 });
  try {
    const result = await generateVideoScript({ topic: body.topic, targetPlatform: body.targetPlatform, clipPlanId: body.clipPlanId });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to generate script' }, { status: 502 });
  }
});
