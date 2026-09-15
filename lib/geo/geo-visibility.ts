import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface RecordObservationInput {
  engine: 'chatgpt' | 'perplexity' | 'gemini' | 'copilot' | 'other';
  queryText: string;
  talentshillMentioned: boolean;
  mentionPosition?: number | null;
  competitorsAlsoMentioned?: string[];
  notes?: string;
  observedBy?: string;
}

export function recordObservation(input: RecordObservationInput): string {
  if (!input.queryText.trim()) throw new Error('queryText is required');
  if (input.talentshillMentioned && !input.mentionPosition) throw new Error('mentionPosition is required when talentshillMentioned is true');
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.geoMentionObservation).values({
    id, engine: input.engine, queryText: input.queryText, talentshillMentioned: input.talentshillMentioned,
    mentionPosition: input.mentionPosition ?? null,
    competitorsAlsoMentioned: input.competitorsAlsoMentioned ? JSON.stringify(input.competitorsAlsoMentioned) : null,
    notes: input.notes ?? null, observedAt: now, observedBy: input.observedBy ?? null, createdAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'geo_visibility',
    claimClass: 'fact', // a real admin-observed mention/non-mention on a specific real query
    claimText: `Real GEO observation (${input.engine}): "${input.queryText}" -- ${input.talentshillMentioned ? `mentioned at position ${input.mentionPosition}` : 'not mentioned'}.`,
    sourceRef: `geo_mention_observation:${id}`,
    sourceTable: 'geo_mention_observation',
    confidence: 'high',
    createdBy: input.observedBy ?? 'admin',
  });
  return id;
}

// Pure: real mention rate over real observations -- null (not 0%) with
// zero real observations.
export function computeMentionRate(mentioned: number, total: number): number | null {
  if (total === 0) return null;
  return Math.round((mentioned / total) * 1000) / 10;
}

export function getGeoVisibilitySummary() {
  const rows = db.select().from(schema.geoMentionObservation).all();
  const mentioned = rows.filter((r) => r.talentshillMentioned).length;
  const byEngine: Record<string, { total: number; mentioned: number }> = {};
  for (const r of rows) {
    byEngine[r.engine] ??= { total: 0, mentioned: 0 };
    byEngine[r.engine].total++;
    if (r.talentshillMentioned) byEngine[r.engine].mentioned++;
  }
  return { totalObservations: rows.length, mentionRate: computeMentionRate(mentioned, rows.length), byEngine };
}
