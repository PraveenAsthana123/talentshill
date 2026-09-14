import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { getTopicById, updateTopic } from '@/lib/db/content-topic-queries';
import { getPersonaById } from '@/lib/db/content-persona-queries';
import { createContent } from '@/lib/db/marketing-content-queries';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface ContentGenerationResult {
  runId: string;
  agentCount: number;
  steps: AgentStepRecord[];
  totalTokensUsed: number;
  topicId: string | null;
  generatedContentId: string | null;
  fabricationWarning: boolean;
}

// The system/user prompt below explicitly forbids inventing statistics
// or named-customer claims. Verified live 2026-09-14 that the local
// model (phi4-mini) does NOT reliably follow this instruction -- it
// fabricated specific percentages and invented a "TalentsHill customer"
// case study anyway. Prompting alone is not a sufficient safeguard for
// this model size, so this is a deterministic backstop: flag any
// generated draft containing a percentage or dollar figure so a human
// reviewer is explicitly warned, rather than trusting model compliance.
// This does not block generation (a human still reviews every draft
// before publish via the existing marketingContent status gate) -- it
// makes the specific risk visible instead of silent.
export function containsSuspiciousStatistics(text: string): boolean {
  return /\d+(\.\d+)?\s*%/.test(text) || /\$\s?\d/.test(text);
}

function logStep(runId: string, stepIndex: number, phase: string, agentRole: string, input: string, output: string, tokensUsed: number) {
  const now = new Date();
  db.insert(schema.agentExecutionStep).values({
    id: randomUUID(), runId, stepIndex,
    phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete',
    agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now,
  }).run();
}

// Unlike the readiness/ROI/sentiment agents elsewhere in this session,
// this agent's job IS to generate new content -- that is the legitimate
// use of a generative model, not "inventing facts." It is grounded only
// in real, admin-entered inputs (the topic title and persona
// description/tone), told explicitly not to fabricate product claims,
// statistics, or customer quotes, and always writes status='draft' --
// never auto-published. A human must review and publish, using the
// existing marketingContent publish flow untouched by this agent.
export async function runContentGenerationAgent(params: { topicId: string; triggeredBy?: string | null }): Promise<ContentGenerationResult> {
  const agentRole = 'content_factory_writer';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({
    moduleKey: 'content',
    operationName: 'agentic_content_generation',
    executionMode: 'agentic',
    status: 'running',
    inputPayload: params,
    triggeredBy: params.triggeredBy,
  });

  const topic = getTopicById(params.topicId);
  if (!topic) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: 'topic not found' });
    return { runId, agentCount: 1, steps, totalTokensUsed: 0, topicId: null, generatedContentId: null, fabricationWarning: false };
  }

  try {
    const persona = topic.personaId ? getPersonaById(topic.personaId) : null;

    const planInput = `Topic: "${topic.title}" (target type: ${topic.targetContentType}). Persona: ${persona ? persona.name : 'none specified'}. Plan how to draft this content (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a content-factory planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep(runId, stepIndex++, 'plan', agentRole, planInput, planResult.content, planResult.totalTokens);
    steps.push({ phase: 'plan', agentRole, input: planInput, output: planResult.content, tokensUsed: planResult.totalTokens });
    totalTokens += planResult.totalTokens;

    const searchOutput = persona
      ? `Persona found: "${persona.name}" -- ${persona.description}${persona.toneNotes ? ` (tone: ${persona.toneNotes})` : ''}`
      : 'No persona attached to this topic -- drafting generically.';
    logStep(runId, stepIndex++, 'search', agentRole, topic.personaId || '(none)', searchOutput, 0);
    steps.push({ phase: 'search', agentRole, input: topic.personaId || '(none)', output: searchOutput, tokensUsed: 0 });

    const actInput = `Write a draft "${topic.targetContentType}" about: "${topic.title}".\n${persona ? `Target audience/persona: ${persona.description}\n${persona.toneNotes ? `Tone: ${persona.toneNotes}\n` : ''}` : ''}\nWrite genuine, useful draft content. Do NOT use any specific percentage numbers, dollar figures, named customers, or dates -- do not claim "X% increase" or reference any company (including TalentsHill) achieving a specific result. Write about benefits qualitatively instead. This is a draft for human review, not a final publish-ready piece.\n\nRespond with the body text only, no preamble.`;
    const actResult = await ollamaChat([
      { role: 'system', content: 'You are a marketing content writer. Never invent specific statistics, percentages, dollar figures, named customers, dates, or unverifiable claims -- write qualitatively, not with fabricated numbers.' },
      { role: 'user', content: actInput },
    ]);
    logStep(runId, stepIndex++, 'act', agentRole, actInput, actResult.content, actResult.totalTokens);
    steps.push({ phase: 'act', agentRole, input: actInput, output: actResult.content, tokensUsed: actResult.totalTokens });
    totalTokens += actResult.totalTokens;

    const fabricationWarning = containsSuspiciousStatistics(actResult.content);

    const contentId = createContent({
      title: topic.title,
      contentType: topic.targetContentType,
      body: fabricationWarning
        ? `[AI GENERATION WARNING: this draft may contain fabricated statistics/figures despite instructions not to. Verify every number before publishing.]\n\n${actResult.content}`
        : actResult.content,
      excerpt: actResult.content.slice(0, 200),
      category: persona ? persona.name : undefined,
    });
    updateTopic(topic.id, { status: 'generated', generatedContentId: contentId });

    const executeOutput = fabricationWarning
      ? 'Status=draft, requires human review before publish. WARNING: generated text contains a percentage or dollar figure despite the prompt forbidding it -- flagged in the draft body for the reviewer.'
      : 'Status=draft, requires human review before publish. No numeric-statistic pattern detected.';
    logStep(runId, stepIndex++, 'execute', agentRole, `Created marketing_content ${contentId}`, executeOutput, 0);
    steps.push({ phase: 'execute', agentRole, input: `Created marketing_content ${contentId}`, output: executeOutput, tokensUsed: 0 });

    logStep(runId, stepIndex++, 'complete', agentRole, '', `Run complete, ${totalTokens} tokens used`, 0);
    steps.push({ phase: 'complete', agentRole, input: '', output: `Run complete, ${totalTokens} tokens used`, tokensUsed: 0 });

    updateOperationRunStatus(runId, 'completed', { outputPayload: { topicId: topic.id, generatedContentId: contentId, fabricationWarning }, tokensUsed: totalTokens });
    return { runId, agentCount: 1, steps, totalTokensUsed: totalTokens, topicId: topic.id, generatedContentId: contentId, fabricationWarning };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    throw err;
  }
}
