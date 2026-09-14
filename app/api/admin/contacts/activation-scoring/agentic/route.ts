import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContactRetentionAgent } from '@/lib/agents/contact-retention-agent';

export const POST = withPermission('contacts', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runContactRetentionAgent({ triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
