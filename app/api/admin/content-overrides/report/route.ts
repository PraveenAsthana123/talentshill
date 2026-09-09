import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('content_overrides', 'read')(async () => {
  const all = db.select().from(schema.contentOverrides).orderBy(desc(schema.contentOverrides.safetyScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalOverrides: all.length,
    overrides: all.map((o) => ({
      pageSlug: o.pageSlug, section: o.section, key: o.key, isActive: o.isActive, safetyScore: o.safetyScore ?? null,
    })),
  });
});
