import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getMaintenanceStatus, setMaintenanceMode } from '@/lib/ops/maintenance';

export async function GET() {
  try {
    const status = getMaintenanceStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch maintenance status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    setMaintenanceMode(body.enabled, body.message, body.scheduledEnd);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update maintenance mode' }, { status: 500 });
  }
}
