import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, inArray } from 'drizzle-orm';
import { getAllRuns } from '@/lib/db/rag-run-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('rag', 'read')(async () => {
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'rag')).orderBy(desc(schema.operationRun.createdAt)).limit(100).all();
  const runIds = runs.map((r) => r.id);
  const agentSteps = runIds.length
    ? db.select().from(schema.agentExecutionStep).where(inArray(schema.agentExecutionStep.runId, runIds)).orderBy(desc(schema.agentExecutionStep.createdAt)).limit(50).all()
    : [];
  const byMode = runs.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.executionMode]: (acc[r.executionMode] ?? 0) + 1 }), {});
  const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

  // rag_runs is a separate, domain-specific execution log for the real
  // job-queue-driven ingest/chunk/embed/evaluate pipeline (distinct
  // from this module's generic operation_run table used for
  // Manual/Pipeline/Agentic tracking) -- surfaced here rather than
  // conflated with it.
  const pipelineRuns = getAllRuns({ limit: 20, offset: 0 });

  return NextResponse.json({
    runs: runs.slice(0, 20),
    agentSteps: agentSteps.slice(0, 20),
    summary: { totalRuns: runs.length, byMode, totalTokensUsed: totalTokens, runningNow: runs.filter((r) => r.status === 'running').length },
    pipelineRuns: { items: pipelineRuns.items, total: pipelineRuns.total, note: 'Real ingest/chunk/embed/evaluate job runs from rag_runs, distinct from the operation_run rows above.' },
    vectorDb: { note: 'InMemoryVectorStore (brute-force cosine similarity over rag_embeddings, loaded fresh per query) -- real, but not a dedicated vector DB; fine at current corpus scale.' },
    jobQueue: { note: 'rag_ingest and rag_embed run through the real shared job queue (lib/jobs/runner.ts), lazily started by initJobRunner() on first hit of the dashboard/health routes.' },
  });
});
