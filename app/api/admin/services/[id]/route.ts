import { NextRequest, NextResponse } from 'next/server';
import { getServiceById, updateService, deleteService } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = getServiceById(id);
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const service = updateService(id, body);
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'service', entityId: id, action: 'update', userId: session?.userId });
    }

    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteService(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'service', entityId: id, action: 'delete', userId: session?.userId });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
