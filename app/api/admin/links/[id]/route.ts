import { NextRequest, NextResponse } from 'next/server';
import { getShareLinkById, updateShareLink, deleteShareLink } from '@/lib/db/share-link-queries';
import { UpdateShareLinkSchema } from '@/lib/validation/content-schemas';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('links', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const link = getShareLinkById(id);
    if (!link) return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    return NextResponse.json({ link });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch share link' }, { status: 500 });
  }
});

export const PATCH = withPermission('links', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateShareLinkSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    updateShareLink(id, parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update share link' }, { status: 500 });
  }
});

export const DELETE = withPermission('links', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    deleteShareLink(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete share link' }, { status: 500 });
  }
});
