import { getWebinarById, getRegistrantsForWebinar, setRegistrantQualification } from '@/lib/db/webinar-queries';
import { createSubmission, updateSubmissionQualification, getSubmissionByEmail } from '@/lib/db/contact-queries';
import { classifyQualificationStage, resolveQualificationStageOnRescore } from '@/lib/contact/lead-qualification-stage';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface EngagementSignal { key: string; label: string; detected: boolean }
export interface AttendeeScoreResult { score: number; tier: 'hot' | 'warm' | 'cool' | 'cold'; signals: EngagementSignal[] }

// Pure, unit-tested. A no-show contributes nothing to the pipeline --
// engagement notes only mean something if the person actually attended.
// An attendee starts at 50, then real keyword-detected engagement
// signals in the admin's own notes (never an LLM guess) add up to 45
// more, same 4-tier convention already used by the leads module
// (lib/booking-utils.ts::getLeadTier: hot>=80, warm>=50, cool>=25).
const ENGAGEMENT_PATTERNS: { key: string; label: string; pattern: RegExp; points: number }[] = [
  { key: 'asked_question', label: 'Asked a question during the session', pattern: /\b(asked|question)\b/i, points: 15 },
  { key: 'requested_followup', label: 'Requested a demo/follow-up', pattern: /\b(demo|follow.?up|call me|reach out|contact me)\b/i, points: 20 },
  { key: 'stayed_engaged', label: 'Stayed engaged to the end / high engagement', pattern: /\b(stayed|full session|engaged throughout|until the end)\b/i, points: 15 },
];

export function computeAttendeeQualificationScore(attended: boolean | null, engagementNotes: string | null): AttendeeScoreResult {
  if (!attended) {
    return { score: 0, tier: 'cold', signals: ENGAGEMENT_PATTERNS.map((p) => ({ key: p.key, label: p.label, detected: false })) };
  }

  const notes = engagementNotes ?? '';
  const signals = ENGAGEMENT_PATTERNS.map((p) => ({ key: p.key, label: p.label, detected: p.pattern.test(notes) }));
  const engagementPoints = ENGAGEMENT_PATTERNS.reduce((sum, p, i) => sum + (signals[i].detected ? p.points : 0), 0);
  const score = Math.min(100, 50 + engagementPoints);

  const tier: 'hot' | 'warm' | 'cool' | 'cold' = score >= 80 ? 'hot' : score >= 50 ? 'warm' : score >= 25 ? 'cool' : 'cold';
  return { score, tier, signals };
}

export interface ConversionStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface WebinarConversionResult {
  runId: string;
  stages: ConversionStageResult[];
  webinarId: string | null;
  registrantCount: number;
  attendedCount: number;
  qualifiedCount: number;
  pipelineLinked: { registrantId: string; contactSubmissionId: string; created: boolean; qualificationStage: string }[];
}

// Real, deterministic. Scores every real registrant on a webinar by
// real attendance + real admin-entered engagement notes, then -- only
// for a real qualifying tier (warm or hot) -- creates or promotes a
// real row in the pre-existing leads pipeline (contactSubmissions),
// reusing the exact same qualification-stage machinery already built
// for the leads module (classifyQualificationStage,
// resolveQualificationStageOnRescore -- so a re-run of this pipeline
// can never demote an already-promoted lead). Cold/no-show registrants
// are never pushed into the pipeline.
export async function runWebinarConversionPipeline(params: { webinarId: string; triggeredBy?: string | null }): Promise<WebinarConversionResult> {
  const stages: ConversionStageResult[] = [];
  const runId = logOperationRun({
    moduleKey: 'appointments',
    operationName: 'pipeline_webinar_conversion',
    executionMode: 'pipeline',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const webinar = getWebinarById(params.webinarId);
  if (!webinar) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'webinar not found' });
    return { runId, stages, webinarId: null, registrantCount: 0, attendedCount: 0, qualifiedCount: 0, pipelineLinked: [] };
  }

  const registrants = getRegistrantsForWebinar(params.webinarId);
  const attendedCount = registrants.filter((r) => r.attended === true).length;
  stages.push({ stage: 'fetch_registrants', input: { webinarId: params.webinarId }, process: 'Load real registrants for this webinar', output: { registrantCount: registrants.length, attendedCount }, status: 'ok' });

  const pipelineLinked: WebinarConversionResult['pipelineLinked'] = [];
  let qualifiedCount = 0;

  for (const registrant of registrants) {
    const result = computeAttendeeQualificationScore(registrant.attended, registrant.engagementNotes);
    setRegistrantQualification(registrant.id, { qualificationScore: result.score, qualificationTier: result.tier });

    if (result.tier !== 'warm' && result.tier !== 'hot') continue;
    qualifiedCount++;

    const autoStage = classifyQualificationStage(result.tier);
    const existing = getSubmissionByEmail(registrant.email);
    if (existing) {
      const resolvedStage = resolveQualificationStageOnRescore(existing.qualificationStage as 'unqualified' | 'mql' | 'sql' | 'opportunity' | 'customer', autoStage);
      updateSubmissionQualification(existing.id, { qualificationStage: resolvedStage });
      setRegistrantQualification(registrant.id, { qualificationScore: result.score, qualificationTier: result.tier, contactSubmissionId: existing.id });
      pipelineLinked.push({ registrantId: registrant.id, contactSubmissionId: existing.id, created: false, qualificationStage: resolvedStage });
    } else {
      const submission = createSubmission({
        fullName: registrant.fullName,
        email: registrant.email,
        phone: registrant.phone ?? undefined,
        company: registrant.company || 'unknown',
        industry: 'unknown', // not collected at webinar registration -- honest placeholder, never fabricated
        interestAreas: [webinar.topic],
        projectStage: 'unknown',
        timeline: 'unknown',
        message: `Registered for webinar "${webinar.title}" (${webinar.topic}). Attended: yes.${registrant.engagementNotes ? ` Notes: ${registrant.engagementNotes}` : ''}`,
        consent: registrant.consent,
        leadScore: result.score,
        leadTier: result.tier,
        qualificationStage: autoStage,
        sourcePage: `webinar:${webinar.id}`,
      });
      setRegistrantQualification(registrant.id, { qualificationScore: result.score, qualificationTier: result.tier, contactSubmissionId: submission.id });
      pipelineLinked.push({ registrantId: registrant.id, contactSubmissionId: submission.id, created: true, qualificationStage: autoStage });
    }
  }

  stages.push({
    stage: 'score_and_convert',
    input: {},
    process: 'Score every real registrant (attended + real engagement notes), then create/promote a real leads-pipeline row for every real warm-or-hot registrant',
    output: { qualifiedCount, pipelineLinked: pipelineLinked.length },
    status: 'ok',
  });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { registrantCount: registrants.length, attendedCount, qualifiedCount } });
  return { runId, stages, webinarId: params.webinarId, registrantCount: registrants.length, attendedCount, qualifiedCount, pipelineLinked };
}
