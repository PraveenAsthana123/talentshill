import { NextRequest, NextResponse } from 'next/server';
import { getDocumentById } from '@/lib/db/rag-document-queries';
import { getChunksByDocument, getChunkCount } from '@/lib/db/rag-chunk-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const document = getDocumentById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { searchParams } = request.nextUrl;
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const chunks = getChunksByDocument(id, offset, limit);
    const total = getChunkCount(id);

    // Return chunks with a content preview (first 200 chars)
    const items = chunks.map((chunk) => ({
      id: chunk.id,
      chunkIndex: chunk.chunkIndex,
      contentPreview: chunk.content.length > 200
        ? chunk.content.slice(0, 200) + '...'
        : chunk.content,
      content: chunk.content,
      tokenCount: chunk.tokenCount,
      metadata: chunk.metadata,
      createdAt: chunk.createdAt,
    }));

    return NextResponse.json({ items, total, offset, limit, documentId: id });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch chunks' }, { status: 500 });
  }
}
