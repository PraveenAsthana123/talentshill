import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getAccountById } from '@/lib/db/integration-queries';
import { getLogCount } from '@/lib/db/integration-log-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';

export interface ReadinessStageResult { stage: string; input: unknown; process: string; output: unknown; status: 'ok' }
export interface AccountReadinessResult { runId: string; stages: ReadinessStageResult[]; score: number; accountId: string | null }

// Real, deterministic connection-readiness score for an integration
// account. Real gap this pipeline exists to catch: an account can sit
// at status='connected' having never had a real test run against it
// (Module 25's Manual "Test" action writes to integration_logs, but
// nothing required it before a manual status change) -- this check
// distinguishes "marked connected" from "actually verified."
//   credentials configured                 30
//   status is 'connected'                  30
//   no errorMessage recorded               20
//   1+ integration_logs entry exists       20
export async function runIntegrationAccountReadinessPipeline(params: { accountId: string; triggeredBy?: string | null }): Promise<AccountReadinessResult> {
  const stages: ReadinessStageResult[] = [];
  const runId = logOperationRun({ moduleKey: 'integrations', operationName: 'pipeline_readiness_score', executionMode: 'pipeline', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const account = getAccountById(params.accountId);
  if (!account) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'account not found' });
    return { runId, stages, score: 0, accountId: null };
  }

  const credsScore = account.credentials ? 30 : 0;
  stages.push({ stage: 'credentials_check', input: !!account.credentials, process: 'Score 30 if credentials are configured (never the credential value itself)', output: credsScore, status: 'ok' });

  const statusScore = account.status === 'connected' ? 30 : 0;
  stages.push({ stage: 'status_check', input: account.status, process: "Score 30 if status is 'connected'", output: statusScore, status: 'ok' });

  const errorScore = !account.errorMessage ? 20 : 0;
  stages.push({ stage: 'error_check', input: account.errorMessage, process: 'Score 20 if no errorMessage is recorded', output: errorScore, status: 'ok' });

  const logCount = getLogCount(params.accountId);
  const testedScore = logCount > 0 ? 20 : 0;
  stages.push({ stage: 'tested_check', input: `${logCount} integration_logs entries`, process: 'Score 20 if 1+ real test/action has been logged (distinguishes "marked connected" from "actually verified")', output: testedScore, status: 'ok' });

  const totalScore = credsScore + statusScore + errorScore + testedScore;
  db.update(schema.integrationAccounts).set({ readinessScore: totalScore }).where(eq(schema.integrationAccounts.id, params.accountId)).run();
  stages.push({ stage: 'write_score', input: { totalScore }, process: 'Update integration_accounts.readiness_score (real, previously-unused field)', output: { readinessScore: totalScore }, status: 'ok' });

  updateOperationRunStatus(runId, 'completed', { outputPayload: { score: totalScore } });
  return { runId, stages, score: totalScore, accountId: params.accountId };
}
