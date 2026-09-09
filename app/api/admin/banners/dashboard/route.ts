import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('banners', 'read')(async () => {
  const all = db.select().from(schema.banners).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'banners');
  const scored = all.filter((b) => b.healthScore !== null && b.healthScore !== undefined);
  const unscored = all.filter((b) => b.healthScore === null || b.healthScore === undefined);
  const now = Date.now();
  const staleActive = all.filter((b) => b.isActive && b.endDate && new Date(b.endDate).getTime() < now);

  return NextResponse.json({
    kpis: {
      totalBanners: all.length,
      active: all.filter((b) => b.isActive).length,
      inactive: all.filter((b) => !b.isActive).length,
      unscored: unscored.length,
      avgHealth: scored.length > 0 ? Math.round(scored.reduce((s, b) => s + (b.healthScore || 0), 0) / scored.length) : 0,
      staleActive: staleActive.length,
      totalRuns: runs.length,
    },
    byPlacement: {
      top: all.filter((b) => b.placement === 'top').length,
      bottom: all.filter((b) => b.placement === 'bottom').length,
      modal: all.filter((b) => b.placement === 'modal').length,
      inline: all.filter((b) => b.placement === 'inline').length,
    },
  });
});
