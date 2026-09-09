import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('survey', 'read')(async () => {
  const responses = db.select().from(schema.surveyResponses).orderBy(desc(schema.surveyResponses.outreachPriority)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalResponses: responses.length,
    responses: responses.map((r) => ({
      contactName: r.contactName, email: r.email, company: r.company,
      maturityLevel: r.maturityLevel, totalScore: r.totalScore, outreachPriority: r.outreachPriority ?? null,
    })),
  });
});
