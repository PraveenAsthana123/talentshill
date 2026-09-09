import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationById, getAccountsByIntegration, createAccount, deleteAccount } from '@/lib/db/integration-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('integrations', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const integration = getIntegrationById(id);
  if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  // Never send raw credentials to the client -- see route.ts's list endpoint fix.
  const accounts = getAccountsByIntegration(id).map(({ credentials, ...a }) => ({ ...a, hasCredentials: !!credentials }));
  return NextResponse.json({ ...integration, accounts });
});

export const POST = withPermission('integrations', 'create')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json();
  const userId = await getSessionUserIdAsync(request);
  const accountId = createAccount({
    integrationId: id,
    name: body.name || 'Default',
    credentials: body.credentials,
    settings: body.settings,
    connectedBy: userId ?? undefined,
  });
  logOperationRun({ moduleKey: 'integrations', operationName: 'manual_create_account', executionMode: 'manual', status: 'completed', inputPayload: { integrationId: id, name: body.name }, outputPayload: { id: accountId }, triggeredBy: userId });
  return NextResponse.json({ id: accountId }, { status: 201 });
});

export const DELETE = withPermission('integrations', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const accountId = request.nextUrl.searchParams.get('accountId');
  const userId = await getSessionUserIdAsync(request);
  if (accountId) {
    deleteAccount(accountId);
    logOperationRun({ moduleKey: 'integrations', operationName: 'manual_delete_account', executionMode: 'manual', status: 'completed', inputPayload: { integrationId: id, accountId }, triggeredBy: userId });
  }
  return NextResponse.json({ success: true });
});
