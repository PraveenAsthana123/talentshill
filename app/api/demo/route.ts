import { NextRequest, NextResponse } from 'next/server';
import { createAppointment } from '@/lib/appointments-db';
import { calculateLeadScore, getLeadTier } from '@/lib/booking-utils';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const id = generateId();

    const service = { category: data.platform || 'genai', service: 'Demo Request' };
    const dateTime = {
      date: data.preferredDate || '',
      time: data.preferredTime || '10:00',
      timezone: data.timezone || 'America/New_York',
      duration: '60',
    };
    const contact = {
      name: data.name || '',
      email: data.email || '',
      phone: '',
      company: data.company || '',
      jobTitle: '',
      companySize: 'mid',
    };
    const requirements = {
      useCase: data.useCase || '',
      budget: 'not-sure',
      timeline: 'exploring',
      goals: [],
      challenges: data.notes || '',
    };

    const leadScore = calculateLeadScore(service, contact, requirements);
    const leadTier = getLeadTier(leadScore);

    createAppointment({ id, service, dateTime, contact, requirements, status: 'pending', leadScore, leadTier });

    return NextResponse.json({ success: true, message: 'Demo request submitted', appointmentId: id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
