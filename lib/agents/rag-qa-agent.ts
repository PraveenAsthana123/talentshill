import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { logOperationRun, updateOperationRunStatus } from '@/lib/operation-run';
import { ollamaChat } from './ollama-client';
import { hybridRetrieve } from '@/lib/rag/retrieval';

export interface AgentStepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
export interface RagQaResult { runId: string; agentCount: number; steps: AgentStepRecord[]; totalTokensUsed: number; question: string; answer: string | null; sources: { chunkId: string; preview: string; score: number }[] }

// The first genuinely RAG-powered answer synthesis in this app -- per
// this workspace's RAG+Ollama mandatory policy's warning that a
// chatbot claiming "AI-powered/RAG-powered" that is actually keyword
// matching does not satisfy the policy. "Search" is the real
// hybridRetrieve() (now backed by real Ollama embeddings, not
// DummyEmbeddingProvider). "Act" is instructed to answer ONLY from the
// retrieved content and say so explicitly if the context doesn't
// contain the answer -- never falls back to the model's own knowledge.
export async function runRagQaAgent(params: { question: string; triggeredBy?: string | null }): Promise<RagQaResult> {
  const agentRole = 'rag_qa_synthesizer';
  const steps: AgentStepRecord[] = [];
  let totalTokens = 0;
  let stepIndex = 0;

  const runId = logOperationRun({ moduleKey: 'rag', operationName: 'agentic_qa_synthesis', executionMode: 'agentic', status: 'running', inputPayload: params, triggeredBy: params.triggeredBy });

  function logStep(phase: string, input: string, output: string, tokensUsed: number) {
    const now = new Date();
    db.insert(schema.agentExecutionStep).values({ id: randomUUID(), runId, stepIndex: stepIndex++, phase: phase as 'plan' | 'search' | 'act' | 'execute' | 'complete', agentRole, input, output, tokensUsed, startedAt: now, completedAt: now, createdAt: now }).run();
    steps.push({ phase, agentRole, input, output, tokensUsed });
  }

  try {
    const planInput = `Question: "${params.question}". Plan how to answer using only retrieved document context (max 2 steps).`;
    const planResult = await ollamaChat([
      { role: 'system', content: 'You are a RAG query-planning agent. Be concise.' },
      { role: 'user', content: planInput },
    ]);
    logStep('plan', planInput, planResult.content, planResult.totalTokens);
    totalTokens += planResult.totalTokens;

    const results = await hybridRetrieve(params.question, { k: 5 });
    const searchOutput = results.length > 0
      ? `Retrieved ${results.length} chunk(s): ${results.map((r) => `${r.chunkId.slice(0, 8)} (score ${r.score.toFixed(3)})`).join(', ')}`
      : 'Retrieved 0 chunks -- no matching content in the corpus.';
    logStep('search', params.question, searchOutput, 0);

    let answer: string;
    if (results.length === 0) {
      answer = 'No relevant content was found in the ingested document corpus for this question.';
      logStep('act', '(skipped -- no retrieved context)', answer, 0);
    } else {
      const context = results.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n');
      const actInput = `Context:\n${context}\n\nQuestion: ${params.question}\n\nAnswer using ONLY the context above. Cite sources by their [N] number. If the context does not contain the answer, say so explicitly -- do not use outside knowledge.`;
      const actResult = await ollamaChat([
        { role: 'system', content: 'You are a retrieval-augmented QA assistant. Never answer from knowledge outside the provided context.' },
        { role: 'user', content: actInput },
      ]);
      answer = actResult.content;
      logStep('act', actInput, actResult.content, actResult.totalTokens);
      totalTokens += actResult.totalTokens;
    }

    logStep('execute', 'No document or chunk mutation -- read-only retrieval and synthesis', 'No mutation applied', 0);
    logStep('complete', '', `Run complete, ${totalTokens} tokens used`, 0);

    updateOperationRunStatus(runId, 'completed', { outputPayload: { question: params.question, answer, sourceCount: results.length }, tokensUsed: totalTokens });
    return {
      runId, agentCount: 1, steps, totalTokensUsed: totalTokens, question: params.question, answer,
      sources: results.map((r) => ({ chunkId: r.chunkId, preview: r.content.slice(0, 200), score: r.score })),
    };
  } catch (err) {
    updateOperationRunStatus(runId, 'failed', { errorMessage: err instanceof Error ? err.message : String(err), tokensUsed: totalTokens });
    logStep('complete', '', `FAILED: ${err instanceof Error ? err.message : String(err)}`, 0);
    throw err;
  }
}
