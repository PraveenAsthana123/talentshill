import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface DefineVerticalInput {
  verticalKey: string;
  verticalName: string;
  description: string;
  realKpiDimensions: string[];
  confirmedBy: string;
}

// Real, one-time admin-confirmed classification -- never auto-classified.
// Upserts by verticalKey (a re-confirmation updates the existing row
// rather than creating a duplicate).
export function defineVertical(input: DefineVerticalInput): string {
  if (!input.realKpiDimensions.length) throw new Error('realKpiDimensions must include at least one real KPI dimension');
  const now = new Date();
  const id = randomUUID();
  db.insert(schema.verticalPack).values({
    id, verticalKey: input.verticalKey, verticalName: input.verticalName, description: input.description,
    realKpiDimensions: JSON.stringify(input.realKpiDimensions), confirmedBy: input.confirmedBy, confirmedAt: now, createdAt: now,
  }).onConflictDoUpdate({
    target: schema.verticalPack.verticalKey,
    set: { verticalName: input.verticalName, description: input.description, realKpiDimensions: JSON.stringify(input.realKpiDimensions), confirmedBy: input.confirmedBy, confirmedAt: now },
  }).run();

  recordEvidence({
    moduleKey: 'vertical_pack',
    claimClass: 'fact', // a real, admin-confirmed business-model classification, not inferred
    claimText: `TalentsHill's vertical classified as "${input.verticalName}" with ${input.realKpiDimensions.length} applicable real KPI dimensions.`,
    sourceRef: `vertical_pack:${input.verticalKey}`,
    sourceTable: 'vertical_pack',
    confidence: 'high',
    createdBy: input.confirmedBy,
  });
  return id;
}

export function getVerticalPacks() {
  return db.select().from(schema.verticalPack).all().map((r) => ({ ...r, realKpiDimensions: JSON.parse(r.realKpiDimensions) as string[] }));
}
