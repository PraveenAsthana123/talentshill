import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { runWebinarConversionPipeline, type WebinarConversionResult } from '@/lib/pipelines/webinar-pipeline-conversion-pipeline';
import { getWebinarById } from '@/lib/db/webinar-queries';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface WebinarFollowupAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  conversion: WebinarConversionResult;
  summary: string | null;
  fabricationWarning: boolean;
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex,
    phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete',
    agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Real Ollama-backed post-webinar recap -- runs the real conversion
// pipeline as its search step, then drafts a short recap for the sales
// team referencing only the real registration/attendance/pipeline
// numbers just computed. Never invents an attendee name, a specific
// engagement detail not in the real notes, or a statistic. Advisory
// only -- the pipeline itself (not this agent) is what actually writes
// to the leads pipeline.
export async function runWebinarFollowupAgent(params: { webinarId: string; triggeredBy?: string | null }): Promise<WebinarFollowupAgentResult> {
  const agentRole = 'webinar_followup_advisor';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'appointments',
    operationName: 'agentic_webinar_followup_recap',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to turn real webinar registration/attendance/pipeline-conversion numbers into a short recap for the sales team (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a webinar follow-up planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const conversion = await runWebinarConversionPipeline({ webinarId: params.webinarId, triggeredBy: params.triggeredBy });
    const webinar = getWebinarById(params.webinarId);
    const searchOutput = conversion.webinarId === null
      ? 'Webinar not found.'
      : `Webinar "${webinar?.title}": ${conversion.registrantCount} registered, ${conversion.attendedCount} attended, ${conversion.qualifiedCount} qualified into the leads pipeline (${conversion.pipelineLinked.filter((p) => p.created).length} new, ${conversion.pipelineLinked.filter((p) => !p.created).length} promoted existing).`;
    logStep(runId, stepIndex++, 'search', agentRole, 'run webinar conversion pipeline', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'run webinar conversion pipeline', output: searchOutput, tokensUsed: 0 });

    let summary: string | null = null;
    let fabricationWarning = false;
    if (conversion.webinarId && conversion.registrantCount > 0) {
      const actInput = `Real webinar outcome: ${searchOutput}\n\nWrite a 3-4 sentence recap for the sales team. Reference only these real numbers. Do not invent attendee names, specific engagement details, or any figure not given above.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a webinar follow-up advisor. Never invent names, engagement details, or numbers not given to you in the input.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      summary = fabricationWarning
        ? `[AI GENERATION WARNING: this recap may reference figures not present in the real pipeline output. Verify before acting on it.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = conversion.webinarId ? 'No registrants recorded for this webinar yet.' : 'Webinar not found.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no registrants', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no registrants', output: noDataMsg, tokensUsed: 0 });
      summary = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No pipeline write beyond what the conversion pipeline itself already performed', 'Recap is advisory only', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No pipeline write beyond what the conversion pipeline itself already performed', output: 'Recap is advisory only', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { qualifiedCount: conversion.qualifiedCount, summary }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, conversion, summary, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
