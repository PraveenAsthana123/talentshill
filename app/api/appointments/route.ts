import { NextRequest, NextResponse } from 'next/server';
import { createAppointment } from '@/lib/appointments-db';
import { calculateLeadScore, getLeadTier } from '@/lib/booking-utils';

// SECURITY FIX (2026-09-09): GET (list all appointments incl. full
// customer PII) was removed from this public route -- it is unauthenticated
// by design (used by the public booking form to submit a new booking) and
// previously also served as the admin list source with zero auth. The
// authenticated list now lives at /api/admin/appointments (RBAC-gated).
// POST stays here and stays public: this is the real booking-submission
// endpoint, verified via repo grep as the only public caller.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, service, dateTime, contact, requirements } = body;

    if (!id || !service || !dateTime || !contact || !requirements) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leadScore = calculateLeadScore(service, contact, requirements);
    const leadTier = getLeadTier(leadScore);

    const appointment = createAppointment({
      id,
      service,
      dateTime,
      contact,
      requirements,
      status: 'pending',
      leadScore,
      leadTier,
    });

    return NextResponse.json({ appointment, leadScore, leadTier }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
