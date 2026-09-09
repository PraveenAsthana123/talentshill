import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';
import { getSubscriberCount } from '@/lib/db/blog-queries';

export const GET = withPermission('blog', 'read')(async () => {
  const all = db.select().from(schema.blogPosts).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'blog');
  const unscored = all.filter((p) => p.seoReadinessScore === null || p.seoReadinessScore === undefined);
  const scored = all.filter((p) => p.seoReadinessScore !== null && p.seoReadinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalPosts: all.length,
      published: all.filter((p) => p.status === 'published').length,
      drafts: all.filter((p) => p.status === 'draft').length,
      archived: all.filter((p) => p.status === 'archived').length,
      unscored: unscored.length,
      avgReadiness: scored.length > 0 ? Math.round(scored.reduce((s, p) => s + (p.seoReadinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
      subscribers: getSubscriberCount(),
    },
  });
});
