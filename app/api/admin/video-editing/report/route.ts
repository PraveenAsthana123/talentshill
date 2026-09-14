import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('video_editing', 'read')(async () => {
  const all = db.select().from(schema.videoProjects).orderBy(desc(schema.videoProjects.readinessScore)).all();
  const clips = db.select().from(schema.videoClipPlans).orderBy(desc(schema.videoClipPlans.readinessScore)).all();
  const projectTitleById = new Map(all.map((p) => [p.id, p.title]));
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalProjects: all.length,
    projects: all.map((p) => ({ title: p.title, tool: p.tool, status: p.status, durationSeconds: p.durationSeconds, readinessScore: p.readinessScore ?? null })),
    clipPlans: clips.map((c) => ({
      title: c.title, sourceTitle: projectTitleById.get(c.sourceProjectId) ?? 'unknown',
      targetPlatform: c.targetPlatform, targetAspectRatio: c.targetAspectRatio, status: c.status,
      durationSeconds: c.endSeconds - c.startSeconds, readinessScore: c.readinessScore ?? null,
    })),
  });
});
