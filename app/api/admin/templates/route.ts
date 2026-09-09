import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates, createTemplate } from '@/lib/db/template-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('templates', 'read')(async (
  _request: NextRequest,
  _context: unknown
) => {
  try {
    const templates = getAllTemplates();
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
});

export const POST = withPermission('templates', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { name, description, category, subject, htmlContent, textContent, variables } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Name, subject, and htmlContent are required' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const id = createTemplate({
      name, description, category, subject, htmlContent, textContent, variables,
      createdBy: userId ?? undefined,
    });

    logOperationRun({
      moduleKey: 'templates', operationName: 'create_template', executionMode: 'manual', status: 'completed',
      inputPayload: { name }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
});
