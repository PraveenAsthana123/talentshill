import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/db/rag-document-queries';
import { createJob } from '@/lib/db/job-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

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

    if (document.status === 'ingested' || document.status === 'chunked' || document.status === 'embedded') {
      return NextResponse.json(
        { error: `Document already has status '${document.status}'. Delete and re-create to re-ingest.` },
        { status: 409 }
      );
    }

    const jobId = createJob({
      type: 'rag_ingest',
      payload: { documentId: id },
      priority: 1,
      maxRetries: 3,
      createdBy: userId,
    });

    return NextResponse.json({ jobId, documentId: id }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Failed to trigger ingestion' }, { status: 500 });
  }
});
