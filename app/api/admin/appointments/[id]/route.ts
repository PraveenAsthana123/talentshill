import { NextRequest, NextResponse } from 'next/server';
import { getAppointmentById, updateAppointmentStatus, deleteAppointment } from '@/lib/appointments-db';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// SECURITY FIX (2026-09-09): see app/api/admin/appointments/route.ts --
// this detail/status/delete endpoint previously lived at the
// unauthenticated /api/appointments/[id], allowing anyone to read a
// single appointment's full PII, change its status, or delete it with
// zero auth. Moved here under RBAC; nothing public ever called this
// route (verified via repo grep).
export const GET = withPermission('appointments', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const appointment = getAppointmentById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ appointment });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
});

export const PATCH = withPermission('appointments', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = updateAppointmentStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'appointments', operationName: 'update_status', executionMode: 'manual', status: 'completed',
      inputPayload: { id, status }, outputPayload: { id, status }, triggeredBy: userId,
    });

    return NextResponse.json({ appointment: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
});

export const DELETE = withPermission('appointments', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const deleted = deleteAppointment(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'appointments', operationName: 'delete_appointment', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
});
