import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, createAppointment, getStats } from '@/lib/appointments-db';
import { calculateLeadScore, getLeadTier } from '@/lib/booking-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    if (includeStats) {
      const stats = getStats();
      return NextResponse.json({ stats });
    }

    const appointments = getAppointments({
      status: searchParams.get('status') || undefined,
      date: searchParams.get('date') || undefined,
      search: searchParams.get('search') || undefined,
    });

    return NextResponse.json({ appointments, total: appointments.length });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

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
