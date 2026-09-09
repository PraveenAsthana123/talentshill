import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/appointments-db';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('appointments', 'read')(async () => {
  const all = getAppointments().sort((a, b) => (b.followUpUrgency || 0) - (a.followUpUrgency || 0));
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAppointments: all.length,
    appointments: all.map((a) => ({
      name: a.contact.name, email: a.contact.email, company: a.contact.company,
      service: a.service.service, status: a.status, leadTier: a.leadTier,
      followUpUrgency: a.followUpUrgency ?? null,
    })),
  });
});
