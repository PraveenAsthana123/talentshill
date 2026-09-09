import { NextResponse } from 'next/server';
import { getAppointments } from '@/lib/appointments-db';
import { withPermission } from '@/lib/security/rbac';

// SECURITY FIX (2026-09-09): see app/api/admin/appointments/route.ts --
// this CSV export (full customer PII incl. email/phone/budget) previously
// lived at the unauthenticated /api/appointments/export.
export const GET = withPermission('appointments', 'read')(async () => {
  try {
    const appointments = getAppointments();

    const headers = ['ID', 'Date', 'Time', 'Duration', 'Name', 'Email', 'Company', 'Job Title', 'Company Size', 'Service Category', 'Service', 'Budget', 'Timeline', 'Use Case', 'Status', 'Lead Score', 'Lead Tier', 'Created'];

    const rows = appointments.map((a) => [
      a.id,
      a.dateTime.date,
      a.dateTime.time,
      a.dateTime.duration + ' min',
      a.contact.name,
      a.contact.email,
      a.contact.company,
      a.contact.jobTitle,
      a.contact.companySize,
      a.service.category,
      a.service.service,
      a.requirements.budget,
      a.requirements.timeline,
      `"${a.requirements.useCase.replace(/"/g, '""')}"`,
      a.status,
      a.leadScore.toString(),
      a.leadTier,
      a.createdAt,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="appointments-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
});
