import { NextRequest, NextResponse } from 'next/server';
import { getIntegrationById, getAccountsByIntegration, createAccount, deleteAccount } from '@/lib/db/integration-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('integrations', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const integration = getIntegrationById(id);
  if (!integration) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const accounts = getAccountsByIntegration(id);
  return NextResponse.json({ ...integration, accounts });
});

export const POST = withPermission('integrations', 'create')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json();
  const accountId = createAccount({
    integrationId: id,
    name: body.name || 'Default',
    credentials: body.credentials,
    settings: body.settings,
  });
  return NextResponse.json({ id: accountId }, { status: 201 });
});

export const DELETE = withPermission('integrations', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const accountId = request.nextUrl.searchParams.get('accountId');
  if (accountId) deleteAccount(accountId);
  return NextResponse.json({ success: true });
});
