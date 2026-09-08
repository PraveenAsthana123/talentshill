import { NextRequest, NextResponse } from 'next/server';
import { getShareLinkByShortCode, incrementClickCount } from '@/lib/db/share-link-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const link = getShareLinkByShortCode(code);
    if (!link || !link.isActive) {
      return NextResponse.json({ error: 'Link not found or expired' }, { status: 404 });
    }
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Link has expired' }, { status: 410 });
    }

    incrementClickCount(link.id);

    const url = new URL(link.originalUrl);
    if (link.utmSource) url.searchParams.set('utm_source', link.utmSource);
    if (link.utmMedium) url.searchParams.set('utm_medium', link.utmMedium);
    if (link.utmCampaign) url.searchParams.set('utm_campaign', link.utmCampaign);
    if (link.utmTerm) url.searchParams.set('utm_term', link.utmTerm);
    if (link.utmContent) url.searchParams.set('utm_content', link.utmContent);

    return NextResponse.redirect(url.toString(), 302);
  } catch {
    return NextResponse.json({ error: 'Failed to resolve link' }, { status: 500 });
  }
}
