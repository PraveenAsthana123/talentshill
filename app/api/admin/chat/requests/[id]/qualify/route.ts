import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runChatSalesQualificationPipeline } from '@/lib/pipelines/chat-sales-qualification-pipeline';

export const POST = withPermission('chat', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  const result = await runChatSalesQualificationPipeline({ requestId: id, triggeredBy: userId });
  return NextResponse.json(result, { status: result.requestId ? 200 : 404 });
});
