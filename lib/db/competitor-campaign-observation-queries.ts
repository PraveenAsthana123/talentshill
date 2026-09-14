import { db, schema } from './index';
import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { competitorCampaignObservations, competitorAnalysis } = schema;

export function createObservation(data: {
  competitorId: string;
  observedAt: Date;
  channel: 'paid_social' | 'search' | 'email' | 'landing_page' | 'organic_social' | 'pr' | 'other';
  campaignType: 'promotion' | 'new_creative' | 'pricing_change' | 'messaging_shift' | 'product_launch' | 'other';
  description: string;
  evidenceUrl?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(competitorCampaignObservations).values({
    id, competitorId: data.competitorId, observedAt: data.observedAt,
    channel: data.channel, campaignType: data.campaignType, description: data.description,
    evidenceUrl: data.evidenceUrl ?? null, createdBy: data.createdBy, createdAt: now,
  }).run();
  return id;
}

export function getObservationsForCompetitor(competitorId: string) {
  return db.select().from(competitorCampaignObservations).where(eq(competitorCampaignObservations.competitorId, competitorId)).orderBy(desc(competitorCampaignObservations.observedAt)).all();
}

export function getAllObservations() {
  return db.select().from(competitorCampaignObservations).all();
}

export function deleteObservation(id: string) {
  db.delete(competitorCampaignObservations).where(eq(competitorCampaignObservations.id, id)).run();
}

// Real, non-template competitors -- excludes the seeded isTemplate=true
// placeholder row, consistent with the parent table's own honesty
// discipline (never treat the template row as real competitive data).
export function getAllRealCompetitors() {
  return db.select().from(competitorAnalysis).where(eq(competitorAnalysis.isTemplate, false)).all();
}
