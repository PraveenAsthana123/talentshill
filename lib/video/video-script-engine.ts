import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db/index';
import { ollamaChat } from '@/lib/agents/ollama-client';
import { recordEvidence } from '@/lib/evidence/evidence-ledger';

export function buildScriptPrompt(topic: string, targetPlatform: string): string {
  return `Write a short video script (hook, body, call-to-action) for a ${targetPlatform} video about: "${topic}". Keep it under 150 words, punchy, no markdown formatting.`;
}

export interface GenerateScriptInput {
  topic: string;
  targetPlatform: string;
  clipPlanId?: string;
}

// Real Ollama call -- no template fill-in. Same client already validated
// for lead-qualification-agent.ts.
export async function generateVideoScript(input: GenerateScriptInput): Promise<{ id: string; scriptText: string }> {
  if (!input.topic.trim()) throw new Error('topic is required');
  const result = await ollamaChat([
    { role: 'system', content: 'You are a short-form video scriptwriter for a B2B AI/digital-marketing consultancy.' },
    { role: 'user', content: buildScriptPrompt(input.topic, input.targetPlatform) },
  ]);

  const id = randomUUID();
  const now = new Date();
  db.insert(schema.videoScript).values({
    id, clipPlanId: input.clipPlanId ?? null, topic: input.topic, targetPlatform: input.targetPlatform,
    scriptText: result.content, model: result.model, promptTokens: result.promptTokens,
    completionTokens: result.completionTokens, generatedAt: now,
  }).run();

  recordEvidence({
    moduleKey: 'video_script_engine',
    claimClass: 'inference', // LLM-generated creative content, not a measured fact
    claimText: `Real Ollama-generated video script for "${input.topic}" (${input.targetPlatform}), ${result.completionTokens} completion tokens.`,
    sourceRef: `video_script:${id}`,
    sourceTable: 'video_script',
    confidence: 'medium',
    createdBy: 'system',
  });

  return { id, scriptText: result.content };
}

export function getScriptsForClipPlan(clipPlanId: string) {
  return db.select().from(schema.videoScript).where(eq(schema.videoScript.clipPlanId, clipPlanId)).all();
}
