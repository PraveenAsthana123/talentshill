import { NextRequest, NextResponse } from 'next/server';
import { getAllWebhooks, createWebhook } from '@/lib/db/webhook-queries';

export async function GET() {
  const webhooks = getAllWebhooks();
  return NextResponse.json(webhooks.map(w => ({
    ...w,
    events: w.events ? JSON.parse(w.events) : [],
  })));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const id = createWebhook({
    name: body.name,
    url: body.url,
    secret: body.secret,
    events: body.events,
    accountId: body.accountId,
  });
  return NextResponse.json({ id }, { status: 201 });
}
