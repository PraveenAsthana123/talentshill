import { NextRequest, NextResponse } from 'next/server';
import { getActiveBanners } from '@/lib/db/banner-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || undefined;
    const activeBanners = getActiveBanners(placement);
    return NextResponse.json({ banners: activeBanners });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
