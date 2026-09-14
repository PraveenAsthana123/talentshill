import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { adCampaigns } = schema;

export function createAdCampaign(data: {
  name: string;
  platform: 'google' | 'meta' | 'linkedin' | 'tiktok' | 'other';
  objective?: string;
  budget?: number;
  targetAudience?: string;
  creativeUrl?: string;
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(adCampaigns).values({
    id,
    name: data.name,
    platform: data.platform,
    status: 'draft',
    objective: data.objective,
    budget: data.budget,
    spend: 0,
    targetAudience: data.targetAudience,
    creativeUrl: data.creativeUrl,
    startDate: data.startDate,
    endDate: data.endDate,
    notes: data.notes,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
  }).run();
  return id;
}

export function getAdCampaignById(id: string) {
  return db.select().from(adCampaigns).where(eq(adCampaigns.id, id)).get();
}

export function getAllAdCampaigns(options: { platform?: string; status?: string; limit?: number; offset?: number } = {}) {
  const { platform, status, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (platform) conditions.push(eq(adCampaigns.platform, platform as 'google' | 'meta' | 'linkedin' | 'tiktok' | 'other'));
  if (status) conditions.push(eq(adCampaigns.status, status as 'draft' | 'active' | 'paused' | 'completed'));

  const query = conditions.length
    ? db.select().from(adCampaigns).where(and(...conditions))
    : db.select().from(adCampaigns);
  const items = query.orderBy(desc(adCampaigns.createdAt)).limit(limit).offset(offset).all();

  const totalQuery = conditions.length
    ? db.select().from(adCampaigns).where(and(...conditions))
    : db.select().from(adCampaigns);
  const total = totalQuery.all().length;

  return { items, total };
}

export function updateAdCampaign(id: string, data: Partial<{
  name: string; status: 'draft' | 'active' | 'paused' | 'completed'; objective: string;
  budget: number; spend: number; targetAudience: string; creativeUrl: string;
  startDate: Date; endDate: Date; notes: string;
}>) {
  db.update(adCampaigns).set({ ...data, updatedAt: new Date() }).where(eq(adCampaigns.id, id)).run();
}

export function deleteAdCampaign(id: string) {
  db.delete(adCampaigns).where(eq(adCampaigns.id, id)).run();
}
