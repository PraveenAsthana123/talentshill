import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runSettingIntegrityAgent } from '@/lib/agents/setting-integrity-agent';

export const POST = withPermission('settings', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { settingKey?: string } | null;
  if (!body?.settingKey) return NextResponse.json({ error: 'settingKey is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runSettingIntegrityAgent({ settingKey: body.settingKey, triggeredBy: userId });
    return NextResponse.json(result, { status: result.settingKey ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
