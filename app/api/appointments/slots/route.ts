import { NextRequest, NextResponse } from 'next/server';
import { getBookedSlots } from '@/lib/appointments-db';
import { getTimeSlots } from '@/lib/booking-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
    }

    const allSlots = getTimeSlots();
    const booked = getBookedSlots(date);
    const available = allSlots.filter((s) => !booked.includes(s));

    return NextResponse.json({ date, available, booked });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}
