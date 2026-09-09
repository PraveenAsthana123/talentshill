import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runEmailProfileReadinessAgent } from '@/lib/agents/email-profile-readiness-agent';

export const POST = withPermission('email_profiles', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { profileId?: string } | null;
  if (!body?.profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runEmailProfileReadinessAgent({ profileId: body.profileId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.profileId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
