import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';
import { getAtRiskContacts } from '@/lib/db/re-engagement-queries';
import { computeDaysSince } from '@/lib/pipelines/re-engagement-trigger-pipeline';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ReEngagementMessageAgentResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  atRiskCount: number;
  avgDaysInactive: number | null;
  draftTemplate: string | null;
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

// Drafts a short, SMS/WhatsApp-appropriate re-engagement message
// template grounded only in real aggregate at-risk stats (count, avg
// days inactive) -- never a specific contact's name or PII, since the
// draft is a reusable template, not a per-contact message. This is the
// piece that was completely absent from the pre-existing broadcasts
// module: real generated copy for the genuinely new re-engagement
// feature, distinct from the pre-existing broadcast-readiness-agent.ts
// (which only advises on a manually-composed email's launch-readiness,
// never drafts content). Fabrication-guard applied -- open-ended
// generation, not narration of a single number set.
export async function runReEngagementMessageAgent(params: { triggeredBy?: string | null } = {}): Promise<ReEngagementMessageAgentResult> {
  const agentRole = 're_engagement_message_drafter';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'broadcasts',
    operationName: 'agentic_re_engagement_message_draft',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  try {
    const planInput = 'Plan how to draft a short, SMS/WhatsApp-appropriate re-engagement message template grounded only in real aggregate at-risk contact stats (max 2 steps).';
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a re-engagement messaging planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const atRisk = getAtRiskContacts();
    const now = new Date();
    const daysSinceList = atRisk.map((c) => computeDaysSince(c.lastEngagedAt, now)).filter((d): d is number => d !== null);
    const avgDaysInactive = daysSinceList.length > 0 ? Math.round(daysSinceList.reduce((s, d) => s + d, 0) / daysSinceList.length) : null;
    const searchOutput = `${atRisk.length} real contacts are currently at_risk. Average days since last engagement (where known): ${avgDaysInactive ?? 'unknown, no prior engagement recorded'}.`;
    logStep(runId, stepIndex++, 'search', agentRole, 'query real at-risk contact aggregate stats', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: 'query real at-risk contact aggregate stats', output: searchOutput, tokensUsed: 0 });

    let draftTemplate: string | null = null;
    let fabricationWarning = false;
    if (atRisk.length > 0) {
      const actInput = `Real context: ${searchOutput}\n\nDraft a short (under 200 characters) SMS/WhatsApp re-engagement message template for TalentsHill to send to at-risk contacts. Use the literal placeholder {{firstName}} where a name would go. Do NOT invent a specific discount, price, percentage, or offer -- write a genuine, qualitative invitation to reconnect. Respond with the message text only, no preamble.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a re-engagement messaging assistant. Never invent specific discounts, percentages, prices, or dates -- write a qualitative, genuine message only.' },
        { role: 'user', content: actInput },
      ]);
      logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
      steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
      totalTokens += actResult.totalTokens;

      fabricationWarning = containsSuspiciousStatistics(actResult.content);
      draftTemplate = fabricationWarning
        ? `[AI GENERATION WARNING: this draft may contain a fabricated discount/figure despite instructions not to. Verify before using.]\n\n${actResult.content}`
        : actResult.content;
    } else {
      const noDataMsg = 'No at-risk contacts right now -- nothing to draft a re-engagement message for.';
      logStep(runId, stepIndex++, 'act', agentRole, 'no at-risk contacts', noDataMsg, 0);
      steps.push({ phase: 'act', agentRole, input: 'no at-risk contacts', output: noDataMsg, tokensUsed: 0 });
      draftTemplate = noDataMsg;
    }

    logStep(runId, stepIndex++, 'execute', agentRole, 'No message queued -- draft is advisory only', 'Admin must review and paste into the Pipeline tab\'s message template before running the trigger', 0);
    steps.push({ phase: 'execute', agentRole, input: 'No message queued -- draft is advisory only', output: 'Admin must review and paste into the Pipeline tab\'s message template before running the trigger', tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { atRiskCount: atRisk.length, draftTemplate }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, atRiskCount: atRisk.length, avgDaysInactive, draftTemplate, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
