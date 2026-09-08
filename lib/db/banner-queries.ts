import { randomUUID } from 'crypto';
import { eq, desc, and, sql, lte, gte } from 'drizzle-orm';
import { db, schema } from './index';

const { banners } = schema;

export function createBanner(data: {
  title: string;
  content: string;
  placement?: string;
  severity?: string;
  ctaText?: string;
  ctaUrl?: string;
  mediaId?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  priority?: number;
  createdBy?: string;
}) {
  const now = new Date();
  const id = randomUUID();
  db.insert(banners)
    .values({
      id,
      title: data.title,
      content: data.content,
      placement: data.placement ?? 'top',
      severity: data.severity ?? 'info',
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      mediaId: data.mediaId,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: data.isActive ?? true,
      priority: data.priority ?? 0,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function getAllBanners() {
  return db.select().from(banners).orderBy(desc(banners.priority), desc(banners.createdAt)).all();
}

export function getBannerById(id: string) {
  return db.select().from(banners).where(eq(banners.id, id)).get();
}

export function updateBanner(id: string, data: {
  title?: string;
  content?: string;
  placement?: string;
  severity?: string;
  ctaText?: string;
  ctaUrl?: string;
  mediaId?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  priority?: number;
}) {
  db.update(banners)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(banners.id, id))
    .run();
}

export function deleteBanner(id: string) {
  db.delete(banners).where(eq(banners.id, id)).run();
}

export function getActiveBanners(placement?: string) {
  const now = Math.floor(Date.now() / 1000);
  const conditions = [
    eq(banners.isActive, true),
    sql`(${banners.startDate} IS NULL OR ${banners.startDate} <= ${now})`,
    sql`(${banners.endDate} IS NULL OR ${banners.endDate} >= ${now})`,
  ];

  if (placement) {
    conditions.push(eq(banners.placement, placement));
  }

  return db
    .select()
    .from(banners)
    .where(and(...conditions))
    .orderBy(desc(banners.priority))
    .all();
}
