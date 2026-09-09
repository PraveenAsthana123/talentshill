import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getResponseById } from '@/lib/db/survey-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runSurveyOutreachPipeline } from '@/lib/pipelines/survey-outreach-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface SurveyAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; responseId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent outreach-recommendation loop. "Search" reuses the
// real outreach-priority pipeline. "Act" drafts a real, grounded
// recommendation for how sales/marketing should follow up -- never
// contacts the respondent, purely advisory text for a human.
export async function runSurveyOutreachAgent(params: { responseId: string; triggeredBy?: string | null }): Promise<SurveyAgentResult> {
  const agentRole = 'survey_outreach_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'survey', operationName: 'agentic_outreach_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const response = getResponseById(params.responseId);
  if (!response) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'response not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, responseId: null, recommendation: null };
  }

  try {
    const planInput = `Survey respondent from ${response.company || 'unknown company'}, maturity level: ${response.maturityLevel}, score: ${response.totalScore}/100. Plan how to recommend a follow-up approach (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a survey follow-up planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const outreach = await runSurveyOutreachPipeline({ responseId: params.responseId, triggeredBy: params.triggeredBy });
    const searchOutput = `Outreach priority score: ${outreach.score}/100`;
    logStep(runId, stepIndex++, 'search', agentRole, params.responseId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.responseId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Respondent: company=${response.company || 'unknown'}, industry=${response.industry || 'unknown'}, maturity=${response.maturityLevel}, score=${response.totalScore}/100, has email=${!!response.email}, outreach priority=${outreach.score}/100. In 1-2 sentences, recommend the follow-up approach. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a survey follow-up advisor. Never invent facts about the respondent not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No contact made beyond the priority score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No contact made beyond the priority score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { responseId: params.responseId, score: outreach.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, responseId: params.responseId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, responseId: null, recommendation: null };
  }
}
