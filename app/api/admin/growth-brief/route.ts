import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { generateGrowthBrief } from '@/lib/presales/growth-brief';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';

export const GET = withPermission('presales_brief', 'read')(async (_request: NextRequest, _context: unknown) => {
  const briefs = db.select().from(schema.growthBrief).orderBy(desc(schema.growthBrief.generatedAt)).all();
  return NextResponse.json({ briefs });
});

// Composes real KPI Engine + Opportunity Engine + Evidence Ledger data --
// run those recomputes first for fresh underlying numbers.
export const POST = withPermission('presales_brief', 'manage')(async (_request: NextRequest, _context: unknown) => {
  const result = generateGrowthBrief();
  return NextResponse.json(result, { status: 201 });
});
