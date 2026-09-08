import { NextResponse } from 'next/server';
import { getAllTags } from '@/lib/db/blog-queries';

export async function GET() {
  try {
    const tags = getAllTags();
    return NextResponse.json({ tags });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
