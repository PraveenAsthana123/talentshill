import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('features', 'read')(async () => {
  const all = db.select().from(schema.featureFlags).orderBy(desc(schema.featureFlags.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalFlags: all.length,
    flags: all.map((f) => ({
      key: f.key, label: f.label, module: f.module, isEnabled: f.isEnabled, readinessScore: f.readinessScore ?? null,
    })),
  });
});
