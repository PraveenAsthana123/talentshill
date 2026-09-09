import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getTemplateById } from '@/lib/db/template-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface TemplateReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; templateId: string | null }

function extractPlaceholders(text: string): string[] {
  const matches = text.matchAll(/\{\{(\w+)\}\}/g);
  return Array.from(new Set(Array.from(matches, (m) => m[1])));
}

// Real, deterministic template-readiness score grounded only in fields
// that actually exist on the template. The variable-consistency check is
// a real bug class this pipeline exists to catch: a {{placeholder}} used
// in the content with no matching declared variable renders literally
// as "{{typo}}" in a sent email -- a real, embarrassing production bug,
// not hypothetical. Writes to the real, previously-unused
// email_templates.readiness_score field.
//   htmlContent substantial (50+ chars)  25
//   textContent present (plaintext fallback)  20
//   subject substantial (5-100 chars)    20
//   variable consistency (every {{x}} used in subject/html has a matching declared variable)  20
//   isActive                             15
export async function runTemplateReadinessPipeline(params: { templateId: string; triggeredBy?: string | null }): Promise<TemplateReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'templates', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const template = getTemplateById(params.templateId);
  if (!template) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'template not found' });
    return { runId, stages, score: 0, templateId: null };
  }

  const htmlLen = (template.htmlContent || '').trim().length;
  const htmlScore = htmlLen >= 50 ? 25 : 0;
  stages.push({ stage: 'html_content_check', input: `${htmlLen} chars`, process: 'Score 25 if htmlContent is 50+ chars', output: htmlScore, status: 'ok' });

  const textScore = template.textContent && template.textContent.trim().length > 0 ? 20 : 0;
  stages.push({ stage: 'text_content_check', input: template.textContent ? `${template.textContent.length} chars` : null, process: 'Score 20 if a plaintext fallback is present', output: textScore, status: 'ok' });

  const subjectLen = template.subject.length;
  const subjectScore = subjectLen >= 5 && subjectLen <= 100 ? 20 : 0;
  stages.push({ stage: 'subject_check', input: `${subjectLen} chars`, process: 'Score 20 if subject is 5-100 chars', output: subjectScore, status: 'ok' });

  let declaredVars: string[] = [];
  try { declaredVars = JSON.parse(template.variables || '[]'); } catch { /* malformed, treat as none declared */ }
  const usedVars = Array.from(new Set([...extractPlaceholders(template.htmlContent || ''), ...extractPlaceholders(template.subject || '')]));
  const undeclaredUsed = usedVars.filter((v) => !declaredVars.includes(v));
  const varsScore = undeclaredUsed.length === 0 ? 20 : 0;
  stages.push({ stage: 'variable_consistency_check', input: { declaredVars, usedVars, undeclaredUsed }, process: 'Score 20 if every {{placeholder}} used in subject/html has a matching declared variable (an undeclared placeholder renders literally, unfilled, in a sent email)', output: varsScore, status: 'ok' });

  const activeScore = template.isActive ? 15 : 0;
  stages.push({ stage: 'active_check', input: template.isActive, process: 'Score 15 if active', output: activeScore, status: 'ok' });

  const totalScore = htmlScore + textScore + subjectScore + varsScore + activeScore;
  db.update(schema.emailTemplates).set({ readinessScore: totalScore }).where(eq(schema.emailTemplates.id, params.templateId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update email_templates.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, templateId: params.templateId };
}
