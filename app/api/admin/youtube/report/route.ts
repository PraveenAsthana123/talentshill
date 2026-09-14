import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('youtube', 'read')(async () => {
  const all = db.select().from(schema.youtubeVideos).orderBy(desc(schema.youtubeVideos.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalVideos: all.length,
    videos: all.map((v) => ({ title: v.title, status: v.status, externalVideoId: v.externalVideoId, readinessScore: v.readinessScore ?? null })),
  });
});
