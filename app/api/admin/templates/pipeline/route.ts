import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runTemplateReadinessPipeline } from '@/lib/pipelines/template-readiness-pipeline';

export const POST = withPermission('templates', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { templateId?: string } | null;
  if (!body?.templateId) return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runTemplateReadinessPipeline({ templateId: body.templateId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.templateId ? 200 : 404 });
});
