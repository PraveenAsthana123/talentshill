import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionById, updateSubmissionStatus } from '@/lib/db/contact-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const submission = getSubmissionById(id);
    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ submission });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['new', 'contacted', 'qualified', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const token = request.cookies.get('admin_session')?.value;
    let userId: string | undefined;
    if (token) {
      const session = await verifyToken(token);
      userId = session?.userId;
    }

    const updated = updateSubmissionStatus(id, status, userId);
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    logAudit({
      entityType: 'contact',
      entityId: id,
      action: 'update',
      userId,
      metadata: { status },
    });

    return NextResponse.json({ submission: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
