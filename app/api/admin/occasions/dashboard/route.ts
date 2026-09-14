import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('occasions', 'read')(async () => {
  const messages = db.select().from(schema.occasionMessages).all();
  const templates = db.select().from(schema.occasionTemplates).all();
  const festivals = db.select().from(schema.festivalCalendar).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'occasions')).all();
  const contactsWithDob = db.select().from(schema.contacts).all().filter((c) => c.dateOfBirth !== null).length;
  const contactsWithAnniversary = db.select().from(schema.contacts).all().filter((c) => c.customerAnniversaryDate !== null).length;

  return NextResponse.json({
    kpis: {
      totalMessages: messages.length,
      logged: messages.filter((m) => m.status === 'logged').length,
      failed: messages.filter((m) => m.status === 'failed').length,
      totalTemplates: templates.length,
      activeTemplates: templates.filter((t) => t.isActive).length,
      totalFestivals: festivals.length,
      activeFestivals: festivals.filter((f) => f.isActive).length,
      contactsWithDob,
      contactsWithAnniversary,
      totalRuns: runs.length,
    },
    byOccasionType: messages.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.occasionType]: (acc[m.occasionType] ?? 0) + 1 }), {}),
    byChannel: messages.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.channel]: (acc[m.channel] ?? 0) + 1 }), {}),
  });
});
