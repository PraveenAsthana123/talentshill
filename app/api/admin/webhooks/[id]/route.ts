import { NextRequest, NextResponse } from 'next/server';
import { getWebhookById, updateWebhook, deleteWebhook } from '@/lib/db/webhook-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const webhook = getWebhookById(id);
  if (!webhook) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...webhook, events: webhook.events ? JSON.parse(webhook.events) : [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  updateWebhook(id, body);
  const updated = getWebhookById(id);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteWebhook(id);
  return NextResponse.json({ success: true });
}
