import { NextRequest, NextResponse } from 'next/server';
import { registry } from '@/lib/integrations/registry';
import { getIntegrationById, getAccountsByIntegration } from '@/lib/db/integration-queries';
import { addLog } from '@/lib/db/integration-log-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const POST = withPermission('integrations', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const integration = getIntegrationById(id);
  if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const userId = await getSessionUserIdAsync(request);
  // addLog() (lib/db/integration-log-queries.ts) existed with zero real
  // callers anywhere -- the integration_logs table, and its dedicated
  // /logs endpoint, had never been written to. A "Test Connection"
  // click is the real verification event this table exists to record,
  // logged against every account configured under this provider.
  const accounts = getAccountsByIntegration(id);
  const startedAt = Date.now();

  const provider = registry.get(integration.providerKey);
  if (!provider) {
    for (const account of accounts) addLog({ accountId: account.id, action: 'test_connection', status: 'success', response: { stub: true }, durationMs: Date.now() - startedAt });
    logOperationRun({ moduleKey: 'integrations', operationName: 'manual_test_connection', executionMode: 'manual', status: 'completed', inputPayload: { integrationId: id }, outputPayload: { stub: true }, triggeredBy: userId });
    return NextResponse.json({ success: true, message: 'Provider stub - test passed' });
  }

  const result = await provider.testConnection(id);
  for (const account of accounts) addLog({ accountId: account.id, action: 'test_connection', status: result.success ? 'success' : 'error', response: result, durationMs: Date.now() - startedAt });
  logOperationRun({ moduleKey: 'integrations', operationName: 'manual_test_connection', executionMode: 'manual', status: result.success ? 'completed' : 'failed', inputPayload: { integrationId: id }, outputPayload: result, triggeredBy: userId });
  return NextResponse.json(result);
});
