import { NextRequest, NextResponse } from 'next/server';
import { getImportJob } from '@/lib/db/import-job-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('contacts', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const job = getImportJob(id);
    if (!job) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...job,
      columnMapping: job.columnMapping ? JSON.parse(job.columnMapping) : null,
      errors: job.errors ? JSON.parse(job.errors) : [],
    });
  } catch {
    return NextResponse.json({ error: 'Failed to get import job' }, { status: 500 });
  }
});
