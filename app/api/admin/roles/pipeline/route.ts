import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRoleHygienePipeline } from '@/lib/pipelines/role-hygiene-pipeline';

export const POST = withPermission('roles', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { roleId?: string } | null;
  if (!body?.roleId) return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runRoleHygienePipeline({ roleId: body.roleId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.roleId ? 200 : 404 });
});
