import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { sql } from 'drizzle-orm';

// Public, unauthenticated liveness check -- distinct from
// /api/admin/health (which requires an admin session and returns detailed
// operational data). This exists so an external monitor (e.g.
// scripts/health-monitor.sh) can check "is this actually working" without
// needing a session cookie. No sensitive data returned.
export async function GET() {
  try {
    db.run(sql.raw('SELECT 1'));
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 503 });
  }
}
