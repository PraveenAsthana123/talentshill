import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContactEngagementAgent } from '@/lib/agents/contact-engagement-agent';

export const POST = withPermission('contacts', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { contactId?: string } | null;
  if (!body?.contactId) return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runContactEngagementAgent({ contactId: body.contactId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.contactId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
