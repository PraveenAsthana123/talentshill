import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runModuleRegistryDriftPipeline } from '@/lib/pipelines/module-registry-drift-pipeline';

export const POST = withPermission('health', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { moduleRegistryId?: string } | null;
  if (!body?.moduleRegistryId) return NextResponse.json({ error: 'moduleRegistryId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runModuleRegistryDriftPipeline({ moduleRegistryId: body.moduleRegistryId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.moduleRegistryId ? 200 : 404 });
});
