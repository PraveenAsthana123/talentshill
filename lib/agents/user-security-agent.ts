import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getUserById } from '@/lib/db/admin-queries';
import { getUserRoles } from '@/lib/db/rbac-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runUserSecurityPipeline } from '@/lib/pipelines/user-security-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface UserAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; userId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent account-security advisory loop. "Search" reuses the
// real security-check pipeline. "Act" drafts a real, grounded fix
// recommendation -- never modifies the account itself, purely advisory
// text for a human admin.
export async function runUserSecurityAgent(params: { userId: string; triggeredBy?: string | null }): Promise<UserAgentResult> {
  const agentRole = 'user_security_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'users', operationName: 'agentic_security_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const user = getUserById(params.userId);
  if (!user) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'user not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, userId: null, recommendation: null };
  }

  try {
    const planInput = `Admin account "${user.name}" (active: ${user.isActive}). Plan how to recommend an account-security fix if needed (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an account-security planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const security = await runUserSecurityPipeline({ userId: params.userId, triggeredBy: params.triggeredBy });
    const roles = getUserRoles(params.userId);
    const failedChecks = security.stages.filter((s) => typeof s.output === 'number' && s.output === 0 && s.stage !== 'write_score').map((s) => s.stage);
    const searchOutput = `Security score: ${security.score}/100. Roles: ${roles.map((r) => r.name).join(', ') || 'none'}. Failed checks: ${failedChecks.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.userId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.userId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Account: name="${user.name}", active=${user.isActive}, roleCount=${roles.length}, roles=${roles.map((r) => r.name).join(', ') || 'none'}, security score=${security.score}/100, failed checks=${failedChecks.join(', ') || 'none'}. In 1-2 sentences, recommend the fix. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an account-security advisor. Never invent facts about the account not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No account edit beyond the security score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No account edit beyond the security score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { userId: params.userId, score: security.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, userId: params.userId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
