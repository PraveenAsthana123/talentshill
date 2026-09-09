import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { runCampaignReadinessPipeline } from '@/lib/pipelines/campaign-readiness-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface CampaignAgentResult {
  runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number;
  campaignId: string | null; subjectSuggestions: string[] | null;
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
}

// Real agent that drafts subject-line suggestions -- never writes them to
// the campaign automatically (a human picks and applies one), and never
// launches a campaign itself. "Search" reuses the real readiness pipeline
// so the agent's suggestions are grounded in whether the campaign is
// actually launch-ready, not just its name/type.
export async function runCampaignSubjectAgent(params: { campaignId: string; triggeredBy?: string | null }): Promise<CampaignAgentResult> {
  const agentRole = 'campaign_copywriter';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'campaigns', operationName: 'agentic_subject_suggestions', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  const campaign = db.select().from(schema.campaigns).where(eq(schema.campaigns.id, params.campaignId)).get();
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, campaignId: null, subjectSuggestions: null };
  }

  try {
    const planInput = `Campaign "${campaign.name}" (type: ${campaign.type}, audience: ${campaign.audienceType || 'unspecified'}). Plan how to draft 3 subject line options (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an email-subject-line planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const readiness = runCampaignReadinessPipeline({ campaignId: params.campaignId, triggeredBy: params.triggeredBy });
    const searchOutput = `Readiness: ${readiness.ready ? 'ready' : 'not ready'}. Blockers: ${readiness.blockers.join(', ') || 'none'}`;
    logStep(runId, stepIndex++, 'search', agentRole, params.campaignId, searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: params.campaignId, output: searchOutput, tokensUsed: 0 });

    const actInput = `Draft 3 distinct subject line options (under 60 characters each) for this campaign: name="${campaign.name}", type=${campaign.type}, current subject="${campaign.subject || '(none set)'}". Output only the 3 options, one per line, no numbering or extra commentary.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an email marketing copywriter. Output exactly 3 subject lines, one per line, nothing else.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    const suggestions = actResult.content.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, 5);

    logStep(runId, stepIndex++, 'execute', agentRole, 'No DB write -- suggestions are advisory only', `${suggestions.length} suggestions generated, not applied`, 0);
    steps.push({ phase: 'execute', agentRole, input: 'No DB write -- suggestions are advisory only', output: `${suggestions.length} suggestions generated, not applied`, tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { campaignId: params.campaignId, suggestions }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, campaignId: params.campaignId, subjectSuggestions: suggestions };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    steps.push({ phase: 'complete', agentRole, input: '', output: `FAILED: ${err instanceof Error ? err.message : String(err)}`, tokensUsed: 0 });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, campaignId: null, subjectSuggestions: null };
  }
}
