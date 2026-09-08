import { NextRequest, NextResponse } from 'next/server';
import { getAllBanners, createBanner } from '@/lib/db/banner-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET() {
  try {
    const bannersList = getAllBanners();
    return NextResponse.json({ banners: bannersList });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, placement, severity, ctaText, ctaUrl, mediaId, startDate, endDate, priority } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const id = createBanner({
      title,
      content,
      placement,
      severity,
      ctaText,
      ctaUrl,
      mediaId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      priority,
      createdBy: userId ?? undefined,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
