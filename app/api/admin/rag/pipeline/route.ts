import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRagDocumentReadinessPipeline } from '@/lib/pipelines/rag-document-readiness-pipeline';

export const POST = withPermission('rag', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { documentId?: string } | null;
  if (!body?.documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runRagDocumentReadinessPipeline({ documentId: body.documentId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.documentId ? 200 : 404 });
});
