import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface CompletenessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface ContactCompletenessResult { runId: string; stages: CompletenessStageResult[]; score: number; contactId: string | null }

// Real, deterministic data-quality + engagement-potential score for the
// contacts table's real-but-previously-unused leadScore field (confirmed
// via grep: displayed in the admin UI and CSV export, but nothing wrote
// a meaningful value to it before this). Max 100 points, grounded in
// actually-present fields, not invented signals:
//   name (first+last)     15
//   company               15
//   phone                 10
//   tags (non-empty)      15
//   high-intent source    25 (contact_form/survey/booking vs manual/import/newsletter)
//   active status         20
export function runContactCompletenessPipeline(params: { contactId: string; triggeredBy?: string | null }): ContactCompletenessResult {
  const stages: CompletenessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'contacts', operationName: 'pipeline_completeness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const contact = db.select().from(schema.contacts).where(eq(schema.contacts.id, params.contactId)).get();
  if (!contact) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'contact not found' });
    return { runId, stages, score: 0, contactId: null };
  }

  const nameScore = (contact.firstName && contact.lastName) ? 15 : 0;
  stages.push({ stage: 'name_check', input: { firstName: contact.firstName, lastName: contact.lastName }, process: 'Score 15 if both first and last name present', output: nameScore, status: 'ok' });

  const companyScore = contact.company ? 15 : 0;
  stages.push({ stage: 'company_check', input: contact.company, process: 'Score 15 if company present', output: companyScore, status: 'ok' });

  const phoneScore = contact.phone ? 10 : 0;
  stages.push({ stage: 'phone_check', input: contact.phone, process: 'Score 10 if phone present', output: phoneScore, status: 'ok' });

  let tagCount = 0;
  try { tagCount = JSON.parse(contact.tags || '[]').length; } catch { /* malformed, 0 */ }
  const tagScore = tagCount > 0 ? 15 : 0;
  stages.push({ stage: 'tags_check', input: `${tagCount} tags`, process: 'Score 15 if 1+ tags present', output: tagScore, status: 'ok' });

  const highIntentSources = ['contact_form', 'survey', 'booking'];
  const sourceScore = highIntentSources.includes(contact.source) ? 25 : 0;
  stages.push({ stage: 'source_check', input: contact.source, process: 'Score 25 if source is contact_form/survey/booking (higher-intent than manual/import/newsletter)', output: sourceScore, status: 'ok' });

  const statusScore = contact.status === 'active' ? 20 : 0;
  stages.push({ stage: 'status_check', input: contact.status, process: 'Score 20 if status is active (not unsubscribed/bounced/inactive)', output: statusScore, status: 'ok' });

  const totalScore = nameScore + companyScore + phoneScore + tagScore + sourceScore + statusScore;
  db.update(schema.contacts).set({ leadScore: totalScore }).where(eq(schema.contacts.id, params.contactId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update contacts.leadScore (real, previously-unused field)', output: { leadScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, contactId: params.contactId };
}
