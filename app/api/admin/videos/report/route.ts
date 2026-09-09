import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('videos', 'read')(async () => {
  const videos = db.select().from(schema.videos).orderBy(desc(schema.videos.contentScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalVideos: videos.length,
    videos: videos.map((v) => ({
      title: v.title, category: v.category, isActive: v.isActive, contentScore: v.contentScore ?? null,
    })),
  });
});
