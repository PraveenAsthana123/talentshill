import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('leads', 'read')(async (_request: NextRequest, _context: unknown) => {
  const leads = db.select().from(schema.contactSubmissions).orderBy(desc(schema.contactSubmissions.leadScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalLeads: leads.length,
    topLeads: leads.slice(0, 20).map((l) => ({
      fullName: l.fullName, company: l.company, industry: l.industry,
      leadScore: l.leadScore, leadTier: l.leadTier, status: l.status,
    })),
  });
});
