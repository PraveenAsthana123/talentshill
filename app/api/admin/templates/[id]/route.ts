import { NextRequest, NextResponse } from 'next/server';
import {
  getTemplateById, updateTemplate, deleteTemplate,
  getTemplateVersions, createTemplateVersion, renderTemplate,
} from '@/lib/db/template-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = getTemplateById(id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const versions = getTemplateVersions(id);
    return NextResponse.json({ template, versions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'create-version') {
      const userId = await getSessionUserIdAsync(request);
      const versionId = createTemplateVersion(id, {
        subject: body.subject,
        htmlContent: body.htmlContent,
        textContent: body.textContent,
        changedBy: userId ?? undefined,
      });
      return NextResponse.json({ versionId });
    }

    if (body.action === 'preview') {
      const template = getTemplateById(id);
      if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const html = renderTemplate(template.htmlContent, body.variables || {});
      return NextResponse.json({ html });
    }

    updateTemplate(id, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTemplate(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
