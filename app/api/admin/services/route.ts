import { NextRequest, NextResponse } from 'next/server';
import { getAllServices, createService } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET() {
  try {
    const services = getAllServices();
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }
    const service = createService(body);

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'service', entityId: service.id, action: 'create', userId: session?.userId, metadata: { name: body.name } });
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
