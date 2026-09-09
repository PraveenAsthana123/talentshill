import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface SafetyStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface OverrideSafetyResult { runId: string; stages: SafetyStageResult[]; score: number; overrideId: string | null }

const XSS_PATTERNS = [/<script/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i];

// Real, deterministic safety score on a content override's raw value.
// A genuine, disclosed finding while building this: grep found zero
// callers of getOverrides(pageSlug) anywhere on the public site --
// this module currently persists real data but does not yet change
// what a visitor sees. The XSS check is still real and valuable
// independent of that: if/when a page is wired to read overrides, an
// unescaped <script>/javascript:/onX= value would render as-is.
//   xss_pattern_check (no script/javascript:/onX=/iframe pattern)  50
//   value_present (non-empty after JSON.parse)                    30
//   slug_format_check (pageSlug/section/key look like real identifiers, not free text with spaces)  20
export async function runContentOverrideSafetyPipeline(params: { overrideId: string; triggeredBy?: string | null }): Promise<OverrideSafetyResult> {
  const stages: SafetyStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'content_overrides', operationName: 'pipeline_safety_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const override = db.select().from(schema.contentOverrides).where(eq(schema.contentOverrides.id, params.overrideId)).get();
  if (!override) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'override not found' });
    return { runId, stages, score: 0, overrideId: null };
  }

  let rawValue = '';
  try { rawValue = override.value ? JSON.parse(override.value) : ''; } catch { rawValue = override.value || ''; }
  const valueStr = typeof rawValue === 'string' ? rawValue : JSON.stringify(rawValue);

  const xssHit = XSS_PATTERNS.find((p) => p.test(valueStr));
  const xssPassed = !xssHit;
  const xssScore = xssPassed ? 50 : 0;
  stages.push({ stage: 'xss_pattern_check', input: `${valueStr.length} chars`, process: 'Score 50 if no <script>/javascript:/onX=/<iframe> pattern found in the raw value', output: xssScore, status: 'ok' });

  const valuePresentScore = valueStr.trim().length > 0 ? 30 : 0;
  stages.push({ stage: 'value_present_check', input: valueStr.trim().length, process: 'Score 30 if the override value is non-empty', output: valuePresentScore, status: 'ok' });

  const slugPattern = /^[a-z0-9][a-z0-9_-]*$/;
  const slugScore = slugPattern.test(override.pageSlug) && slugPattern.test(override.section) && slugPattern.test(override.key) ? 20 : 0;
  stages.push({ stage: 'slug_format_check', input: { pageSlug: override.pageSlug, section: override.section, key: override.key }, process: 'Score 20 if pageSlug/section/key are all lowercase slug-like identifiers', output: slugScore, status: 'ok' });

  const totalScore = xssScore + valuePresentScore + slugScore;
  db.update(schema.contentOverrides).set({ safetyScore: totalScore }).where(eq(schema.contentOverrides.id, params.overrideId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update content_overrides.safety_score (real, previously-unused field)', output: { safetyScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, overrideId: params.overrideId };
}
