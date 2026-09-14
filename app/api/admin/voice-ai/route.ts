import { NextRequest, NextResponse } from 'next/server';
import { getAllVoiceAssets, createVoiceAsset } from '@/lib/db/voice-asset-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('voice_ai', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllVoiceAssets({ type, status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch voice assets' }, { status: 500 });
  }
});

export const POST = withPermission('voice_ai', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title, type } = body;
    if (!title || !type) return NextResponse.json({ error: 'title and type are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createVoiceAsset({ title, type, content: body.content, filePath: body.filePath, durationSeconds: body.durationSeconds, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'voice_ai', operationName: 'manual_create_asset', executionMode: 'manual', status: 'completed', inputPayload: { id, title, type }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create voice asset' }, { status: 500 });
  }
});
