import { NextRequest, NextResponse } from 'next/server';
import { getShareLinks, getShareLinkCount, createShareLink } from '@/lib/db/share-link-queries';
import { CreateShareLinkSchema } from '@/lib/validation/content-schemas';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const isActiveParam = url.searchParams.get('isActive');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;
    const items = getShareLinks(offset, limit, { isActive });
    const total = getShareLinkCount();
    return NextResponse.json({ items, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch share links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateShareLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const userId = await getSessionUserIdAsync(request);
    const result = createShareLink({
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      createdBy: userId ?? undefined,
    });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
  }
}
