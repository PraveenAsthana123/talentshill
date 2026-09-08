import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/db/blog-queries';

export async function GET() {
  try {
    const categories = getAllCategories();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const category = createCategory(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
