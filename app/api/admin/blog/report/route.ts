import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('blog', 'read')(async () => {
  const posts = db.select().from(schema.blogPosts).orderBy(desc(schema.blogPosts.seoReadinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalPosts: posts.length,
    posts: posts.map((p) => ({
      title: p.title, status: p.status, seoReadinessScore: p.seoReadinessScore ?? null,
      hasMetaTitle: !!p.metaTitle, hasMetaDescription: !!p.metaDescription, hasCoverImage: !!p.coverImage,
    })),
  });
});
