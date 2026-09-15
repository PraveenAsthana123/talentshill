import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface RecordFindingInput {
  pageUrl: string;
  frictionType: 'slow_load' | 'confusing_cta' | 'broken_form' | 'unclear_pricing' | 'mobile_unusable' | 'trust_signal_missing' | 'other';
  severity: number;
  description: string;
  observedBy?: string;
}

export function recordFinding(input: RecordFindingInput): string {
  if (input.severity < 1 || input.severity > 5) throw new Error('severity must be 1-5');
  if (!input.pageUrl.trim()) throw new Error('pageUrl is required');
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.croFrictionFinding).values({
    id, pageUrl: input.pageUrl, frictionType: input.frictionType, severity: input.severity,
    description: input.description, status: 'open', observedAt: now, observedBy: input.observedBy ?? null, createdAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'cro_friction_engine',
    claimClass: 'fact',
    claimText: `Real CRO friction finding on ${input.pageUrl}: ${input.frictionType} (severity ${input.severity}) -- ${input.description}`,
    sourceRef: `cro_friction_finding:${id}`,
    sourceTable: 'cro_friction_finding',
    confidence: 'high',
    createdBy: input.observedBy ?? 'admin',
  });
  return id;
}

export function markFixed(id: string): void {
  db.update(schema.croFrictionFinding).set({ status: 'fixed', fixedAt: new Date() }).where(eq(schema.croFrictionFinding.id, id)).run();
}

// Pure: 100 minus a real weighted penalty per open finding (severity^1.5,
// disclosed hardcoded formula so a single severity-5 finding hurts more
// than five severity-1 findings), floored at 0. A page with zero open
// findings scores 100, not null -- absence of logged friction is itself
// a real (if incomplete) signal, disclosed as such.
export function computeConversionReadinessScore(openSeverities: number[]): number {
  const penalty = openSeverities.reduce((sum, s) => sum + Math.pow(s, 1.5) * 3, 0);
  return Math.max(0, Math.round((100 - penalty) * 10) / 10);
}

export function getReadinessSummary() {
  const rows = db.select().from(schema.croFrictionFinding).all();
  const open = rows.filter((r) => r.status === 'open');
  return {
    totalFindings: rows.length,
    openFindings: open.length,
    fixedFindings: rows.length - open.length,
    readinessScore: computeConversionReadinessScore(open.map((r) => r.severity)),
  };
}
