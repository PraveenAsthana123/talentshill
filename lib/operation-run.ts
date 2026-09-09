import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';

// Shared helper for the Operational Portal Page & Tab Standard's run
// tracking. Real logging, not a stub -- every manual/pipeline/agentic
// operation on an adopting module calls this, producing the transactional
// history the standard's Manual tab (and the Monitoring/Log & Tracking
// tabs) require.
export function logOperationRun(params: {
  moduleKey: string;
  operationName: string;
  executionMode: 'manual' | 'pipeline' | 'agentic';
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputPayload?: unknown;
  outputPayload?: unknown;
  errorMessage?: string;
  tokensUsed?: number;
  triggeredBy?: string | null;
  startedAt?: Date;
  completedAt?: Date;
}): string {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.operationRun).values({
    id,
    moduleKey: params.moduleKey,
    operationName: params.operationName,
    executionMode: params.executionMode,
    status: params.status,
    inputPayload: params.inputPayload !== undefined ? JSON.stringify(params.inputPayload) : null,
    outputPayload: params.outputPayload !== undefined ? JSON.stringify(params.outputPayload) : null,
    errorMessage: params.errorMessage || null,
    tokensUsed: params.tokensUsed ?? null,
    triggeredBy: params.triggeredBy || null,
    startedAt: params.startedAt || now,
    completedAt: params.completedAt || (params.status === 'completed' || params.status === 'failed' ? now : null),
    createdAt: now,
  }).run();

  db.insert(schema.operationRunStatusHistory).values({
    id: randomUUID(),
    runId: id,
    status: params.status,
    changedAt: now,
  }).run();

  return id;
}

export function updateOperationRunStatus(runId: string, status: 'pending' | 'running' | 'completed' | 'failed', extra?: { outputPayload?: unknown; errorMessage?: string; tokensUsed?: number }) {
  const { eq } = require('drizzle-orm');
  const now = new Date();
  db.update(schema.operationRun).set({
    status,
    completedAt: status === 'completed' || status === 'failed' ? now : undefined,
    outputPayload: extra?.outputPayload !== undefined ? JSON.stringify(extra.outputPayload) : undefined,
    errorMessage: extra?.errorMessage,
    tokensUsed: extra?.tokensUsed,
  }).where(eq(schema.operationRun.id, runId)).run();

  db.insert(schema.operationRunStatusHistory).values({
    id: randomUUID(),
    runId,
    status,
    changedAt: now,
  }).run();
}
