import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { computeAndSnapshotAllKpis, getLatestSnapshots } from '@/lib/kpi/kpi-engine';

export const GET = withPermission('kpi_engine', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ snapshots: getLatestSnapshots() });
});

// Real recompute over a trailing window (default 30 days) -- always
// re-queries real tables, never returns a cached/stale number silently.
export const POST = withPermission('kpi_engine', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => ({})) as { days?: number };
  const days = body.days && body.days > 0 ? body.days : 30;
  const results = computeAndSnapshotAllKpis(days);
  return NextResponse.json({ days, results });
});
