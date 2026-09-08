import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, createProfile } from '@/lib/db/email-profile-queries';
import { withPermission } from '@/lib/security/rbac';

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
    const { name, fromName, fromEmail, replyTo, signature, isDefault } = body;

    if (!name || !fromName || !fromEmail) {
      return NextResponse.json({ error: 'Name, fromName, and fromEmail are required' }, { status: 400 });
    }

    const id = createProfile({ name, fromName, fromEmail, replyTo, signature, isDefault });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
});
