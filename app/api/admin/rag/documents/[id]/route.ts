import { NextRequest, NextResponse } from 'next/server';
import {
  getDocumentById,
  updateDocumentStatus,
  deleteDocument,
} from '@/lib/db/rag-document-queries';
import { getChunkCount, getChunksByDocument } from '@/lib/db/rag-chunk-queries';
import {
  getEmbeddingsByChunkIds,
  deleteEmbeddingsByDocument,
} from '@/lib/db/rag-embedding-queries';
import { deleteChunksByDocument } from '@/lib/db/rag-chunk-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const document = getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const chunkCount = getChunkCount(id);

    // Get embedding count by fetching chunks and checking their embeddings
    let embeddingCount = 0;
    if (chunkCount > 0) {
      const chunks = getChunksByDocument(id, 0, chunkCount);
      const chunkIds = chunks.map((c) => c.id);
      const embeddings = getEmbeddingsByChunkIds(chunkIds);
      embeddingCount = embeddings.length;
    }

    return NextResponse.json({ document, chunkCount, embeddingCount });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
});

export const PATCH = withPermission('rag', 'update')(async (
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

    const body = await request.json();
    const { status, chunkCount } = body;

    if (status) {
      const validStatuses = ['pending', 'ingested', 'chunked', 'embedded', 'ready', 'failed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateDocumentStatus(id, status, chunkCount);
    }

    const updated = getDocumentById(id);
    return NextResponse.json({ document: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
});

export const DELETE = withPermission('rag', 'delete')(async (
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

    // Cascade delete: embeddings -> chunks -> document
    deleteEmbeddingsByDocument(id);
    deleteChunksByDocument(id);
    deleteDocument(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
});
