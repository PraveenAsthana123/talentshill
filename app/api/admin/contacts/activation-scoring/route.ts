import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContactActivationPipeline } from '@/lib/pipelines/contact-activation-pipeline';

export const POST = withPermission('contacts', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runContactActivationPipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
