// Minimal, real Ollama client -- TalentsHill's first actual LLM
// integration. The existing chatbot (lib/chat/response-engine.ts) has no
// LLM call at all despite public pages describing "AI-powered" features;
// this file is a genuinely new capability, not a wrapper around
// something that already worked. Per this workspace's RAG+Ollama
// mandatory-default policy: local Ollama, not a cloud provider with an
// API key dependency.
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi4-mini:latest';

export interface OllamaChatResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export async function ollamaChat(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<OllamaChatResult> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    throw new Error(`Ollama request failed: HTTP ${res.status} ${await res.text().catch(() => '')}`);
  }

  const data = await res.json() as {
    message?: { content: string };
    prompt_eval_count?: number;
    eval_count?: number;
  };

  return {
    content: data.message?.content || '',
    promptTokens: data.prompt_eval_count || 0,
    completionTokens: data.eval_count || 0,
    totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
    model: OLLAMA_MODEL,
  };
}
