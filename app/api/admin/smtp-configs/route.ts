import { NextRequest, NextResponse } from 'next/server';
import { getAllSmtpConfigs, createSmtpConfig } from '@/lib/db/email-profile-queries';
import nodemailer from 'nodemailer';
import { withPermission, getSessionUserIdAsync, checkPermission } from '@/lib/security/rbac';

export const GET = withPermission('smtp_configs', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const configs = getAllSmtpConfigs();
    // Mask passwords in response
    const masked = configs.map(c => ({ ...c, password: '••••••••' }));
    return NextResponse.json({ configs: masked });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
  }
});

// Not wrapped in withPermission(...) at the top level -- create and
// test-connection were bundled behind one 'create' gate, which meant a
// user who should only be allowed to test a config (not create real ones)
// had no way to get narrower access. Per-branch checks fix that without a
// route split.
export async function POST(request: NextRequest, context: unknown) {
  const userId = await getSessionUserIdAsync(request);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    // Test connection if requested
    if (body.action === 'test') {
      if (!checkPermission(userId, 'smtp_configs', 'manage')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      const { host, port, secure, username, password } = body;
      try {
        const transport = nodemailer.createTransport({
          host, port, secure, auth: { user: username, pass: password },
        });
        await transport.verify();
        return NextResponse.json({ success: true, message: 'Connection successful' });
      } catch (err) {
        return NextResponse.json({
          success: false,
          message: err instanceof Error ? err.message : 'Connection failed',
        });
      }
    }

    if (!checkPermission(userId, 'smtp_configs', 'create')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    const { name, host, port, secure, username, password } = body;
    if (!name || !host || !username || !password) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const id = createSmtpConfig({ name, host, port: port || 587, secure: secure || false, username, password });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create config' }, { status: 500 });
  }
}
