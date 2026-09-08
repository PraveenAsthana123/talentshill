import { NextResponse } from 'next/server';
import { bustCache } from '@/lib/feature-flags/cache';

export async function POST() {
  try {
    bustCache();
    return NextResponse.json({ success: true, message: 'Cache busted' });
  } catch {
    return NextResponse.json({ error: 'Failed to bust cache' }, { status: 500 });
  }
}
