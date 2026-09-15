import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getAccountRollups } from '@/lib/abm/account-rollup';

export const GET = withPermission('abm', 'read')(async (_request: NextRequest, _context: unknown) => {
  const rollups = getAccountRollups();
  return NextResponse.json({
    accounts: rollups,
    summary: { totalAccounts: rollups.length, multiStakeholderAccounts: rollups.filter((r) => r.memberCount > 1).length },
  });
});
