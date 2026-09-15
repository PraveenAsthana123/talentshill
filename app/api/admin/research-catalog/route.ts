import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { db, schema } from '@/lib/db/index';
import { asc } from 'drizzle-orm';

export const GET = withPermission('research_catalog', 'read')(async (_request: NextRequest, _context: unknown) => {
  const rows = db.select().from(schema.researchMethodologyCatalog).orderBy(asc(schema.researchMethodologyCatalog.num)).all();
  return NextResponse.json({ total: rows.length, notStartedCount: rows.filter((r) => r.status === 'not_started').length, methodologies: rows });
});
