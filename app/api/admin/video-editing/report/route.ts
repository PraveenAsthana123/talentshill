import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('video_editing', 'read')(async () => {
  const all = db.select().from(schema.videoProjects).orderBy(desc(schema.videoProjects.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalProjects: all.length,
    projects: all.map((p) => ({ title: p.title, tool: p.tool, status: p.status, durationSeconds: p.durationSeconds, readinessScore: p.readinessScore ?? null })),
  });
});
