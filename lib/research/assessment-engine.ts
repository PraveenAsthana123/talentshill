import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface DimensionScore { dimension: string; score: number; rationale: string; }

// Pure, unit-tested: real average of real admin-entered dimension scores.
// Empty input is a caller error (nothing to assess), not silently 0.
export function computeComposite(scores: DimensionScore[]): number {
  if (scores.length === 0) throw new Error('computeComposite requires at least one real dimension score.');
  const sum = scores.reduce((s, d) => s + d.score, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export function recordAssessment(params: { methodologyNum: number; subjectName: string; dimensionScores: DimensionScore[]; assessedBy: string }): string {
  if (!params.subjectName.trim()) throw new Error('subjectName is required.');
  for (const d of params.dimensionScores) {
    if (d.score < 0 || d.score > 100) throw new Error(`Dimension "${d.dimension}" score must be 0-100, got ${d.score}.`);
  }
  const methodology = db.select().from(schema.researchMethodologyCatalog).where(eq(schema.researchMethodologyCatalog.num, params.methodologyNum)).get();
  if (!methodology) throw new Error(`No real methodology #${params.methodologyNum} in the catalog.`);

  const compositeScore = computeComposite(params.dimensionScores);
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.researchAssessment).values({
    id, methodologyNum: params.methodologyNum, subjectName: params.subjectName,
    dimensionScores: JSON.stringify(params.dimensionScores), compositeScore,
    assessedBy: params.assessedBy, assessedAt: now, createdAt: now,
  }).run();

  recordEvidence({
    moduleKey: 'research_catalog', claimClass: 'estimate',
    claimText: `Real ${methodology.name} assessment of "${params.subjectName}": composite score ${compositeScore}/100 across ${params.dimensionScores.length} real analyst-rated dimensions.`,
    sourceRef: `research_assessment:${id}`, sourceTable: 'research_assessment', confidence: 'medium', createdBy: params.assessedBy,
  });

  return id;
}

export function getAssessments(methodologyNum: number) {
  return db.select().from(schema.researchAssessment).where(eq(schema.researchAssessment.methodologyNum, methodologyNum)).orderBy(desc(schema.researchAssessment.assessedAt)).all();
}

export function getAssessmentCoverageSummary() {
  const rows = db.select().from(schema.researchAssessment).all();
  const byMethodology = new Map<number, number>();
  for (const r of rows) byMethodology.set(r.methodologyNum, (byMethodology.get(r.methodologyNum) ?? 0) + 1);
  return { totalAssessments: rows.length, methodologiesWithAtLeastOneRealAssessment: byMethodology.size };
}
