import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';
import { randomUUID } from 'crypto';

export const GET = withPermission('occasions', 'read')(async () => {
  const templates = db.select().from(schema.occasionTemplates).orderBy(desc(schema.occasionTemplates.createdAt)).all();
  return NextResponse.json({ templates });
});

export const POST = withPermission('occasions', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    occasionType?: 'birthday' | 'anniversary' | 'festival';
    festivalCode?: string | null;
    channel?: 'email' | 'sms' | 'whatsapp';
    name?: string;
    subject?: string | null;
    body?: string;
  } | null;

  if (!body?.occasionType || !['birthday', 'anniversary', 'festival'].includes(body.occasionType)) {
    return NextResponse.json({ error: "occasionType must be 'birthday', 'anniversary', or 'festival'" }, { status: 400 });
  }
  if (body.occasionType === 'festival' && !body.festivalCode) {
    return NextResponse.json({ error: 'festivalCode is required when occasionType is festival' }, { status: 400 });
  }
  if (!body.channel || !['email', 'sms', 'whatsapp'].includes(body.channel)) {
    return NextResponse.json({ error: "channel must be 'email', 'sms', or 'whatsapp'" }, { status: 400 });
  }
  if (!body.name?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: 'name and body are required' }, { status: 400 });
  }

  const userId = await getSessionUserIdAsync(request);
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.occasionTemplates).values({
    id, occasionType: body.occasionType, festivalCode: body.festivalCode ?? null, channel: body.channel,
    name: body.name.trim(), subject: body.subject ?? null, body: body.body,
    isActive: true, createdBy: userId ?? undefined, createdAt: now, updatedAt: now,
  }).run();

  logOperationRun({ moduleKey: 'occasions', operationName: 'manual_create_template', executionMode: 'manual', status: 'completed', inputPayload: { occasionType: body.occasionType, channel: body.channel }, outputPayload: { id }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
