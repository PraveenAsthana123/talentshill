import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, upsertSetting, logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('settings', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const settings = getAllSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
});

export const PUT = withPermission('settings', 'update')(async (request: NextRequest, _context: unknown) => {
  try {
    const { key, value } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    // Get user from session
    const token = request.cookies.get('admin_session')?.value;
    let userId: string | undefined;
    if (token) {
      const session = await verifyToken(token);
      userId = session?.userId;
    }

    upsertSetting(key, value, userId);

    logAudit({
      entityType: 'setting',
      entityId: key,
      action: 'update',
      userId,
      metadata: { key, value },
    });

    logOperationRun({ moduleKey: 'settings', operationName: 'manual_update_setting', executionMode: 'manual', status: 'completed', inputPayload: { key, value }, triggeredBy: userId });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
});
