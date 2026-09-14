import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runVideoRepurposingIdeaAgent } from '@/lib/agents/video-repurposing-idea-agent';

export const POST = withPermission('video_editing', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runVideoRepurposingIdeaAgent({ sourceProjectId: id, triggeredBy: userId });
    return NextResponse.json(result, { status: result.coverage.sourceProjectId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
