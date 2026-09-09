import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, createDocument } from '@/lib/db/rag-document-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('rag', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') || undefined;
    const sourceType = searchParams.get('sourceType') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const result = getAllDocuments({ status, sourceType, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
});

export const POST = withPermission('rag', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const userId = await getSessionUserIdAsync(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, sourceType, sourceUrl, filePath, mimeType, size, metadata } = body;

    if (!name || !sourceType) {
      return NextResponse.json(
        { error: 'name and sourceType are required' },
        { status: 400 }
      );
    }

    const validSourceTypes = ['upload', 'url', 'sitepage', 'text', 'api'];
    if (!validSourceTypes.includes(sourceType)) {
      return NextResponse.json(
        { error: `sourceType must be one of: ${validSourceTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const id = createDocument({
      name,
      sourceType,
      sourceUrl,
      filePath,
      mimeType,
      size,
      metadata,
      createdBy: userId,
    });

    logOperationRun({ moduleKey: 'rag', operationName: 'manual_create_document', executionMode: 'manual', status: 'completed', inputPayload: { id, name, sourceType }, triggeredBy: userId });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
});
