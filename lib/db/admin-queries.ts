import { randomUUID } from 'crypto';
import { eq, desc, asc, and, like, count, sql } from 'drizzle-orm';
import { db, schema } from './index';
import { slugify } from '@/lib/utils';

const {
  users, siteSettings, auditLog, videos, services, industries,
  contactSubmissions, surveyResponses, blogPosts, blogSubscribers,
} = schema;

// ── Users ──

export function getUserByEmail(email: string): typeof users.$inferSelect | null {
  return db.select().from(users).where(eq(users.email, email)).get() || null;
}

export function getUserById(id: string): typeof users.$inferSelect | null {
  return db.select().from(users).where(eq(users.id, id)).get() || null;
}

export function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role?: 'admin' | 'editor' | 'viewer';
}): typeof users.$inferSelect {
  const id = randomUUID();
  const now = new Date();

  return db.insert(users).values({
    id,
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    role: data.role || 'editor',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).returning().get();
}

export function getAllUsers(): (typeof users.$inferSelect)[] {
  return db.select().from(users).orderBy(desc(users.createdAt)).all();
}

export function updateUser(id: string, data: {
  name?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'viewer';
  isActive?: boolean;
}): typeof users.$inferSelect | null {
  const existing = db.select().from(users).where(eq(users.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updates.name = data.name;
  if (data.email !== undefined) updates.email = data.email;
  if (data.role !== undefined) updates.role = data.role;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  return db.update(users).set(updates).where(eq(users.id, id)).returning().get();
}

// ── Site Settings ──

export function getSetting(key: string): { key: string; value: unknown; updatedBy: string | null; updatedAt: Date } | null {
  const row = db.select().from(siteSettings).where(eq(siteSettings.key, key)).get();
  if (!row) return null;

  return {
    key: row.key,
    value: JSON.parse(row.value),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  };
}

export function getAllSettings(): { key: string; value: unknown; updatedBy: string | null; updatedAt: Date }[] {
  const rows = db.select().from(siteSettings).all();
  return rows.map((row) => ({
    key: row.key,
    value: JSON.parse(row.value),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt,
  }));
}

export function upsertSetting(key: string, value: unknown, userId?: string): void {
  const now = new Date();
  const jsonValue = JSON.stringify(value);

  const existing = db.select().from(siteSettings).where(eq(siteSettings.key, key)).get();

  if (existing) {
    db.update(siteSettings)
      .set({ value: jsonValue, updatedBy: userId || null, updatedAt: now })
      .where(eq(siteSettings.key, key))
      .run();
  } else {
    db.insert(siteSettings).values({
      key,
      value: jsonValue,
      updatedBy: userId || null,
      updatedAt: now,
    }).run();
  }
}

// ── Audit Log ──

export function logAudit(data: {
  entityType: string;
  entityId?: string;
  action: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}): void {
  const id = randomUUID();
  const now = new Date();

  db.insert(auditLog).values({
    id,
    entityType: data.entityType,
    entityId: data.entityId || null,
    action: data.action,
    userId: data.userId || null,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
    createdAt: now,
  }).run();
}

export function getAuditLog(options: {
  offset?: number;
  limit?: number;
  entityType?: string;
  userId?: string;
} = {}): { entries: { id: string; entityType: string; entityId: string | null; action: string; userId: string | null; userName: string | null; metadata: Record<string, unknown> | null; createdAt: Date }[]; total: number } {
  const { offset = 0, limit = 50, entityType, userId } = options;

  const conditions = [];
  if (entityType) {
    conditions.push(eq(auditLog.entityType, entityType));
  }
  if (userId) {
    conditions.push(eq(auditLog.userId, userId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = db.select({ cnt: count() }).from(auditLog).where(where).get();
  const total = totalResult?.cnt || 0;

  const rows = db
    .select({
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      userId: auditLog.userId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .where(where)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  const entries = rows.map((row) => ({
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action,
    userId: row.userId,
    userName: row.userName || null,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    createdAt: row.createdAt,
  }));

  return { entries, total };
}

export function getRecentActivity(limit = 10): { id: string; entityType: string; entityId: string | null; action: string; userId: string | null; userName: string | null; metadata: Record<string, unknown> | null; createdAt: Date }[] {
  const rows = db
    .select({
      id: auditLog.id,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      action: auditLog.action,
      userId: auditLog.userId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      userName: users.name,
    })
    .from(auditLog)
    .leftJoin(users, eq(auditLog.userId, users.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit)
    .all();

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    action: row.action,
    userId: row.userId,
    userName: row.userName || null,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    createdAt: row.createdAt,
  }));
}

// ── Videos ──

function parseVideoRow(row: typeof videos.$inferSelect) {
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]') as string[],
  };
}

export function getAllVideos(activeOnly = false) {
  const conditions = [];
  if (activeOnly) {
    conditions.push(eq(videos.isActive, true));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = db.select().from(videos)
    .where(where)
    .orderBy(asc(videos.sortOrder))
    .all();

  return rows.map(parseVideoRow);
}

export function getVideoById(id: string) {
  const row = db.select().from(videos).where(eq(videos.id, id)).get();
  if (!row) return null;
  return parseVideoRow(row);
}

export function createVideo(data: {
  title: string;
  summary?: string;
  videoUrl: string;
  provider?: string;
  thumbnail?: string;
  tags?: string[];
  category?: string;
  duration?: string;
  sortOrder?: number;
}) {
  const id = randomUUID();
  const now = new Date();

  const row = db.insert(videos).values({
    id,
    title: data.title,
    summary: data.summary || null,
    videoUrl: data.videoUrl,
    provider: data.provider || 'youtube',
    thumbnail: data.thumbnail || null,
    tags: data.tags ? JSON.stringify(data.tags) : '[]',
    category: data.category || null,
    duration: data.duration || null,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).returning().get();

  return parseVideoRow(row);
}

export function updateVideo(id: string, data: {
  title?: string;
  summary?: string;
  videoUrl?: string;
  provider?: string;
  thumbnail?: string;
  tags?: string[];
  category?: string;
  duration?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const existing = db.select().from(videos).where(eq(videos.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.summary !== undefined) updates.summary = data.summary;
  if (data.videoUrl !== undefined) updates.videoUrl = data.videoUrl;
  if (data.provider !== undefined) updates.provider = data.provider;
  if (data.thumbnail !== undefined) updates.thumbnail = data.thumbnail;
  if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);
  if (data.category !== undefined) updates.category = data.category;
  if (data.duration !== undefined) updates.duration = data.duration;
  if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  const row = db.update(videos).set(updates).where(eq(videos.id, id)).returning().get();
  return parseVideoRow(row);
}

export function deleteVideo(id: string): boolean {
  const result = db.delete(videos).where(eq(videos.id, id)).run();
  return result.changes > 0;
}

// ── Services ──

function parseServiceRow(row: typeof services.$inferSelect) {
  return {
    ...row,
    tags: JSON.parse(row.tags || '[]') as string[],
    useCases: JSON.parse(row.useCases || '[]') as string[],
  };
}

export function getAllServices(activeOnly = false) {
  const conditions = [];
  if (activeOnly) {
    conditions.push(eq(services.isActive, true));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = db.select().from(services)
    .where(where)
    .orderBy(asc(services.sortOrder))
    .all();

  return rows.map(parseServiceRow);
}

export function getServiceById(id: string) {
  const row = db.select().from(services).where(eq(services.id, id)).get();
  if (!row) return null;
  return parseServiceRow(row);
}

export function createService(data: {
  name: string;
  category: string;
  shortDesc?: string;
  longDesc?: string;
  icon?: string;
  tags?: string[];
  useCases?: string[];
  sortOrder?: number;
}) {
  const id = randomUUID();
  const now = new Date();
  let slug = slugify(data.name);

  // handle slug collision
  const existingSlug = db.select().from(services).where(eq(services.slug, slug)).get();
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const row = db.insert(services).values({
    id,
    name: data.name,
    slug,
    category: data.category,
    shortDesc: data.shortDesc || null,
    longDesc: data.longDesc || null,
    icon: data.icon || null,
    tags: data.tags ? JSON.stringify(data.tags) : '[]',
    useCases: data.useCases ? JSON.stringify(data.useCases) : '[]',
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).returning().get();

  return parseServiceRow(row);
}

export function updateService(id: string, data: {
  name?: string;
  slug?: string;
  category?: string;
  shortDesc?: string;
  longDesc?: string;
  icon?: string;
  tags?: string[];
  useCases?: string[];
  sortOrder?: number;
  isActive?: boolean;
}) {
  const existing = db.select().from(services).where(eq(services.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updates.name = data.name;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.category !== undefined) updates.category = data.category;
  if (data.shortDesc !== undefined) updates.shortDesc = data.shortDesc;
  if (data.longDesc !== undefined) updates.longDesc = data.longDesc;
  if (data.icon !== undefined) updates.icon = data.icon;
  if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);
  if (data.useCases !== undefined) updates.useCases = JSON.stringify(data.useCases);
  if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  const row = db.update(services).set(updates).where(eq(services.id, id)).returning().get();
  return parseServiceRow(row);
}

export function deleteService(id: string): boolean {
  const result = db.delete(services).where(eq(services.id, id)).run();
  return result.changes > 0;
}

// ── Industries ──

export function getAllIndustries(activeOnly = false) {
  const conditions = [];
  if (activeOnly) {
    conditions.push(eq(industries.isActive, true));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db.select().from(industries)
    .where(where)
    .orderBy(asc(industries.sortOrder))
    .all();
}

export function getIndustryById(id: string) {
  return db.select().from(industries).where(eq(industries.id, id)).get() || null;
}

export function createIndustry(data: {
  name: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}) {
  const id = randomUUID();
  const now = new Date();
  let slug = slugify(data.name);

  // handle slug collision
  const existingSlug = db.select().from(industries).where(eq(industries.slug, slug)).get();
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return db.insert(industries).values({
    id,
    name: data.name,
    slug,
    icon: data.icon || null,
    description: data.description || null,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }).returning().get();
}

export function updateIndustry(id: string, data: {
  name?: string;
  slug?: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const existing = db.select().from(industries).where(eq(industries.id, id)).get();
  if (!existing) return null;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updates.name = data.name;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.icon !== undefined) updates.icon = data.icon;
  if (data.description !== undefined) updates.description = data.description;
  if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  return db.update(industries).set(updates).where(eq(industries.id, id)).returning().get();
}

export function deleteIndustry(id: string): boolean {
  const result = db.delete(industries).where(eq(industries.id, id)).run();
  return result.changes > 0;
}

// ── Dashboard Stats ──

export function getDashboardStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const totalLeads = db.select({ cnt: count() }).from(contactSubmissions).get()?.cnt || 0;
  const newLeads = db.select({ cnt: count() }).from(contactSubmissions).where(eq(contactSubmissions.status, 'new')).get()?.cnt || 0;
  const totalSurveys = db.select({ cnt: count() }).from(surveyResponses).get()?.cnt || 0;
  const totalPosts = db.select({ cnt: count() }).from(blogPosts).get()?.cnt || 0;
  const totalSubscribers = db.select({ cnt: count() }).from(blogSubscribers).where(eq(blogSubscribers.status, 'active')).get()?.cnt || 0;
  const totalVideos = db.select({ cnt: count() }).from(videos).get()?.cnt || 0;

  const recentLeads30d = db.select({ cnt: count() }).from(contactSubmissions)
    .where(sql`${contactSubmissions.createdAt} > ${thirtyDaysAgo}`)
    .get()?.cnt || 0;

  const recentSurveys30d = db.select({ cnt: count() }).from(surveyResponses)
    .where(sql`${surveyResponses.createdAt} > ${thirtyDaysAgo}`)
    .get()?.cnt || 0;

  return {
    totalLeads,
    newLeads,
    totalSurveys,
    totalPosts,
    totalSubscribers,
    totalVideos,
    recentLeads30d,
    recentSurveys30d,
  };
}
