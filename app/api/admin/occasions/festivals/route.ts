import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { asc } from 'drizzle-orm';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';
import { randomUUID } from 'crypto';

export const GET = withPermission('occasions', 'read')(async () => {
  const festivals = db.select().from(schema.festivalCalendar).orderBy(asc(schema.festivalCalendar.occasionDate)).all();
  return NextResponse.json({ festivals });
});

export const POST = withPermission('occasions', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    code?: string; name?: string; occasionDate?: string; country?: string | null;
  } | null;

  if (!body?.code?.trim() || !body.name?.trim() || !body.occasionDate) {
    return NextResponse.json({ error: 'code, name, and occasionDate are required' }, { status: 400 });
  }
  const parsedDate = new Date(body.occasionDate);
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'occasionDate must be a valid date' }, { status: 400 });
  }

  const userId = await getSessionUserIdAsync(request);
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.festivalCalendar).values({
    id, code: body.code.trim(), name: body.name.trim(), occasionDate: parsedDate,
    country: body.country ?? null, isActive: true, createdBy: userId ?? undefined, createdAt: now, updatedAt: now,
  }).run();

  logOperationRun({ moduleKey: 'occasions', operationName: 'manual_create_festival', executionMode: 'manual', status: 'completed', inputPayload: { code: body.code, country: body.country ?? null }, outputPayload: { id }, triggeredBy: userId });
  return NextResponse.json({ id }, { status: 201 });
});
