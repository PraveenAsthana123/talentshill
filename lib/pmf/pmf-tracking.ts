import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export interface RecordPmfResponseInput {
  respondentEmail: string;
  howWouldYouFeel: 'very_disappointed' | 'somewhat_disappointed' | 'not_disappointed';
  mainBenefit?: string;
  whoWouldBenefit?: string;
}

export function recordPmfResponse(input: RecordPmfResponseInput): string {
  if (!input.respondentEmail.trim()) throw new Error('respondentEmail is required');
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.pmfSurveyResponse).values({
    id, respondentEmail: input.respondentEmail, howWouldYouFeel: input.howWouldYouFeel,
    mainBenefit: input.mainBenefit ?? null, whoWouldBenefit: input.whoWouldBenefit ?? null,
    respondedAt: now, createdAt: now,
  }).run();
  return id;
}

// Pure: the real Sean Ellis PMF metric -- % answering "very disappointed."
// 40%+ is the well-known industry threshold for a signal of real PMF.
// Null (not 0%) with zero real responses.
export function computePmfScore(veryDisappointedCount: number, total: number): { score: number | null; hasSignal: boolean } {
  if (total === 0) return { score: null, hasSignal: false };
  const score = Math.round((veryDisappointedCount / total) * 1000) / 10;
  return { score, hasSignal: score >= 40 };
}

export function getPmfSummary() {
  const rows = db.select().from(schema.pmfSurveyResponse).all();
  const veryDisappointed = rows.filter((r) => r.howWouldYouFeel === 'very_disappointed').length;
  const result = computePmfScore(veryDisappointed, rows.length);

  if (rows.length > 0) {
    recordEvidence({
      moduleKey: 'pmf_sean_ellis',
      claimClass: 'fact',
      claimText: `PMF Sean-Ellis score: ${result.score}% very disappointed (n=${rows.length}), ${result.hasSignal ? 'above' : 'below'} the 40% threshold.`,
      sourceRef: 'pmf_survey_response:pmf_aggregate',
      sourceTable: 'pmf_survey_response',
      confidence: rows.length >= 20 ? 'high' : rows.length >= 5 ? 'medium' : 'low',
      createdBy: 'system',
    });
  }
  return { totalResponses: rows.length, veryDisappointedCount: veryDisappointed, ...result };
}
