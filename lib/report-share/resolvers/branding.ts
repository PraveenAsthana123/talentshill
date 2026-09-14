import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';

registerReportResolver('branding', 'brand_health_summary', async () => {
  const latest = db.select().from(schema.brandHealthSnapshots).orderBy(desc(schema.brandHealthSnapshots.snapshotDate)).limit(5).all();

  return {
    title: 'Brand Health Report',
    generatedAt: new Date().toISOString(),
    data: {
      latestSnapshots: latest.map((s) => ({
        snapshotDate: s.snapshotDate.toISOString(),
        healthScore: s.healthScore,
        totalMentions: s.totalMentions,
        positiveMentions: s.positiveMentions,
        neutralMentions: s.neutralMentions,
        negativeMentions: s.negativeMentions,
        competitorsTracked: s.competitorsTracked,
        label: s.label,
      })),
    },
  };
});
