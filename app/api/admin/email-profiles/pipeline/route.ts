import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runEmailProfileReadinessPipeline } from '@/lib/pipelines/email-profile-readiness-pipeline';

export const POST = withPermission('email_profiles', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { profileId?: string } | null;
  if (!body?.profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runEmailProfileReadinessPipeline({ profileId: body.profileId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.profileId ? 200 : 404 });
});
