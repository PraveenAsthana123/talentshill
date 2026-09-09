import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runTemplateReadinessAgent } from '@/lib/agents/template-readiness-agent';

export const POST = withPermission('templates', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { templateId?: string } | null;
  if (!body?.templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runTemplateReadinessAgent({ templateId: body.templateId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.templateId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
