import { db, schema } from './index';
import { eq, desc, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { influencerCampaigns } = schema;

export function createInfluencerCampaign(data: {
  influencerName: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'other';
  deliverables?: string;
  agreedFee?: number;
  contactEmail?: string;
  audienceFitScore?: number;
  campaignFeedbackNotes?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(influencerCampaigns).values({
    id, influencerName: data.influencerName, platform: data.platform, status: 'prospecting',
    deliverables: data.deliverables, agreedFee: data.agreedFee, contactEmail: data.contactEmail,
    audienceFitScore: data.audienceFitScore, campaignFeedbackNotes: data.campaignFeedbackNotes,
    createdBy: data.createdBy, createdAt: now, updatedAt: now,
  }).run();
  return id;
}

export function getInfluencerCampaignById(id: string) {
  return db.select().from(influencerCampaigns).where(eq(influencerCampaigns.id, id)).get();
}

export function getAllInfluencerCampaigns(options: { status?: string; platform?: string; limit?: number; offset?: number } = {}) {
  const { status, platform, limit = 50, offset = 0 } = options;
  const conditions = [];
  if (status) conditions.push(eq(influencerCampaigns.status, status as 'prospecting' | 'negotiating' | 'active' | 'completed' | 'cancelled'));
  if (platform) conditions.push(eq(influencerCampaigns.platform, platform as 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'other'));
  const query = conditions.length ? db.select().from(influencerCampaigns).where(and(...conditions)) : db.select().from(influencerCampaigns);
  const items = query.orderBy(desc(influencerCampaigns.createdAt)).limit(limit).offset(offset).all();
  const total = (conditions.length ? db.select().from(influencerCampaigns).where(and(...conditions)) : db.select().from(influencerCampaigns)).all().length;
  return { items, total };
}

export function updateInfluencerCampaign(id: string, data: Partial<{
  influencerName: string; status: 'prospecting' | 'negotiating' | 'active' | 'completed' | 'cancelled';
  deliverables: string; agreedFee: number; contactEmail: string;
  audienceFitScore: number; campaignFeedbackNotes: string;
}>) {
  db.update(influencerCampaigns).set({ ...data, updatedAt: new Date() }).where(eq(influencerCampaigns.id, id)).run();
}

export function deleteInfluencerCampaign(id: string) {
  db.delete(influencerCampaigns).where(eq(influencerCampaigns.id, id)).run();
}
