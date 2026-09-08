import { NextRequest, NextResponse } from 'next/server';
import { getWebhookById, updateWebhook, deleteWebhook } from '@/lib/db/webhook-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('webhooks', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const webhook = getWebhookById(id);
  if (!webhook) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...webhook, events: webhook.events ? JSON.parse(webhook.events) : [] });
});

export const PATCH = withPermission('webhooks', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const body = await request.json();
  updateWebhook(id, body);
  const updated = getWebhookById(id);
  return NextResponse.json(updated);
});

export const DELETE = withPermission('webhooks', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  deleteWebhook(id);
  return NextResponse.json({ success: true });
});
