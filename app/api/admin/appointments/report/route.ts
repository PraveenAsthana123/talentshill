import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/appointments-db';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('appointments', 'read')(async () => {
  const all = getAppointments().sort((a, b) => (b.followUpUrgency || 0) - (a.followUpUrgency || 0));
  const webinars = db.select().from(schema.webinars).orderBy(desc(schema.webinars.scheduledAt)).all();
  const registrants = db.select().from(schema.webinarRegistrants).all();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAppointments: all.length,
    appointments: all.map((a) => ({
      name: a.contact.name, email: a.contact.email, company: a.contact.company,
      service: a.service.service, status: a.status, leadTier: a.leadTier,
      followUpUrgency: a.followUpUrgency ?? null,
    })),
    webinars: webinars.map((w) => {
      const forWebinar = registrants.filter((r) => r.webinarId === w.id);
      return {
        title: w.title, topic: w.topic, status: w.status, scheduledAt: w.scheduledAt.toISOString(),
        registrantCount: forWebinar.length,
        attendedCount: forWebinar.filter((r) => r.attended === true).length,
        qualifiedCount: forWebinar.filter((r) => r.qualificationTier === 'hot' || r.qualificationTier === 'warm').length,
      };
    }),
  });
});
