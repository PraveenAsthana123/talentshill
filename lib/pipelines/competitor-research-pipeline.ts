import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface PipelineStageResult {
  stage: string;
  input: unknown;
  process: string;
  output: unknown;
  status: 'ok' | 'skipped' | 'failed';
}

export interface PipelineRunResult {
  runId: string;
  stages: PipelineStageResult[];
  competitorAnalysisId: string | null;
}

// Real, deterministic pipeline for the Competitor Analysis module's
// Pipeline tab -- same underlying "create a draft competitor entry"
// operation as the Manual tab, run end-to-end without a human filling in
// each field. Honest scope: this automates what's mechanically fetchable
// (a competitor's own public page title/description) -- it does NOT
// generate pricing, strengths/weaknesses, or sample deliverables, since
// those require real qualitative judgment this pipeline can't fabricate.
// A human still needs to review and complete the draft (status stays
// needs_research).
export async function runCompetitorResearchPipeline(params: {
  serviceId: string;
  competitorName: string;
  competitorWebsite?: string;
  triggeredBy?: string | null;
}): Promise<PipelineRunResult> {
  const stages: PipelineStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'competitor_analysis',
    operationName: 'pipeline_research_competitor',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    // Stage 1: validate input against real data
    const service = db.select().from(schema.services).where(eq(schema.services.id, params.serviceId)).get();
    if (!service) {
      stages.push({ stage: 'validate_input', input: params, process: 'Check serviceId references a real service row', output: { error: 'service not found' }, status: 'failed' });
      updateOperationRunStatus(runId, 'failed', { errorMessage: 'serviceId does not reference a real service' });
      return { runId, stages, competitorAnalysisId: null };
    }
    stages.push({ stage: 'validate_input', input: params, process: 'Check serviceId references a real service row', output: { service: service.name }, status: 'ok' });

    // Stage 2: fetch the competitor's website, if given -- a real HTTP
    // request, not simulated. Extract only title + meta description via
    // simple regex (no headless browser / JS execution -- honest limit).
    let fetchedTitle: string | null = null;
    let fetchedDescription: string | null = null;
    if (params.competitorWebsite) {
      try {
        const res = await fetch(params.competitorWebsite, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TalentsHillResearchBot/1.0)' },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) {
          const html = await res.text();
          const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
          const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
          fetchedTitle = titleMatch ? titleMatch[1].trim().slice(0, 200) : null;
          fetchedDescription = descMatch ? descMatch[1].trim().slice(0, 500) : null;
          stages.push({
            stage: 'fetch_website',
            input: { url: params.competitorWebsite },
            process: 'Real HTTP GET, extract <title> and meta description via regex (no JS execution)',
            output: { httpStatus: res.status, title: fetchedTitle, description: fetchedDescription },
            status: 'ok',
          });
        } else {
          stages.push({ stage: 'fetch_website', input: { url: params.competitorWebsite }, process: 'Real HTTP GET', output: { httpStatus: res.status }, status: 'failed' });
        }
      } catch (err) {
        stages.push({ stage: 'fetch_website', input: { url: params.competitorWebsite }, process: 'Real HTTP GET', output: { error: err instanceof Error ? err.message : String(err) }, status: 'failed' });
      }
    } else {
      stages.push({ stage: 'fetch_website', input: null, process: 'No website provided, skipped', output: null, status: 'skipped' });
    }

    // Stage 3: create the draft entry -- status stays needs_research,
    // never auto-marked "researched" since a human hasn't reviewed it.
    const id = randomUUID();
    const now = new Date();
    const offeringSummary = fetchedDescription || (fetchedTitle ? `Page title: ${fetchedTitle}` : null);
    db.insert(schema.competitorAnalysis).values({
      id,
      serviceId: params.serviceId,
      competitorName: params.competitorName,
      competitorWebsite: params.competitorWebsite || null,
      offeringSummary,
      pricingNotes: null,
      strengthsWeaknesses: null,
      sampleDeliverables: null,
      status: 'needs_research',
      isTemplate: false,
      lastResearchedAt: null,
      researchedBy: null,
      createdAt: now,
      updatedAt: now,
    }).run();
    stages.push({
      stage: 'create_draft_entry',
      input: { offeringSummary },
      process: 'Insert competitor_analysis row, status stays needs_research (human review still required)',
      output: { competitorAnalysisId: id },
      status: 'ok',
    });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { competitorAnalysisId: id, stages: stages.length } });
    return { runId, stages, competitorAnalysisId: id };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err) });
    stages.push({ stage: 'pipeline_error', input: null, process: 'Unhandled error', output: { error: err instanceof Error ? err.message : String(err) }, status: 'failed' });
    return { runId, stages, competitorAnalysisId: null };
  }
}
