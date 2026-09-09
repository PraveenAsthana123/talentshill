import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runSettingIntegrityPipeline } from '@/lib/pipelines/setting-integrity-pipeline';

export const POST = withPermission('settings', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { settingKey?: string } | null;
  if (!body?.settingKey) return NextResponse.json({ error: 'settingKey is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runSettingIntegrityPipeline({ settingKey: body.settingKey, triggeredBy: userId });
  return NextResponse.json(result, { status: result.settingKey ? 200 : 404 });
});
