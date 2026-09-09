import { NextResponse } from 'next/server';
import { getMaintenanceStatus } from '@/lib/ops/maintenance';

// Deliberately public, no auth wrapper. Maintenance-mode status is not
// sensitive (it's what the site tells every visitor), and it must be
// readable by the Edge middleware, which runs on the Edge runtime and
// cannot use better-sqlite3 directly (serverExternalPackages only
// covers the Node.js runtime). This route does the real DB read on the
// Node.js runtime; middleware calls it via a plain fetch().
export async function GET() {
  const status = getMaintenanceStatus();
  return NextResponse.json({ enabled: status.enabled, message: status.message });
}
