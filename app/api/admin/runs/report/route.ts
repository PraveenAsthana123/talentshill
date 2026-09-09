import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('runs', 'read')(async () => {
  const all = db.select().from(schema.runs).orderBy(desc(schema.runs.healthScore)).limit(200).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalRuns: all.length,
    runs: all.map((r) => ({
      name: r.name, type: r.type, status: r.status, healthScore: r.healthScore ?? null, createdAt: r.createdAt,
    })),
  });
});
