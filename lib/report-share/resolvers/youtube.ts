import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { computeGrowthDelta } from '@/lib/pipelines/youtube-channel-growth-pipeline';

// Real channel-level business metrics (subscriber/view counts), not
// personal PII -- same disclosure tier as campaigns/content/branding.
registerReportResolver('youtube', 'channel_growth_summary', async () => {
  const snapshots = db.select().from(schema.youtubeChannelSnapshots).orderBy(desc(schema.youtubeChannelSnapshots.snapshotDate)).limit(10).all();
  const chronological = [...snapshots].reverse();
  const delta = chronological.length >= 2 ? computeGrowthDelta(chronological[chronological.length - 2], chronological[chronological.length - 1]) : null;

  return {
    title: 'YouTube Channel Growth Summary',
    generatedAt: new Date().toISOString(),
    data: {
      latestSnapshots: snapshots.map((s) => ({
        snapshotDate: s.snapshotDate.toISOString(), subscriberCount: s.subscriberCount, totalViews: s.totalViews,
      })),
      latestDelta: delta,
    },
  };
});
