import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, upsertSetting, logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET() {
  try {
    const settings = getAllSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
