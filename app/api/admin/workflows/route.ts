import { NextRequest, NextResponse } from 'next/server';
import { getWorkflows, getWorkflowCount, createWorkflow } from '@/lib/db/marketing-workflow-queries';
import { CreateWorkflowSchema } from '@/lib/validation/content-schemas';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status') || undefined;
    const items = getWorkflows(offset, limit, { status });
    const total = getWorkflowCount({ status });
    return NextResponse.json({ items, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const parsed = CreateWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const userId = await getSessionUserIdAsync(request);
    const id = createWorkflow({ ...parsed.data, createdBy: userId ?? undefined });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}
