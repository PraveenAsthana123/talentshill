import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRoleHygieneAgent } from '@/lib/agents/role-hygiene-agent';

export const POST = withPermission('roles', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { roleId?: string } | null;
  if (!body?.roleId) return NextResponse.json({ error: 'roleId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runRoleHygieneAgent({ roleId: body.roleId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.roleId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
