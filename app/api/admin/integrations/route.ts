import { NextRequest, NextResponse } from 'next/server';
import { getAllIntegrations, getAccountsByIntegration } from '@/lib/db/integration-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('integrations', 'read')(async (_request: NextRequest, _context: unknown) => {
  const integrations = getAllIntegrations();
  const result = integrations.map(i => ({
    ...i,
    configSchema: i.configSchema ? JSON.parse(i.configSchema) : null,
    accounts: getAccountsByIntegration(i.id),
  }));
  return NextResponse.json(result);
});
