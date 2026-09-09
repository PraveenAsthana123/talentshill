import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runComposeReadinessAgent } from '@/lib/agents/compose-readiness-agent';

export const POST = withPermission('email_compose', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { to?: string; subject?: string; html?: string; profileId?: string } | null;
  if (!body?.to || !body?.subject || !body?.html) return NextResponse.json({ error: 'to, subject, and html are required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runComposeReadinessAgent({ to: body.to, subject: body.subject, html: body.html, profileId: body.profileId, triggeredBy: userId });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
