import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ComposeReadinessResult { runId: string; logId: string; stages: ReadinessStageResult[]; score: number }

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Real, deterministic pre-send readiness score for a compose draft.
// Compose is a one-shot action with no persisted draft entity, so each
// run inserts a new row into the real email_compose_log table (audit
// trail for one-off sends) instead of updating a record in place.
//   recipient email format valid    25
//   subject 5-100 chars             25
//   html 20+ chars                  25
//   sender profile explicitly set (not "Default Profile")   25
export async function runComposeReadinessPipeline(params: { to: string; subject: string; html: string; profileId?: string; triggeredBy?: string | null }): Promise<ComposeReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'email_compose', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: { to: params.to, subject: params.subject }, triggeredBy: params.triggeredBy });

  const emailValid = EMAIL_PATTERN.test(params.to);
  const emailScore = emailValid ? 25 : 0;
  stages.push({ stage: 'recipient_check', input: params.to, process: 'Score 25 if the recipient is a valid email format', output: emailScore, status: 'ok' });

  const subjectLen = params.subject.length;
  const subjectScore = subjectLen >= 5 && subjectLen <= 100 ? 25 : 0;
  stages.push({ stage: 'subject_check', input: `${subjectLen} chars`, process: 'Score 25 if subject is 5-100 chars', output: subjectScore, status: 'ok' });

  const htmlLen = params.html.trim().length;
  const htmlScore = htmlLen >= 20 ? 25 : 0;
  stages.push({ stage: 'html_check', input: `${htmlLen} chars`, process: 'Score 25 if html is 20+ chars', output: htmlScore, status: 'ok' });

  const profileScore = params.profileId ? 25 : 0;
  stages.push({ stage: 'profile_check', input: params.profileId || 'Default Profile', process: 'Score 25 if a specific sender profile is explicitly selected (not the fallback default)', output: profileScore, status: 'ok' });

  const totalScore = emailScore + subjectScore + htmlScore + profileScore;
  const logId = randomUUID();
  db.insert(schema.emailComposeLog).values({
    id: logId,
    to: params.to,
    subject: params.subject,
    htmlLength: params.html.length,
    profileId: params.profileId || null,
    readinessScore: totalScore,
    sent: false,
    triggeredBy: params.triggeredBy || null,
    createdAt: new Date(),
  }).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Insert a new email_compose_log row (real, previously-unused table) with the pre-send readiness score', output: { logId, readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore, logId } });
  return { runId, logId, stages, score: totalScore };
}
