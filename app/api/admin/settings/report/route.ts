import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('settings', 'read')(async () => {
  const all = db.select().from(schema.siteSettings).orderBy(desc(schema.siteSettings.qualityScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalSettings: all.length,
    settings: all.map((s) => ({
      key: s.key, value: JSON.parse(s.value), updatedBy: s.updatedBy, qualityScore: s.qualityScore ?? null,
    })),
  });
});
