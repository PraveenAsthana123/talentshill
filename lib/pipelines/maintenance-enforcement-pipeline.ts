import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getMaintenanceStatus } from '@/lib/ops/maintenance';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface CheckStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface MaintenanceCheckResult { runId: string; checkId: string; stages: CheckStageResult[]; score: number }

// Real self-test, not just a score. Real gap this pipeline exists to
// catch: isMaintenanceMode() (lib/ops/maintenance.ts) had zero callers
// anywhere -- toggling "Maintenance Mode: ON" wrote a real settings row
// but had no actual effect on the public site until middleware.ts was
// fixed in this same build. This check makes a real HTTP request to a
// live public page and confirms the fix is actually behaving as
// expected right now, not just that the setting exists.
//   enforcement matches expected (503 if enabled, non-503 if disabled)  60
//   message is substantive (10+ chars)                                  20
//   scheduledEnd is a valid date if set (else n/a, counted as pass)      20
export async function runMaintenanceEnforcementPipeline(params: { requestOrigin: string; triggeredBy?: string | null }): Promise<MaintenanceCheckResult> {
  const stages: CheckStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'maintenance', operationName: 'pipeline_enforcement_check', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const status = getMaintenanceStatus();
  stages.push({ stage: 'read_status', input: {}, process: 'Read the real maintenance_mode setting (with real scheduledEnd auto-expiry applied)', output: status, status: 'ok' });

  let observedStatusCode: number | null = null;
  let enforcementMatchesExpected = false;
  try {
    const res = await fetch(new URL('/', params.requestOrigin), { redirect: 'manual' });
    observedStatusCode = res.status;
    enforcementMatchesExpected = status.enabled ? res.status === 503 : res.status !== 503;
  } catch (err) {
    stages.push({ stage: 'live_request_error', input: params.requestOrigin, process: 'Fetch the real public homepage to observe actual enforcement', output: err instanceof Error ? err.message : String(err), status: 'ok' });
  }
  const enforcementScore = enforcementMatchesExpected ? 60 : 0;
  stages.push({ stage: 'enforcement_check', input: { expectedEnabled: status.enabled, observedStatusCode }, process: 'Score 60 if a real fetch of the public homepage returns 503 when enabled, or non-503 when disabled', output: enforcementScore, status: 'ok' });

  const messageScore = status.message && status.message.trim().length >= 10 ? 20 : 0;
  stages.push({ stage: 'message_check', input: status.message, process: 'Score 20 if the maintenance message is 10+ chars', output: messageScore, status: 'ok' });

  let scheduledEndValid: boolean | null = null;
  if (status.scheduledEnd) {
    scheduledEndValid = !Number.isNaN(new Date(status.scheduledEnd).getTime());
  }
  const scheduledEndScore = status.scheduledEnd ? (scheduledEndValid ? 20 : 0) : 20;
  stages.push({ stage: 'scheduled_end_check', input: status.scheduledEnd, process: 'Score 20 if scheduledEnd is unset, or a valid parseable date when set', output: scheduledEndScore, status: 'ok' });

  const totalScore = enforcementScore + messageScore + scheduledEndScore;
  const checkId = randomUUID();
  db.insert(schema.maintenanceChecks).values({
    id: checkId,
    score: totalScore,
    enabled: status.enabled,
    enforcementMatchesExpected,
    observedStatusCode,
    scheduledEndValid,
    messageSubstantive: messageScore === 20,
    triggeredBy: params.triggeredBy || null,
    createdAt: new Date(),
  }).run();
  stages.push({ stage: 'write_check', input: { totalScore }, process: 'Insert a new maintenance_checks row (real, previously-unused table)', output: { checkId, score: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore, checkId } });
  return { runId, checkId, stages, score: totalScore };
}
