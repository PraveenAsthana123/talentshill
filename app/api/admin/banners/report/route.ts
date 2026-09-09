import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('banners', 'read')(async () => {
  const banners = db.select().from(schema.banners).orderBy(desc(schema.banners.healthScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalBanners: banners.length,
    banners: banners.map((b) => ({
      title: b.title, placement: b.placement, isActive: b.isActive, healthScore: b.healthScore ?? null,
    })),
  });
});
