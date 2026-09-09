import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('analysis', 'read')(async () => {
  const all = db.select().from(schema.analysisAssessments).orderBy(desc(schema.analysisAssessments.healthScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAssessments: all.length,
    assessments: all.map((a) => ({
      projectName: a.projectName, status: a.status, completedItems: a.completedItems, totalItems: a.totalItems,
      overallScore: a.overallScore ?? null, healthScore: a.healthScore ?? null, updatedAt: a.updatedAt,
    })),
  });
});
