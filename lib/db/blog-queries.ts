import { randomUUID } from 'crypto';
import { eq, desc, asc, and, like, sql, count, inArray } from 'drizzle-orm';
import { db, schema } from './index';
import { remark } from 'remark';
import html from 'remark-html';
import readingTime from 'reading-time';
import { slugify } from '@/lib/utils';

const {
  blogPosts, blogCategories, blogTags, blogPostCategories,
  blogPostTags, blogAuthors, blogViews, blogSubscribers,
} = schema;

type PostStatus = 'draft' | 'published' | 'archived';

// ── Types ──

export interface PostWithMeta {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string | null;
  status: string;
  featured: boolean | null;
  authorId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string; bio: string | null; avatarUrl: string | null; socialLinks: string | null } | null;
  categories: { id: string; name: string; slug: string; color: string | null }[];
  tags: { id: string; name: string; slug: string }[];
  viewCount: number;
  readingTime: string;
}

// ── Markdown Rendering ──

export async function renderMarkdown(content: string): Promise<string> {
  const processed = await remark().use(html).process(content);
  return processed.toString();
}

export function calculateReadingTime(content: string): string {
  return readingTime(content).text;
}

// ── Helper to build PostWithMeta ──

function buildPostWithMeta(
  post: typeof blogPosts.$inferSelect,
  author: typeof blogAuthors.$inferSelect | null,
  categories: { id: string; name: string; slug: string; color: string | null }[],
  tags: { id: string; name: string; slug: string }[],
  viewCount: number
): PostWithMeta {
  return {
    ...post,
    author: author || null,
    categories,
    tags,
    viewCount,
    readingTime: calculateReadingTime(post.content),
  };
}

async function enrichPost(post: typeof blogPosts.$inferSelect): Promise<PostWithMeta> {
  const author = post.authorId
    ? db.select().from(blogAuthors).where(eq(blogAuthors.id, post.authorId)).get() || null
    : null;

  const catRows = db
    .select({ id: blogCategories.id, name: blogCategories.name, slug: blogCategories.slug, color: blogCategories.color })
    .from(blogPostCategories)
    .innerJoin(blogCategories, eq(blogPostCategories.categoryId, blogCategories.id))
    .where(eq(blogPostCategories.postId, post.id))
    .all();

  const tagRows = db
    .select({ id: blogTags.id, name: blogTags.name, slug: blogTags.slug })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
    .where(eq(blogPostTags.postId, post.id))
    .all();

  const viewResult = db
    .select({ cnt: count() })
    .from(blogViews)
    .where(eq(blogViews.postId, post.id))
    .get();

  return buildPostWithMeta(post, author, catRows, tagRows, viewResult?.cnt || 0);
}

// ── Posts ──

export async function getPublishedPosts(options: {
  offset?: number;
  limit?: number;
  categorySlug?: string;
  tagSlug?: string;
  search?: string;
} = {}): Promise<{ posts: PostWithMeta[]; total: number }> {
  const { offset = 0, limit = 12, categorySlug, tagSlug, search } = options;

  let postIds: string[] | null = null;

  if (categorySlug) {
    const cat = db.select().from(blogCategories).where(eq(blogCategories.slug, categorySlug)).get();
    if (cat) {
      const rows = db.select({ postId: blogPostCategories.postId })
        .from(blogPostCategories)
        .where(eq(blogPostCategories.categoryId, cat.id))
        .all();
      postIds = rows.map((r) => r.postId);
    } else {
      return { posts: [], total: 0 };
    }
  }

  if (tagSlug) {
    const tag = db.select().from(blogTags).where(eq(blogTags.slug, tagSlug)).get();
    if (tag) {
      const rows = db.select({ postId: blogPostTags.postId })
        .from(blogPostTags)
        .where(eq(blogPostTags.tagId, tag.id))
        .all();
      const tagPostIds = rows.map((r) => r.postId);
      postIds = postIds ? postIds.filter((id) => tagPostIds.includes(id)) : tagPostIds;
    } else {
      return { posts: [], total: 0 };
    }
  }

  const conditions = [eq(blogPosts.status, 'published')];
  if (postIds !== null) {
    if (postIds.length === 0) return { posts: [], total: 0 };
    conditions.push(inArray(blogPosts.id, postIds));
  }
  if (search) {
    conditions.push(like(blogPosts.title, `%${search}%`));
  }

  const where = and(...conditions);

  const totalResult = db.select({ cnt: count() }).from(blogPosts).where(where).get();
  const total = totalResult?.cnt || 0;

  const rows = db.select().from(blogPosts)
    .where(where)
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset)
    .all();

  const posts = await Promise.all(rows.map(enrichPost));
  return { posts, total };
}

export async function getAllPostsAdmin(options: {
  offset?: number;
  limit?: number;
  status?: PostStatus | 'all';
  search?: string;
} = {}): Promise<{ posts: PostWithMeta[]; total: number }> {
  const { offset = 0, limit = 20, status, search } = options;

  const conditions = [];
  if (status && status !== 'all') {
    conditions.push(eq(blogPosts.status, status as PostStatus));
  }
  if (search) {
    conditions.push(like(blogPosts.title, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db.select({ cnt: count() }).from(blogPosts).where(where).get();
  const total = totalResult?.cnt || 0;

  const rows = db.select().from(blogPosts)
    .where(where)
    .orderBy(desc(blogPosts.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();

  const posts = await Promise.all(rows.map(enrichPost));
  return { posts, total };
}

export async function getPostBySlug(slug: string): Promise<PostWithMeta | null> {
  const post = db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).get();
  if (!post) return null;
  return enrichPost(post);
}

export async function getPostById(id: string): Promise<PostWithMeta | null> {
  const post = db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
  if (!post) return null;
  return enrichPost(post);
}

export async function getFeaturedPost(): Promise<PostWithMeta | null> {
  const post = db.select().from(blogPosts)
    .where(and(eq(blogPosts.status, 'published'), eq(blogPosts.featured, true)))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(1)
    .get();
  if (!post) return null;
  return enrichPost(post);
}

export async function getRelatedPosts(postId: string, tagIds: string[], limit = 3): Promise<PostWithMeta[]> {
  if (tagIds.length === 0) return [];

  const relatedRows = db
    .select({ postId: blogPostTags.postId, cnt: count() })
    .from(blogPostTags)
    .innerJoin(blogPosts, eq(blogPostTags.postId, blogPosts.id))
    .where(and(
      inArray(blogPostTags.tagId, tagIds),
      eq(blogPosts.status, 'published'),
      sql`${blogPostTags.postId} != ${postId}`
    ))
    .groupBy(blogPostTags.postId)
    .orderBy(desc(count()))
    .limit(limit)
    .all();

  const posts = await Promise.all(
    relatedRows.map(async (r) => {
      const post = db.select().from(blogPosts).where(eq(blogPosts.id, r.postId)).get();
      return post ? enrichPost(post) : null;
    })
  );

  return posts.filter((p): p is PostWithMeta => p !== null);
}

export function createPost(data: {
  title: string;
  content: string;
  summary: string;
  coverImage?: string;
  status?: PostStatus;
  featured?: boolean;
  authorId?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  tags?: string[];
}): typeof blogPosts.$inferSelect {
  const id = randomUUID();
  let slug = slugify(data.title);

  // handle slug collision
  const existing = db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).get();
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const now = new Date();
  const status: PostStatus = data.status || 'draft';
  const publishedAt = status === 'published' ? now : null;

  const post = db.insert(blogPosts).values({
    id,
    title: data.title,
    slug,
    summary: data.summary,
    content: data.content,
    coverImage: data.coverImage || null,
    status,
    featured: data.featured || false,
    authorId: data.authorId || null,
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    publishedAt,
    createdAt: now,
    updatedAt: now,
  }).returning().get();

  // Link categories
  if (data.categoryIds?.length) {
    for (const catId of data.categoryIds) {
      db.insert(blogPostCategories).values({ postId: id, categoryId: catId }).run();
    }
  }

  // Link tags (upsert)
  if (data.tags?.length) {
    for (const tagName of data.tags) {
      const tagSlug = slugify(tagName);
      let tag = db.select().from(blogTags).where(eq(blogTags.slug, tagSlug)).get();
      if (!tag) {
        tag = db.insert(blogTags).values({
          id: randomUUID(),
          name: tagName,
          slug: tagSlug,
        }).returning().get();
      }
      db.insert(blogPostTags).values({ postId: id, tagId: tag.id }).onConflictDoNothing().run();
    }
  }

  return post;
}

export function updatePost(id: string, data: {
  title?: string;
  slug?: string;
  content?: string;
  summary?: string;
  coverImage?: string;
  status?: PostStatus;
  featured?: boolean;
  authorId?: string;
  metaTitle?: string;
  metaDescription?: string;
  categoryIds?: string[];
  tags?: string[];
}): typeof blogPosts.$inferSelect | null {
  const existing = db.select().from(blogPosts).where(eq(blogPosts.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.content !== undefined) updates.content = data.content;
  if (data.summary !== undefined) updates.summary = data.summary;
  if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
  if (data.featured !== undefined) updates.featured = data.featured;
  if (data.authorId !== undefined) updates.authorId = data.authorId;
  if (data.metaTitle !== undefined) updates.metaTitle = data.metaTitle;
  if (data.metaDescription !== undefined) updates.metaDescription = data.metaDescription;

  if (data.status !== undefined) {
    updates.status = data.status;
    if (data.status === 'published' && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }
  }

  const post = db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning().get();

  // Update categories
  if (data.categoryIds !== undefined) {
    db.delete(blogPostCategories).where(eq(blogPostCategories.postId, id)).run();
    for (const catId of data.categoryIds) {
      db.insert(blogPostCategories).values({ postId: id, categoryId: catId }).run();
    }
  }

  // Update tags
  if (data.tags !== undefined) {
    db.delete(blogPostTags).where(eq(blogPostTags.postId, id)).run();
    for (const tagName of data.tags) {
      const tagSlug = slugify(tagName);
      let tag = db.select().from(blogTags).where(eq(blogTags.slug, tagSlug)).get();
      if (!tag) {
        tag = db.insert(blogTags).values({
          id: randomUUID(),
          name: tagName,
          slug: tagSlug,
        }).returning().get();
      }
      db.insert(blogPostTags).values({ postId: id, tagId: tag.id }).onConflictDoNothing().run();
    }
  }

  return post;
}

export function deletePost(id: string): boolean {
  const result = db.delete(blogPosts).where(eq(blogPosts.id, id)).run();
  return result.changes > 0;
}

// ── Categories ──

export function getAllCategories(): (typeof blogCategories.$inferSelect & { postCount: number })[] {
  const cats = db.select().from(blogCategories).orderBy(asc(blogCategories.sortOrder)).all();
  return cats.map((cat) => {
    const result = db.select({ cnt: count() })
      .from(blogPostCategories)
      .innerJoin(blogPosts, eq(blogPostCategories.postId, blogPosts.id))
      .where(and(eq(blogPostCategories.categoryId, cat.id), eq(blogPosts.status, 'published')))
      .get();
    return { ...cat, postCount: result?.cnt || 0 };
  });
}

export function createCategory(data: { name: string; description?: string; color?: string }): typeof blogCategories.$inferSelect {
  const id = randomUUID();
  return db.insert(blogCategories).values({
    id,
    name: data.name,
    slug: slugify(data.name),
    description: data.description || null,
    color: data.color || null,
  }).returning().get();
}

// ── Tags ──

export function getAllTags(): (typeof blogTags.$inferSelect & { postCount: number })[] {
  const tags = db.select().from(blogTags).orderBy(asc(blogTags.name)).all();
  return tags.map((tag) => {
    const result = db.select({ cnt: count() })
      .from(blogPostTags)
      .innerJoin(blogPosts, eq(blogPostTags.postId, blogPosts.id))
      .where(and(eq(blogPostTags.tagId, tag.id), eq(blogPosts.status, 'published')))
      .get();
    return { ...tag, postCount: result?.cnt || 0 };
  });
}

// ── Authors ──

export function getAllAuthors(): (typeof blogAuthors.$inferSelect)[] {
  return db.select().from(blogAuthors).all();
}

export function createAuthor(data: { name: string; bio?: string; avatarUrl?: string; socialLinks?: string }): typeof blogAuthors.$inferSelect {
  const id = randomUUID();
  return db.insert(blogAuthors).values({
    id,
    name: data.name,
    bio: data.bio || null,
    avatarUrl: data.avatarUrl || null,
    socialLinks: data.socialLinks || null,
    createdAt: new Date(),
  }).returning().get();
}

// ── Views ──

export function trackView(postId: string, sessionId: string): { viewCount: number; isNew: boolean } {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  const recent = db.select().from(blogViews)
    .where(and(
      eq(blogViews.postId, postId),
      eq(blogViews.sessionId, sessionId),
      sql`${blogViews.viewedAt} > ${thirtyMinAgo}`
    ))
    .get();

  let isNew = false;
  if (!recent) {
    db.insert(blogViews).values({
      id: randomUUID(),
      postId,
      sessionId,
      viewedAt: new Date(),
    }).run();
    isNew = true;
  }

  const result = db.select({ cnt: count() }).from(blogViews).where(eq(blogViews.postId, postId)).get();
  return { viewCount: result?.cnt || 0, isNew };
}

export function getViewCount(postId: string): number {
  const result = db.select({ cnt: count() }).from(blogViews).where(eq(blogViews.postId, postId)).get();
  return result?.cnt || 0;
}

// ── Subscribers ──

export function addSubscriber(email: string): { success: boolean; message: string } {
  const existing = db.select().from(blogSubscribers).where(eq(blogSubscribers.email, email)).get();

  if (existing) {
    if (existing.status === 'active') {
      return { success: false, message: 'Already subscribed' };
    }
    // Re-subscribe
    db.update(blogSubscribers)
      .set({ status: 'active', subscribedAt: new Date(), unsubscribedAt: null })
      .where(eq(blogSubscribers.id, existing.id))
      .run();
    return { success: true, message: 'Re-subscribed successfully' };
  }

  db.insert(blogSubscribers).values({
    id: randomUUID(),
    email,
    status: 'active',
    subscribedAt: new Date(),
  }).run();

  return { success: true, message: 'Subscribed successfully' };
}

export function getAllSubscribers(status?: 'active' | 'unsubscribed' | 'all'): (typeof blogSubscribers.$inferSelect)[] {
  if (status && status !== 'all') {
    return db.select().from(blogSubscribers).where(eq(blogSubscribers.status, status)).all();
  }
  return db.select().from(blogSubscribers).all();
}

export function getSubscriberCount(): number {
  const result = db.select({ cnt: count() }).from(blogSubscribers).where(eq(blogSubscribers.status, 'active')).get();
  return result?.cnt || 0;
}

// ── Stats ──

export function getAdminStats() {
  const totalPosts = db.select({ cnt: count() }).from(blogPosts).get()?.cnt || 0;
  const published = db.select({ cnt: count() }).from(blogPosts).where(eq(blogPosts.status, 'published')).get()?.cnt || 0;
  const drafts = db.select({ cnt: count() }).from(blogPosts).where(eq(blogPosts.status, 'draft')).get()?.cnt || 0;
  const totalViews = db.select({ cnt: count() }).from(blogViews).get()?.cnt || 0;
  const subscriberCount = getSubscriberCount();

  // Top posts by views
  const topPosts = db
    .select({ postId: blogViews.postId, cnt: count() })
    .from(blogViews)
    .groupBy(blogViews.postId)
    .orderBy(desc(count()))
    .limit(5)
    .all();

  const topPostDetails = topPosts.map((tp) => {
    const post = db.select({ title: blogPosts.title, slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.id, tp.postId)).get();
    return { title: post?.title || '', slug: post?.slug || '', views: tp.cnt };
  });

  return { totalPosts, published, drafts, totalViews, subscriberCount, topPosts: topPostDetails };
}
