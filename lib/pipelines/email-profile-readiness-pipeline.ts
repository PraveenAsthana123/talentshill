import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getProfileById, getSmtpForProfile } from '@/lib/db/email-profile-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ProfileReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; profileId: string | null }

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const XSS_PATTERNS = [/<script/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i];

// Real, deterministic send-readiness score for an email sender profile.
// The most important check (SMTP-linked, 35 pts) exists because of a
// real gap confirmed live while building Module 21 (Compose): a profile
// with no linked SMTP config silently falls back to process.env
// SMTP_HOST/USER/PASS at send time -- so a profile that looks fully
// configured in this UI can still send from unexpected credentials, or
// fail outright if no env fallback is set.
//   fromEmail valid format         25
//   replyTo valid format or empty  15
//   SMTP config linked             35
//   signature safe (no XSS pattern)  15
//   isActive                        10
export async function runEmailProfileReadinessPipeline(params: { profileId: string; triggeredBy?: string | null }): Promise<ProfileReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'email_profiles', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const profile = getProfileById(params.profileId);
  if (!profile) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'profile not found' });
    return { runId, stages, score: 0, profileId: null };
  }

  const fromEmailValid = EMAIL_PATTERN.test(profile.fromEmail);
  const fromEmailScore = fromEmailValid ? 25 : 0;
  stages.push({ stage: 'from_email_check', input: profile.fromEmail, process: 'Score 25 if fromEmail is a valid email format', output: fromEmailScore, status: 'ok' });

  const replyToValid = !profile.replyTo || EMAIL_PATTERN.test(profile.replyTo);
  const replyToScore = replyToValid ? 15 : 0;
  stages.push({ stage: 'reply_to_check', input: profile.replyTo, process: 'Score 15 if replyTo is empty or a valid email format', output: replyToScore, status: 'ok' });

  const smtpConfig = getSmtpForProfile(params.profileId);
  const smtpScore = smtpConfig ? 35 : 0;
  stages.push({ stage: 'smtp_linked_check', input: smtpConfig ? smtpConfig.name : null, process: 'Score 35 if a real SMTP config is linked (else this profile silently falls back to process.env vars at send time)', output: smtpScore, status: 'ok' });

  const sigHit = profile.signature ? XSS_PATTERNS.find((p) => p.test(profile.signature!)) : undefined;
  const sigScore = !sigHit ? 15 : 0;
  stages.push({ stage: 'signature_safety_check', input: profile.signature ? `${profile.signature.length} chars` : null, process: 'Score 15 if the signature has no <script>/javascript:/onX=/<iframe> pattern', output: sigScore, status: 'ok' });

  const activeScore = profile.isActive ? 10 : 0;
  stages.push({ stage: 'active_check', input: profile.isActive, process: 'Score 10 if active', output: activeScore, status: 'ok' });

  const totalScore = fromEmailScore + replyToScore + smtpScore + sigScore + activeScore;
  db.update(schema.emailProfiles).set({ readinessScore: totalScore }).where(eq(schema.emailProfiles.id, params.profileId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update email_profiles.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, profileId: params.profileId };
}
