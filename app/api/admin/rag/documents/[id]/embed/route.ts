import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/db/rag-document-queries';
import { createJob } from '@/lib/db/job-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// Real gap fixed: the rag_embed job type was registered and fully
// implemented (lib/jobs/handlers/rag-pipeline.ts), but nothing in the
// app ever created one -- a document could reach 'chunked' status with
// no way to progress to 'embedded' via the UI or API. This route
// mirrors the existing ingest route's pattern.
export const POST = withPermission('rag', 'manage')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const document = getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (document.status !== 'chunked') {
      return NextResponse.json(
        { error: `Document has status '${document.status}'. Only a 'chunked' document can be embedded.` },
        { status: 409 }
      );
    }

    const jobId = createJob({
      type: 'rag_embed',
      payload: { documentId: id },
      priority: 1,
      maxRetries: 3,
      createdBy: userId,
    });

    logOperationRun({ moduleKey: 'rag', operationName: 'manual_trigger_embed', executionMode: 'manual', status: 'completed', inputPayload: { documentId: id, jobId }, triggeredBy: userId });

    return NextResponse.json({ jobId, documentId: id }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Failed to trigger embedding' }, { status: 500 });
  }
});
