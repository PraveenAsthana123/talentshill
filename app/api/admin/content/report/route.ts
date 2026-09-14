import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';
import { runContentPerformancePipeline } from '@/lib/pipelines/content-performance-pipeline';

export const GET = withPermission('content', 'read')(async () => {
  const all = db.select().from(schema.marketingContent).orderBy(desc(schema.marketingContent.readinessScore)).all();
  const performance = await runContentPerformancePipeline({ triggeredBy: null });
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalContent: all.length,
    content: all.map((c) => ({
      title: c.title, contentType: c.contentType, status: c.status, readinessScore: c.readinessScore ?? null,
    })),
    performance: { scoredContent: performance.scoredContent, unscoredContent: performance.unscoredContent, suggestions: performance.suggestions },
  });
});
