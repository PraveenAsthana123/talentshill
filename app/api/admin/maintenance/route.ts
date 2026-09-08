import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getMaintenanceStatus, setMaintenanceMode } from '@/lib/ops/maintenance';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('maintenance', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const status = getMaintenanceStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch maintenance status' }, { status: 500 });
  }
});

export const POST = withPermission('maintenance', 'manage')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    setMaintenanceMode(body.enabled, body.message, body.scheduledEnd);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
});
