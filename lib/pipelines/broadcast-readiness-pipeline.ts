import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getBroadcastById } from '@/lib/db/broadcast-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface BroadcastReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; broadcastId: string | null }

// Real, deterministic launch-readiness score. This is a real gap this
// pipeline exists to catch: launchBroadcast() (lib/db/broadcast-queries.ts)
// has no guard today -- it will happily flip a broadcast to "sending"
// with no audience configured or no sender profile set, silently sending
// to nobody or failing at send time. Writes to the real,
// previously-unused broadcasts.readiness_score field.
//   htmlContent substantial (50+ chars)                          25
//   subject substantial (5-100 chars)                            20
//   audience configured (audienceType='all', or audienceId set)  25
//   sender profile configured (profileId set)                    20
//   throttlePerMinute sane (1-500)                                10
export async function runBroadcastReadinessPipeline(params: { broadcastId: string; triggeredBy?: string | null }): Promise<BroadcastReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'broadcasts', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const broadcast = getBroadcastById(params.broadcastId);
  if (!broadcast) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'broadcast not found' });
    return { runId, stages, score: 0, broadcastId: null };
  }

  const htmlLen = (broadcast.htmlContent || '').trim().length;
  const htmlScore = htmlLen >= 50 ? 25 : 0;
  stages.push({ stage: 'html_content_check', input: `${htmlLen} chars`, process: 'Score 25 if htmlContent is 50+ chars', output: htmlScore, status: 'ok' });

  const subjectLen = broadcast.subject.length;
  const subjectScore = subjectLen >= 5 && subjectLen <= 100 ? 20 : 0;
  stages.push({ stage: 'subject_check', input: `${subjectLen} chars`, process: 'Score 20 if subject is 5-100 chars', output: subjectScore, status: 'ok' });

  const audienceConfigured = broadcast.audienceType === 'all' || !!broadcast.audienceId;
  const audienceScore = audienceConfigured ? 25 : 0;
  stages.push({ stage: 'audience_check', input: { audienceType: broadcast.audienceType, audienceId: broadcast.audienceId }, process: "Score 25 if audienceType='all' or a specific audienceId is set (launchBroadcast() has no guard against an unset audience today)", output: audienceScore, status: 'ok' });

  const profileScore = broadcast.profileId ? 20 : 0;
  stages.push({ stage: 'sender_profile_check', input: broadcast.profileId, process: 'Score 20 if a sender profile (profileId) is set', output: profileScore, status: 'ok' });

  const throttle = broadcast.throttlePerMinute ?? 0;
  const throttleScore = throttle >= 1 && throttle <= 500 ? 10 : 0;
  stages.push({ stage: 'throttle_check', input: throttle, process: 'Score 10 if throttlePerMinute is between 1 and 500', output: throttleScore, status: 'ok' });

  const totalScore = htmlScore + subjectScore + audienceScore + profileScore + throttleScore;
  db.update(schema.broadcasts).set({ readinessScore: totalScore }).where(eq(schema.broadcasts.id, params.broadcastId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update broadcasts.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, broadcastId: params.broadcastId };
}
