import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllProfiles, createProfile } from '@/lib/db/email-profile-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

const CreateEmailProfileSchema = z.object({
  name: z.string().min(1).max(200),
  fromName: z.string().min(1).max(200),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional(),
  signature: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const GET = withPermission('email_profiles', 'read')(async (
  _request: NextRequest,
  _context: unknown
) => {
  try {
    const profiles = getAllProfiles();
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
});

export const POST = withPermission('email_profiles', 'create')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    const body = await request.json();
    const parsed = CreateEmailProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, fromName, fromEmail, replyTo, signature, isDefault } = parsed.data;

    const id = createProfile({ name, fromName, fromEmail, replyTo, signature, isDefault });
    const userId = await getSessionUserIdAsync(request);
    logOperationRun({ moduleKey: 'email_profiles', operationName: 'manual_create_profile', executionMode: 'manual', status: 'completed', inputPayload: { name, fromEmail }, outputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
});
