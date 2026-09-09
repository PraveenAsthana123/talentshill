import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, updateProfile, deleteProfile, setProfileSmtp, getSmtpForProfile } from '@/lib/db/email-profile-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('email_profiles', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const profile = getProfileById(id);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    const smtp = getSmtpForProfile(id);
    return NextResponse.json({ profile, smtp: smtp || null });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
});

export const PATCH = withPermission('email_profiles', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();

    const userId = await getSessionUserIdAsync(request);

    if (body.smtpConfigId) {
      setProfileSmtp(id, body.smtpConfigId);
      logOperationRun({ moduleKey: 'email_profiles', operationName: 'manual_assign_smtp', executionMode: 'manual', status: 'completed', inputPayload: { id, smtpConfigId: body.smtpConfigId }, triggeredBy: userId });
    }

    const { name, fromName, fromEmail, replyTo, signature, isDefault, isActive } = body;
    updateProfile(id, { name, fromName, fromEmail, replyTo, signature, isDefault, isActive });
    logOperationRun({ moduleKey: 'email_profiles', operationName: 'manual_update_profile', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
});

export const DELETE = withPermission('email_profiles', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    deleteProfile(id);
    logOperationRun({ moduleKey: 'email_profiles', operationName: 'manual_delete_profile', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
});
