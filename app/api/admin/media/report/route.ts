import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('media', 'read')(async () => {
  const all = db.select().from(schema.media).orderBy(desc(schema.media.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalMedia: all.length,
    media: all.map((m) => ({
      originalName: m.originalName, mimeType: m.mimeType, size: m.size, isActive: m.isActive, readinessScore: m.readinessScore ?? null,
    })),
  });
});
