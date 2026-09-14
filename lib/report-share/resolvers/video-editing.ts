import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';

// Business/production data, not personal PII -- same disclosure tier
// as campaigns/content/branding. No real render/output content is
// included, only planning metadata.
registerReportResolver('video_editing', 'repurposing_summary', async () => {
  const projects = db.select().from(schema.videoProjects).all();
  const clips = db.select().from(schema.videoClipPlans).all();

  return {
    title: 'Video Repurposing Summary',
    generatedAt: new Date().toISOString(),
    data: {
      totalProjects: projects.length,
      totalClipPlans: clips.length,
      deliveredClips: clips.filter((c) => c.status === 'delivered').length,
      byClipStatus: clips.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {}),
      byClipPlatform: clips.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.targetPlatform]: (acc[c.targetPlatform] ?? 0) + 1 }), {}),
    },
  };
});
