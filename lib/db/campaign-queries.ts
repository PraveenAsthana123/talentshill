import { randomUUID } from 'crypto';
import { eq, desc, and, sql } from 'drizzle-orm';
import { db, schema } from './index';

const { campaigns, campaignRecipients, campaignVariants } = schema;

export function getAllCampaigns() {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).all();
}

export function getCampaignById(id: string) {
  return db.select().from(campaigns).where(eq(campaigns.id, id)).get();
}

export function createCampaign(data: {
  name: string;
  type?: string;
  audienceType?: string;
  audienceId?: string;
  emailProfileId?: string;
  templateId?: string;
  subject?: string;
  throttlePerMinute?: number;
  createdBy?: string;
}) {
  const now = new Date();
  const id = randomUUID();
  db.insert(campaigns)
    .values({
      id,
      name: data.name,
      type: data.type ?? 'email',
      status: 'draft',
      audienceType: data.audienceType,
      audienceId: data.audienceId,
      emailProfileId: data.emailProfileId,
      templateId: data.templateId,
      subject: data.subject,
      throttlePerMinute: data.throttlePerMinute ?? 60,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function updateCampaign(id: string, data: {
  name?: string;
  audienceType?: string;
  audienceId?: string;
  audienceCount?: number;
  emailProfileId?: string;
  templateId?: string;
  subject?: string;
  status?: string;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  throttlePerMinute?: number;
}) {
  db.update(campaigns)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .run();
}

export function deleteCampaign(id: string) {
  db.delete(campaigns).where(eq(campaigns.id, id)).run();
}

export function updateCampaignCounters(id: string, field: string, increment: number = 1) {
  const campaign = getCampaignById(id);
  if (!campaign) return;

  const current = (campaign as Record<string, unknown>)[field] as number || 0;
  db.update(campaigns)
    .set({ [field]: current + increment, updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .run();
}

// ── Campaign Recipients ──

export function addCampaignRecipients(campaignId: string, contactIds: string[]) {
  for (const contactId of contactIds) {
    db.insert(campaignRecipients)
      .values({
        id: randomUUID(),
        campaignId,
        contactId,
        status: 'pending',
      })
      .onConflictDoNothing()
      .run();
  }
}

export function getCampaignRecipients(campaignId: string, options: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const { status, limit = 50, offset = 0 } = options;
  const conditions = [eq(campaignRecipients.campaignId, campaignId)];
  if (status) conditions.push(eq(campaignRecipients.status, status));

  return db
    .select()
    .from(campaignRecipients)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .all();
}

export function updateRecipientStatus(recipientId: string, status: string, extra?: {
  messageId?: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  error?: string;
}) {
  db.update(campaignRecipients)
    .set({ status, ...extra })
    .where(eq(campaignRecipients.id, recipientId))
    .run();
}

export function getCampaignRecipientCount(campaignId: string) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(campaignRecipients)
    .where(eq(campaignRecipients.campaignId, campaignId))
    .get();
  return result?.count ?? 0;
}

// ── Campaign Variants ──

export function getCampaignVariants(campaignId: string) {
  return db
    .select()
    .from(campaignVariants)
    .where(eq(campaignVariants.campaignId, campaignId))
    .all();
}

export function createCampaignVariant(campaignId: string, data: {
  name: string;
  subject?: string;
  templateId?: string;
  percentage?: number;
}) {
  const id = randomUUID();
  db.insert(campaignVariants)
    .values({
      id,
      campaignId,
      name: data.name,
      subject: data.subject,
      templateId: data.templateId,
      percentage: data.percentage ?? 50,
    })
    .run();
  return id;
}
