import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';
import type { BlogPost, BlogPostMeta } from '@/types';
import {
  getPublishedPosts as dbGetPublished,
  getPostBySlug as dbGetBySlug,
  getFeaturedPost as dbGetFeatured,
  getAllCategories as dbGetCategories,
  getAllTags as dbGetTags,
  type PostWithMeta,
} from '@/lib/db/blog-queries';

async function renderMarkdown(content: string): Promise<string> {
  const processed = await remark().use(html).process(content);
  return processed.toString();
}

function postToMeta(p: PostWithMeta): BlogPostMeta {
  return {
    slug: p.slug,
    title: p.title,
    date: p.publishedAt?.toISOString() || p.createdAt.toISOString(),
    tags: p.tags.map((t) => t.name),
    category: p.categories[0]?.name || '',
    summary: p.summary,
    coverImage: p.coverImage || '',
    author: p.author?.name || 'Talents Hill Team',
    readingTime: p.readingTime,
  };
}

async function postToFull(p: PostWithMeta): Promise<BlogPost> {
  const htmlContent = await renderMarkdown(p.content);
  return {
    ...postToMeta(p),
    content: htmlContent,
  };
}

/** Get all published posts (synchronous for RSS/sitemap backward compat) */
export function getAllPosts(): BlogPostMeta[] {
  // Synchronous approach for sitemap/RSS that need sync functions
  const { db: database, schema } = require('@/lib/db/index');
  const { eq, desc } = require('drizzle-orm');

  const rows = database.select().from(schema.blogPosts)
    .where(eq(schema.blogPosts.status, 'published'))
    .orderBy(desc(schema.blogPosts.publishedAt))
    .all();

  return rows.map((row: { slug: string; title: string; publishedAt: Date | null; createdAt: Date; summary: string; coverImage: string | null; content: string }) => ({
    slug: row.slug,
    title: row.title,
    date: row.publishedAt ? row.publishedAt.toISOString() : row.createdAt.toISOString(),
    tags: [] as string[],
    category: '',
    summary: row.summary,
    coverImage: row.coverImage || '',
    author: 'Talents Hill Team',
    readingTime: readingTime(row.content).text,
  }));
}

/** Get published posts with full metadata (async) */
export async function getPublishedPosts(options?: {
  offset?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
}): Promise<{ posts: BlogPostMeta[]; total: number }> {
  const result = await dbGetPublished(options);
  return {
    posts: result.posts.map(postToMeta),
    total: result.total,
  };
}

/** Get a single post by slug with rendered HTML content */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await dbGetBySlug(slug);
  if (!post) return null;
  return postToFull(post);
}

/** Get the raw PostWithMeta (for SEO, admin, etc.) */
export async function getPostWithMeta(slug: string): Promise<PostWithMeta | null> {
  return dbGetBySlug(slug);
}

/** Get featured post */
export async function getFeaturedPost(): Promise<BlogPostMeta | null> {
  const post = await dbGetFeatured();
  if (!post) return null;
  return postToMeta(post);
}

/** Get related posts by tag overlap */
export function getRelatedPosts(currentSlug: string, tags: string[], limit = 3): BlogPostMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);
  const scored = all.map((post) => ({
    post,
    score: post.tags.filter((t) => tags.includes(t)).length,
  }));
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.post);
}

/** Get all categories */
export function getCategories() {
  return dbGetCategories();
}

/** Get all tags */
export function getTags() {
  return dbGetTags();
}
