import { NextRequest, NextResponse } from 'next/server';
import { getAllIntegrations, getAccountsByIntegration } from '@/lib/db/integration-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('integrations', 'read')(async (_request: NextRequest, _context: unknown) => {
  const integrations = getAllIntegrations();
  const result = integrations.map(i => ({
    ...i,
    configSchema: i.configSchema ? JSON.parse(i.configSchema) : null,
    // Never send raw credentials to the client -- the account row's
    // `credentials` field previously went out verbatim (plaintext
    // API keys/secrets) in this list response.
    accounts: getAccountsByIntegration(i.id).map(({ credentials, ...a }) => ({ ...a, hasCredentials: !!credentials })),
  }));
  return NextResponse.json(result);
});
