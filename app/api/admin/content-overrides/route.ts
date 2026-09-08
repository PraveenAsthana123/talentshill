import { NextRequest, NextResponse } from 'next/server';
import { getAllOverrides, upsertOverride, deleteOverride, toggleOverride } from '@/lib/db/content-override-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET() {
  try {
    const overrides = getAllOverrides();
    return NextResponse.json({ overrides });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const id = upsertOverride({
      pageSlug: body.pageSlug,
      section: body.section,
      key: body.key,
      value: body.value,
      updatedBy: userId ?? undefined,
    });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: 'Failed to upsert override' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    deleteOverride(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, isActive } = await request.json();
    toggleOverride(id, isActive);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to toggle override' }, { status: 500 });
  }
}
