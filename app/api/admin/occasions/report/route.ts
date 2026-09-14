import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('occasions', 'read')(async () => {
  const messages = db.select().from(schema.occasionMessages).orderBy(desc(schema.occasionMessages.triggeredAt)).limit(200).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalMessages: messages.length,
    messages: messages.map((m) => ({
      contactId: m.contactId, occasionType: m.occasionType, festivalCode: m.festivalCode,
      channel: m.channel, status: m.status, triggeredAt: m.triggeredAt.toISOString(),
    })),
  });
});
