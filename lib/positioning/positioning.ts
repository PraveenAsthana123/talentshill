import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface PositioningInput {
  forWho: string;
  whoNeed: string;
  categoryName: string;
  keyBenefit: string;
  unlikeAlternative: string;
  differentiator: string;
  confirmedBy: string;
}

// Pure: real deterministic template rendering -- never LLM-generated.
export function renderPositioningStatement(input: Omit<PositioningInput, 'confirmedBy'>): string {
  return `For ${input.forWho} who ${input.whoNeed}, TalentsHill is a ${input.categoryName} that ${input.keyBenefit}. Unlike ${input.unlikeAlternative}, we ${input.differentiator}.`;
}

export function definePositioningStatement(input: PositioningInput): { id: string; text: string } {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.positioningStatement).values({
    id, forWho: input.forWho, whoNeed: input.whoNeed, categoryName: input.categoryName,
    keyBenefit: input.keyBenefit, unlikeAlternative: input.unlikeAlternative, differentiator: input.differentiator,
    confirmedBy: input.confirmedBy, confirmedAt: now, createdAt: now,
  }).run();

  const text = renderPositioningStatement(input);
  recordEvidence({
    moduleKey: 'positioning_statement',
    claimClass: 'fact', // a real, admin-authored statement, not inferred
    claimText: `Positioning statement defined: "${text}"`,
    sourceRef: `positioning_statement:${id}`,
    sourceTable: 'positioning_statement',
    confidence: 'high',
    createdBy: input.confirmedBy,
  });
  return { id, text };
}

export function getPositioningStatements() {
  return db.select().from(schema.positioningStatement).all().map((r) => ({ ...r, renderedText: renderPositioningStatement(r) }));
}
