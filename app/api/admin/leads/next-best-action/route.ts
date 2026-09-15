import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

// Reuses the 'leads' RBAC resource -- this is the structured,
// stored-recommendation extension of the existing Lead Scoring module.
export const GET = withPermission('leads', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('submissionId');
  if (!submissionId) return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
  const rows = db.select().from(schema.leadNextBestAction).where(eq(schema.leadNextBestAction.submissionId, submissionId)).orderBy(desc(schema.leadNextBestAction.computedAt)).all();
  return NextResponse.json({ entries: rows });
});
