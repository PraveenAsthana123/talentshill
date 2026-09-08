import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates, createTemplate } from '@/lib/db/template-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET() {
  try {
    const templates = getAllTemplates();
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
