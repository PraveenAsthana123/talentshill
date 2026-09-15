import { randomUUID } from 'crypto';
import { desc, eq, and } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';

export type ClaimClass = 'fact' | 'estimate' | 'inference' | 'hypothesis' | 'unknown';
export type Confidence = 'low' | 'medium' | 'high';

export interface RecordEvidenceParams {
  moduleKey: string;
  claimClass: ClaimClass;
  claimText: string;
  sourceRef: string; // required, e.g. "contact_submissions:<id>"
  sourceTable?: string;
  confidence?: Confidence;
  observedAt?: Date;
  validUntil?: Date | null;
  createdBy?: string | null;
}

// Real, mandatory source traceability -- throws rather than silently
// accepting an evidence row nothing can be traced back to. Mirrors the
// same discipline as SohamYoga's EvidenceLedger.recordEvidence().
export function recordEvidence(params: RecordEvidenceParams): string {
  if (!params.sourceRef || !params.sourceRef.trim()) {
    throw new Error('recordEvidence requires a non-empty sourceRef -- every evidence row must be traceable to a real source.');
  }
  if (!params.claimText || !params.claimText.trim()) {
    throw new Error('recordEvidence requires non-empty claimText.');
  }
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.evidenceRecord).values({
    id,
    moduleKey: params.moduleKey,
    claimClass: params.claimClass,
    claimText: params.claimText,
    sourceRef: params.sourceRef,
    sourceTable: params.sourceTable ?? null,
    confidence: params.confidence ?? null,
    observedAt: params.observedAt ?? now,
    validUntil: params.validUntil ?? null,
    createdBy: params.createdBy ?? null,
    createdAt: now,
  }).run();
  return id;
}

export function listEvidence(params: { moduleKey?: string; claimClass?: ClaimClass; limit?: number } = {}) {
  const conditions = [];
  if (params.moduleKey) conditions.push(eq(schema.evidenceRecord.moduleKey, params.moduleKey));
  if (params.claimClass) conditions.push(eq(schema.evidenceRecord.claimClass, params.claimClass));
  const query = conditions.length
    ? db.select().from(schema.evidenceRecord).where(and(...conditions)).orderBy(desc(schema.evidenceRecord.observedAt))
    : db.select().from(schema.evidenceRecord).orderBy(desc(schema.evidenceRecord.observedAt));
  const rows = query.all();
  return params.limit ? rows.slice(0, params.limit) : rows;
}

// Real, computed from stored rows -- never fabricated. A module with zero
// evidence rows shows totalByClass: {} and staleCount: 0, not a padded
// summary claiming coverage that doesn't exist.
export function getEvidenceSummary(moduleKey?: string) {
  const rows = listEvidence({ moduleKey });
  const totalByClass: Record<string, number> = {};
  let stale = 0;
  const now = new Date();
  for (const r of rows) {
    totalByClass[r.claimClass] = (totalByClass[r.claimClass] ?? 0) + 1;
    if (r.validUntil && new Date(r.validUntil) < now) stale++;
  }
  return { total: rows.length, totalByClass, staleCount: stale };
}

export function isSourceRefValid(sourceRef: string): boolean {
  return !!sourceRef && sourceRef.includes(':') && sourceRef.split(':')[1].length > 0;
}
