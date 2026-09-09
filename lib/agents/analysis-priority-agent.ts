import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getAssessmentById } from '@/lib/db/analysis-assessment-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runAnalysisHealthPipeline } from '@/lib/pipelines/analysis-health-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface AnalysisAgentResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; assessmentId: string | null; recommendation: string | null }

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real single-agent assessment-priority loop. "Search" reuses the real
// health pipeline (completion % + recency, never a quality judgment on
// the assessor's own overallScore). "Act" drafts a real, grounded
// recommendation on whether this assessment needs attention -- advisory
// only, never edits item scores or completes the assessment itself.
export async function runAnalysisPriorityAgent(params: { assessmentId: string; triggeredBy?: string | null }): Promise<AnalysisAgentResult> {
  const agentRole = 'analysis_priority_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'analysis', operationName: 'agentic_priority_recommendation', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const assessment = getAssessmentById(params.assessmentId);
  if (!assessment) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'assessment not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, assessmentId: null, recommendation: null };
  }

  try {
    const planInput = `Analysis assessment "${assessment.projectName}" (status: ${assessment.status}, ${assessment.completedItems}/${assessment.totalItems} items scored). Plan how to recommend whether this assessment needs attention (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an assessment-prioritization planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const health = await runAnalysisHealthPipeline({ assessmentId: params.assessmentId, triggeredBy: params.triggeredBy });
    const searchOutput = `Health score: ${health.score}/100 (completion + recency). Status: ${assessment.status}.`;
    logStep(runId, stepIndex++, 'search', agentRole, params.assessmentId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.assessmentId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Assessment: project="${assessment.projectName}", status=${assessment.status}, completedItems=${assessment.completedItems}/${assessment.totalItems}, overallScore=${assessment.overallScore ?? 'not set'}, health score=${health.score}/100. In 1-2 sentences, recommend whether this needs attention and why. Never invent facts not given.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an assessment-prioritization advisor. Never invent facts about the assessment not given to you.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    logStep(runId, stepIndex++, 'execute', agentRole, 'No assessment edit beyond the health score already written', 'Recommendation is advisory only, not applied', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No assessment edit beyond the health score already written', output: 'Recommendation is advisory only, not applied', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { assessmentId: params.assessmentId, score: health.score, recommendation: actResult.content }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, assessmentId: params.assessmentId, recommendation: actResult.content };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    throw err;
  }
}
