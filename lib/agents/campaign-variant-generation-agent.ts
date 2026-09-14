import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getCampaignById, createCampaignVariant, getCampaignVariants } from '@/lib/db/campaign-queries';
import { getTemplateById, createTemplate } from '@/lib/db/template-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { containsSuspiciousStatistics } from './fabrication-guard';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface CampaignVariantGenerationResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  campaignId: string | null;
  variantBSubject: string | null;
  variantBTemplateId: string | null;
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

// Generates a real A/B variant B (alternate subject + alternate body,
// saved as a new email_templates row and a real campaign_variants row --
// this is what actually wires up the campaign wizard's previously-dead
// "Enable A/B Test" UI to real data). Grounded in the campaign's own
// name/existing subject/template, not invented from nothing. Same
// fabrication-detection backstop as content-generation-agent, since this
// is open-ended creative writing, not narration of already-computed
// numbers -- prompting alone was proven insufficient for this model size
// on this task class (live-verified in the AI Content Factory use case).
export async function runCampaignVariantGenerationAgent(params: { campaignId: string; triggeredBy?: string | null }): Promise<CampaignVariantGenerationResult> {
  const agentRole = 'campaign_variant_writer';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'campaigns',
    operationName: 'agentic_generate_variant_b',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const campaign = getCampaignById(params.campaignId);
  if (!campaign) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'campaign not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, campaignId: null, variantBSubject: null, variantBTemplateId: null, fabricationWarning: false };
  }

  try {
    const originalTemplate = campaign.templateId ? getTemplateById(campaign.templateId) : null;
    const originalSubject = campaign.subject || originalTemplate?.subject || '(no subject set)';

    const planInput = `Campaign "${campaign.name}", current subject: "${originalSubject}". Plan how to draft an A/B test variant B (alternate subject + alternate body angle) (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are an email A/B-test planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const searchOutput = originalTemplate
      ? `Original template found: "${originalTemplate.name}", body length ${originalTemplate.htmlContent.length} chars`
      : 'No template attached to this campaign -- will draft variant B body from the campaign name/subject only';
    logStep(runId, stepIndex++, 'search', agentRole, campaign.templateId || '(none)', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: campaign.templateId || '(none)', output: searchOutput, tokensUsed: 0 });

    const actInput = `Campaign name: "${campaign.name}"\nVariant A subject: "${originalSubject}"\n${originalTemplate ? `Variant A body (for reference, write a DIFFERENT angle, not a copy):\n${originalTemplate.htmlContent.slice(0, 800)}\n` : ''}\nWrite a variant B for A/B testing: a different subject line (under 60 characters) and a different email body taking a distinct angle (e.g. benefit-led vs. urgency-led vs. question-led). Do NOT use any specific percentage numbers, dollar figures, named customers, or dates. Use the merge variable {{firstName}} somewhere in the body for personalization.\n\nRespond in exactly this format:\nSUBJECT: <subject line>\nBODY:\n<body html or text>`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are an email marketing copywriter running an A/B test. Never invent specific statistics, percentages, dollar figures, named customers, or dates.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    const subjectMatch = actResult.content.match(/SUBJECT:\s*(.+)/i);
    const bodyMatch = actResult.content.match(/BODY:\s*([\s\S]+)/i);
    const variantSubject = (subjectMatch?.[1] || `${originalSubject} (Variant B)`).trim();
    const variantBody = (bodyMatch?.[1] || actResult.content).trim();
    const fabricationWarning = containsSuspiciousStatistics(actResult.content);

    const finalBody = fabricationWarning
      ? `<!-- AI GENERATION WARNING: this variant may contain fabricated statistics/figures despite instructions not to. Verify every number before launch. -->\n${variantBody}`
      : variantBody;

    const variantTemplateId = createTemplate({
      name: `${campaign.name} - Variant B (AI-generated)`,
      category: 'email_copy',
      subject: variantSubject,
      htmlContent: finalBody,
      variables: ['firstName'],
    });

    const existingVariants = getCampaignVariants(params.campaignId);
    if (!existingVariants.some((v) => v.name === 'A')) {
      createCampaignVariant(params.campaignId, { name: 'A', subject: originalSubject, templateId: campaign.templateId || undefined, percentage: 50 });
    }
    createCampaignVariant(params.campaignId, { name: 'B', subject: variantSubject, templateId: variantTemplateId, percentage: 50 });

    db.update(schema.campaigns).set({ updatedAt: new Date() }).where(eq(schema.campaigns.id, params.campaignId)).run();

    const executeOutput = fabricationWarning
      ? `Variant B created (template ${variantTemplateId}). WARNING: generated text contains a number pattern despite the prompt forbidding it -- flagged in the body for the reviewer.`
      : `Variant B created (template ${variantTemplateId}). No numeric-statistic pattern detected.`;
    logStep(runId, stepIndex++, 'execute', agentRole, `Created campaign_variants B + email_templates ${variantTemplateId}`, executeOutput, 0);
    steps.push({ phase: 'execute', agentRole, input: `Created campaign_variants B + email_templates ${variantTemplateId}`, output: executeOutput, tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { campaignId: params.campaignId, variantSubject, variantTemplateId, fabricationWarning }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, campaignId: params.campaignId, variantBSubject: variantSubject, variantBTemplateId: variantTemplateId, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
