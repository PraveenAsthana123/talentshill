import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getListById } from '@/lib/db/list-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runListSyncPipeline } from '@/lib/pipelines/list-sync-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ListSyncAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; listId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent list-health loop. "Search" reuses the real sync
// pipeline (which itself performs a real materialization, not just a
// read). "Act" drafts a real, grounded recommendation on segment-rule
// quality (e.g. 0 matches, suspiciously broad/narrow) -- advisory text
// only, never edits segment rules itself.
export async function runListSyncAgent(params: { listId: string; triggeredBy?: string | null }): Promise<ListSyncAgentResult> {
  const agentRole = 'list_sync_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'lists', operationName: 'agentic_sync_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const list = getListById(params.listId);
  if (!list) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'list not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, listId: null, recommendation: null };
  }

  try {
    const planInput = `List "${list.name}" (type: ${list.type}, current memberCount: ${list.memberCount}). Plan how to recommend a list-health improvement (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-list health planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const sync = await runListSyncPipeline({ listId: params.listId, triggeredBy: params.triggeredBy });
    const searchOutput = list.type === 'dynamic'
      ? `Sync result: +${sync.added} added, -${sync.removed} removed, final memberCount=${sync.finalMemberCount}.`
      : `Static list, no sync applicable. Current memberCount=${sync.finalMemberCount}.`;
    logStep(runId, stepIndex++, 'search', agentRole, params.listId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.listId, output: searchOutput, tokensUsed: 0 });

    const actInput = `List: name="${list.name}", type=${list.type}, finalMemberCount=${sync.finalMemberCount}${list.type === 'dynamic' ? `, this sync added ${sync.added} and removed ${sync.removed} members` : ''}. In 1-2 sentences, recommend the top list-health action (e.g. if memberCount is 0, if segment rules seem too broad/narrow). Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing-list health advisor. Never invent facts about the list not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No segment-rule edit beyond the real membership sync already performed', 'Recommendation is advisory only; the sync itself is real and already applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No segment-rule edit beyond the real membership sync already performed', output: 'Recommendation is advisory only; the sync itself is real and already applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { listId: params.listId, finalMemberCount: sync.finalMemberCount, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, listId: params.listId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
