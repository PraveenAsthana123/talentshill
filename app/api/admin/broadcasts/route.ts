import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllBroadcasts, createBroadcast } from '@/lib/db/broadcast-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

const CreateBroadcastSchema = z.object({
  name: z.string().min(1).max(200),
  subject: z.string().min(1).max(500),
  htmlContent: z.string().min(1),
  profileId: z.string().optional(),
  audienceType: z.string().optional(),
  audienceId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  throttlePerMinute: z.number().min(1).max(1000).optional(),
});

export const GET = withPermission('broadcasts', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const broadcasts = getAllBroadcasts();
    return NextResponse.json({ broadcasts });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch broadcasts' }, { status: 500 });
  }
});

export const POST = withPermission('broadcasts', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const parsed = CreateBroadcastSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }
    const userId = await getSessionUserIdAsync(request);
    const id = createBroadcast({
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
      createdBy: userId ?? undefined,
    });
    logOperationRun({ moduleKey: 'broadcasts', operationName: 'manual_create_broadcast', executionMode: 'manual', status: 'completed', inputPayload: { name: body.name, audienceType: body.audienceType }, outputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
  }
});
