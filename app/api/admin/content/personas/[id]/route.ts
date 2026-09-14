import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { deletePersona } from '@/lib/db/content-persona-queries';

export const DELETE = withPermission('content', 'delete')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  deletePersona(id);
  return NextResponse.json({ success: true });
});
