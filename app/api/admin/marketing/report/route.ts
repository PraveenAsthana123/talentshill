import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('workflows', 'read')(async () => {
  const all = db.select().from(schema.marketingWorkflows).orderBy(desc(schema.marketingWorkflows.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalWorkflows: all.length,
    workflows: all.map((w) => ({
      name: w.name, status: w.status, currentStep: w.currentStep, readinessScore: w.readinessScore ?? null,
    })),
  });
});
