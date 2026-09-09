import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runModuleRegistryDriftAgent } from '@/lib/agents/module-registry-drift-agent';

export const POST = withPermission('health', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { moduleRegistryId?: string } | null;
  if (!body?.moduleRegistryId) return NextResponse.json({ error: 'moduleRegistryId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runModuleRegistryDriftAgent({ moduleRegistryId: body.moduleRegistryId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.moduleRegistryId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
