import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { getVideoProjectById } from '@/lib/db/video-project-queries';
import { runRepurposingCoveragePipeline, type RepurposingCoverageResult } from '@/lib/pipelines/video-clip-plan-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface VideoRepurposingIdeaResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  coverage: RepurposingCoverageResult;
  ideas: string | null;
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

// Real Ollama-backed clip-idea drafter. Crucially, this agent has NO
// access to the actual video content -- no transcript, no frame
// analysis, no real video-processing integration exists anywhere in
// this codebase. It is grounded strictly in the source project's own
// real metadata (title, strategy notes, duration, existing clip-plan
// coverage) and is explicitly instructed to suggest THEMES/timestamp
// ranges as ideas for a human editor to verify against the actual
// footage -- never to claim it watched or heard the video.
// Fabrication-guard applied since this is open-ended generation.
export async function runVideoRepurposingIdeaAgent(params: { sourceProjectId: string; triggeredBy?: string | null }): Promise<VideoRepurposingIdeaResult> {
  const agentRole = 'video_repurposing_idea_drafter';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'video_editing',
    operationName: 'agentic_repurposing_ideas',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to suggest real, verifiable clip-idea themes for a source video using only its real metadata (title, strategy notes, duration, existing coverage) -- never claiming to have watched the actual footage (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a video-repurposing planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const coverage = await runRepurposingCoveragePipeline({ sourceProjectId: params.sourceProjectId, triggeredBy: params.triggeredBy });
    const source = getVideoProjectById(params.sourceProjectId);
    const searchOutput = coverage.sourceProjectId === null
      ? 'Source project not found.'
      : `Source: "${source?.title}" (${source?.durationSeconds ?? 'duration not set'}s). ${coverage.clipCount} clip plan(s) already exist, covering ${coverage.totalClipSeconds}s${coverage.coverageRatio !== null ? ` (${Math.round(coverage.coverageRatio * 100)}% of the source)` : ''}. Strategy notes: ${source?.strategyNotes || '(none entered)'}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'load real source metadata + real clip coverage', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'load real source metadata + real clip coverage', output: searchOutput, tokensUsed: 0 });

    let ideas: string | null = null;
    let fabricationWarning = false;
    if (coverage.sourceProjectId) {
      const actInput = `Real source video metadata:\n${searchOutput}\n\nSuggest 2-3 possible clip themes (a short title + a rough timestamp range guess, clearly labeled as a suggestion to verify against the actual footage) that could make good short-form repurposed clips, based only on the title and strategy notes above. You have NOT watched the video -- explicitly say these are ideas for a human editor to confirm. Do not invent specific quotes, statistics, or claims about what is said in the video.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a video-repurposing idea assistant. You have not watched the source video -- never claim specific content, quotes, or statistics from it. Suggest only general themes based on the metadata given, explicitly framed as unverified ideas for a human editor to check.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      ideas = fabricationWarning
        ? `[AI GENERATION WARNING: this draft may reference specific figures not present in the real source metadata. Verify before creating a real clip plan from it.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'Source project not found.';
      logStep(runId, stepIndex++, 'act', agentRole, 'source not found', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'source not found', output: noDataMsg, tokensUsed: 0 });
      ideas = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No clip plan created -- ideas are advisory only', 'Admin must review and manually create a real clip plan via the Manual tab if they approve an idea', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No clip plan created -- ideas are advisory only', output: 'Admin must review and manually create a real clip plan via the Manual tab if they approve an idea', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { clipCount: coverage.clipCount, ideas }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, coverage, ideas, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
