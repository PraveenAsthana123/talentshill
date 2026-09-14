import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runBrandMentionSentimentAgent } from '@/lib/agents/brand-mention-sentiment-agent';

export const POST = withPermission('branding', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runBrandMentionSentimentAgent({ mentionId: id, triggeredBy: userId });
    return NextResponse.json(result, { status: result.mentionId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
