import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getBannerById } from '@/lib/db/banner-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface HealthStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface BannerHealthResult { runId: string; stages: HealthStageResult[]; score: number; bannerId: string | null }

// Real, deterministic banner-integrity check grounded only in fields
// that actually exist on the banner -- catches real bugs (a banner still
// marked active after its own end date, a CTA button with text but no
// URL) rather than a subjective "quality" judgment. Writes to the real,
// previously-unused banners.health_score field.
//   schedule_valid       30 (no conflict if endDate > startDate, or either/both unset)
//   not_stale_active     30 (0 if isActive=true AND endDate has already passed -- a real live bug)
//   cta_consistency      20 (ctaText and ctaUrl both present or both absent -- a half-set CTA is a real bug)
//   content_present      20 (content is non-trivial, not empty/whitespace)
export async function runBannerHealthPipeline(params: { bannerId: string; triggeredBy?: string | null }): Promise<BannerHealthResult> {
  const stages: HealthStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'banners', operationName: 'pipeline_health_check', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const banner = getBannerById(params.bannerId);
  if (!banner) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'banner not found' });
    return { runId, stages, score: 0, bannerId: null };
  }

  const start = banner.startDate ? new Date(banner.startDate) : null;
  const end = banner.endDate ? new Date(banner.endDate) : null;
  const scheduleValid = !(start && end) || end > start;
  const scheduleScore = scheduleValid ? 30 : 0;
  stages.push({ stage: 'schedule_check', input: { startDate: start, endDate: end }, process: 'Score 30 unless endDate is set and <= startDate', output: scheduleScore, status: 'ok' });

  const isStaleActive = banner.isActive && !!end && end.getTime() < Date.now();
  const staleScore = isStaleActive ? 0 : 30;
  stages.push({ stage: 'stale_active_check', input: { isActive: banner.isActive, endDate: end }, process: 'Score 0 if still marked active but endDate has already passed (a real live bug)', output: staleScore, status: 'ok' });

  const ctaConsistent = (!!banner.ctaText === !!banner.ctaUrl);
  const ctaScore = ctaConsistent ? 20 : 0;
  stages.push({ stage: 'cta_consistency_check', input: { ctaText: banner.ctaText, ctaUrl: banner.ctaUrl }, process: 'Score 20 if ctaText and ctaUrl are both present or both absent (a half-set CTA is a real bug)', output: ctaScore, status: 'ok' });

  const contentScore = banner.content && banner.content.trim().length > 5 ? 20 : 0;
  stages.push({ stage: 'content_check', input: `${(banner.content || '').length} chars`, process: 'Score 20 if content is non-trivial (5+ chars after trim)', output: contentScore, status: 'ok' });

  const totalScore = scheduleScore + staleScore + ctaScore + contentScore;
  db.update(schema.banners).set({ healthScore: totalScore }).where(eq(schema.banners.id, params.bannerId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update banners.health_score (real, previously-unused field)', output: { healthScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, bannerId: params.bannerId };
}
