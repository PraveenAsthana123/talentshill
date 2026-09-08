import { randomUUID } from 'crypto';
import { eq, count, desc, and, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { shareLinks } = schema;

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createShareLink(data: {
  title: string;
  originalUrl: string;
  contentId?: string;
  assetId?: string;
  campaignId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  expiresAt?: Date;
  createdBy?: string;
}) {
  const id = randomUUID();
  const shortCode = generateShortCode();
  db.insert(shareLinks)
    .values({
      id,
      title: data.title,
      originalUrl: data.originalUrl,
      shortCode,
      contentId: data.contentId,
      assetId: data.assetId,
      campaignId: data.campaignId,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      expiresAt: data.expiresAt,
      createdBy: data.createdBy,
      createdAt: new Date(),
    })
    .run();
  return { id, shortCode };
}

export function getShareLinkById(id: string) {
  return db.select().from(shareLinks).where(eq(shareLinks.id, id)).get();
}

export function getShareLinkByShortCode(shortCode: string) {
  return db.select().from(shareLinks).where(eq(shareLinks.shortCode, shortCode)).get();
}

export function getShareLinks(offset = 0, limit = 50, filters?: { isActive?: boolean }) {
  const conditions = [];
  if (filters?.isActive !== undefined) {
    conditions.push(eq(shareLinks.isActive, filters.isActive));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  return db
    .select()
    .from(shareLinks)
    .where(where)
    .orderBy(desc(shareLinks.createdAt))
    .limit(limit)
    .offset(offset)
    .all();
}

export function getShareLinkCount() {
  const result = db.select({ cnt: count() }).from(shareLinks).get();
  return result?.cnt ?? 0;
}

export function updateShareLink(id: string, data: Partial<{
  title: string;
  isActive: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
}>) {
  db.update(shareLinks).set(data).where(eq(shareLinks.id, id)).run();
}

export function incrementClickCount(id: string) {
  db.update(shareLinks)
    .set({ clickCount: sql`${shareLinks.clickCount} + 1` })
    .where(eq(shareLinks.id, id))
    .run();
}

export function deleteShareLink(id: string) {
  db.delete(shareLinks).where(eq(shareLinks.id, id)).run();
}
