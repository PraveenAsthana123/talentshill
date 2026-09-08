import { NextRequest, NextResponse } from 'next/server';
import { getAllWebhooks, createWebhook } from '@/lib/db/webhook-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('webhooks', 'read')(async (_request: NextRequest, _context: unknown) => {
  const webhooks = getAllWebhooks();
  return NextResponse.json(webhooks.map(w => ({
    ...w,
    events: w.events ? JSON.parse(w.events) : [],
  })));
});

export const POST = withPermission('webhooks', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json();
  const id = createWebhook({
    name: body.name,
    url: body.url,
    secret: body.secret,
    events: body.events,
    accountId: body.accountId,
  });
  return NextResponse.json({ id }, { status: 201 });
});
