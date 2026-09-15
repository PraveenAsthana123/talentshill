import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

// Real, distinct calculators for the 3 methodologies whose math genuinely
// differs from the generic composite-score assessment engine. Every
// function is pure (unit-testable) plus a thin persist wrapper, same
// pattern as this session's other real deterministic engines.

// #1 -- Market Size Analysis (TAM/SAM/SOM). Pure: real percentage
// decomposition of a real admin-entered TAM. Throws on an impossible
// percentage (SAM/SOM can't exceed 100% of their parent), never silently
// clamps a bad input into a plausible-looking number.
export interface TamSamSomInput { tamDollars: number; samPercentOfTam: number; somPercentOfSam: number; }
export interface TamSamSomResult { tamDollars: number; samDollars: number; somDollars: number; }
export function calculateTamSamSom(input: TamSamSomInput): TamSamSomResult {
  if (input.tamDollars <= 0) throw new Error('tamDollars must be positive.');
  if (input.samPercentOfTam < 0 || input.samPercentOfTam > 100) throw new Error('samPercentOfTam must be 0-100.');
  if (input.somPercentOfSam < 0 || input.somPercentOfSam > 100) throw new Error('somPercentOfSam must be 0-100.');
  const samDollars = Math.round(input.tamDollars * (input.samPercentOfTam / 100));
  const somDollars = Math.round(samDollars * (input.somPercentOfSam / 100));
  return { tamDollars: input.tamDollars, samDollars, somDollars };
}

// #28 -- NPS Analysis. Pure: real (promoters - detractors) / total * 100,
// the industry-standard formula, disclosed. Null (not 0) with zero
// respondents -- absence of data isn't a real "worst possible" score.
export interface NpsInput { promoters: number; passives: number; detractors: number; }
export function calculateNps(input: NpsInput): number | null {
  const total = input.promoters + input.passives + input.detractors;
  if (total <= 0) return null;
  return Math.round(((input.promoters - input.detractors) / total) * 1000) / 10;
}

// #45 -- Van Westendorp Pricing Study. Pure: real median of each of the 4
// real respondent-entered price points. Requires at least 1 real
// respondent per question; a question with zero real answers throws
// rather than defaulting to 0 (a fabricated price point).
export interface VanWestendorpInput { tooCheap: number[]; cheap: number[]; expensive: number[]; tooExpensive: number[]; }
export interface VanWestendorpResult { medianTooCheap: number; medianCheap: number; medianExpensive: number; medianTooExpensive: number; acceptableRangeLow: number; acceptableRangeHigh: number; }
function median(nums: number[]): number {
  if (nums.length === 0) throw new Error('median requires at least one real value.');
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
export function calculateVanWestendorp(input: VanWestendorpInput): VanWestendorpResult {
  const medianTooCheap = median(input.tooCheap);
  const medianCheap = median(input.cheap);
  const medianExpensive = median(input.expensive);
  const medianTooExpensive = median(input.tooExpensive);
  // Disclosed convention: acceptable range = [median(cheap), median(expensive)],
  // the standard Van Westendorp "range of acceptable prices" reading.
  return { medianTooCheap, medianCheap, medianExpensive, medianTooExpensive, acceptableRangeLow: medianCheap, acceptableRangeHigh: medianExpensive };
}

type Calculator = 'tam_sam_som' | 'nps' | 'van_westendorp';
const METHODOLOGY_NUM: Record<Calculator, number> = { tam_sam_som: 1, nps: 28, van_westendorp: 45 };

export function persistCalculation(calculator: Calculator, subjectName: string, inputs: unknown, result: unknown, assessedBy: string): string {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.researchCalculation).values({
    id, methodologyNum: METHODOLOGY_NUM[calculator], subjectName,
    inputsJson: JSON.stringify(inputs), resultJson: JSON.stringify(result),
    assessedBy, assessedAt: now, createdAt: now,
  }).run();
  recordEvidence({
    moduleKey: 'research_catalog', claimClass: 'estimate',
    claimText: `Real ${calculator} calculation for "${subjectName}".`,
    sourceRef: `research_calculation:${id}`, sourceTable: 'research_calculation', confidence: 'medium', createdBy: assessedBy,
  });
  return id;
}

export function getCalculations(methodologyNum: number) {
  return db.select().from(schema.researchCalculation).where(eq(schema.researchCalculation.methodologyNum, methodologyNum)).orderBy(desc(schema.researchCalculation.assessedAt)).all();
}
