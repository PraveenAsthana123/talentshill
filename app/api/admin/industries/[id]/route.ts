import { NextRequest, NextResponse } from 'next/server';
import { getIndustryById, updateIndustry, deleteIndustry } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const industry = getIndustryById(id);
    if (!industry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ industry });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch industry' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const industry = updateIndustry(id, body);
    if (!industry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'industry', entityId: id, action: 'update', userId: session?.userId });
    }

    return NextResponse.json({ industry });
  } catch {
    return NextResponse.json({ error: 'Failed to update industry' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteIndustry(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'industry', entityId: id, action: 'delete', userId: session?.userId });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete industry' }, { status: 500 });
  }
}
