import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface CreatePartnerInput {
  partnerName: string;
  partnerType: 'technology' | 'agency' | 'referral' | 'co_marketing' | 'reseller' | 'other';
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  createdBy?: string;
}

export function createPartner(input: CreatePartnerInput): string {
  if (!input.partnerName.trim()) throw new Error('partnerName is required');
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.businessPartner).values({
    id, partnerName: input.partnerName, partnerType: input.partnerType, relationshipStatus: 'prospecting',
    contactName: input.contactName ?? null, contactEmail: input.contactEmail ?? null, notes: input.notes ?? null,
    createdBy: input.createdBy ?? null, createdAt: now, updatedAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'partner_ecosystem',
    claimClass: 'fact',
    claimText: `Real partner tracked: ${input.partnerName} (${input.partnerType}), status=prospecting.`,
    sourceRef: `business_partner:${id}`,
    sourceTable: 'business_partner',
    confidence: 'high',
    createdBy: input.createdBy ?? 'admin',
  });
  return id;
}

export function updatePartnerStatus(id: string, status: 'prospecting' | 'active' | 'inactive'): void {
  const now = new Date();
  db.update(schema.businessPartner).set({ relationshipStatus: status, updatedAt: now, startedAt: status === 'active' ? now : undefined }).where(eq(schema.businessPartner.id, id)).run();
}

export function getPartners() {
  return db.select().from(schema.businessPartner).all();
}

export function getPartnerSummary() {
  const rows = getPartners();
  const byStatus: Record<string, number> = {};
  for (const r of rows) byStatus[r.relationshipStatus] = (byStatus[r.relationshipStatus] ?? 0) + 1;
  return { total: rows.length, byStatus };
}
