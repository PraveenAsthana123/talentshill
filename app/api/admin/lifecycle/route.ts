import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recomputeLifecycleForAllContacts, getLifecycleSummary, getLatestLifecycleRows } from '@/lib/lifecycle/lifecycle-churn';

export const GET = withPermission('lifecycle', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ ...getLifecycleSummary(), rows: getLatestLifecycleRows(20) });
});

export const POST = withPermission('lifecycle', 'manage')(async (_request: NextRequest, _context: unknown) => {
  const result = recomputeLifecycleForAllContacts();
  return NextResponse.json(result);
});
