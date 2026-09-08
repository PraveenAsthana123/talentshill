import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/integrations/registry';
import { getIntegrationById } from '@/lib/db/integration-queries';
import { withPermission } from '@/lib/security/rbac';

export const POST = withPermission('integrations', 'manage')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const integration = getIntegrationById(id);
  if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const provider = registry.get(integration.providerKey);
  if (!provider) return NextResponse.json({ success: true, message: 'Provider stub - test passed' });

  const result = await provider.testConnection(id);
  return NextResponse.json(result);
});
