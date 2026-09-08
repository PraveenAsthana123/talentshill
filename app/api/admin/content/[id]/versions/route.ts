import { NextRequest, NextResponse } from 'next/server';
import { getVersions, createVersion, getVersionById } from '@/lib/db/content-version-queries';
import { getContentById, updateContent } from '@/lib/db/marketing-content-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const versions = getVersions(id);
    return NextResponse.json({ versions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);

    if (body.action === 'rollback' && body.versionId) {
      const version = getVersionById(body.versionId);
      if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      updateContent(id, { title: version.title, body: version.body });
      return NextResponse.json({ success: true });
    }

    const content = getContentById(id);
    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    const result = createVersion(id, content.title, content.body, userId ?? undefined, body.changeNote);
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to manage versions' }, { status: 500 });
  }
}
