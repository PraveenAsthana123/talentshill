import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, inArray } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('chat', 'read')(async () => {
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'chat')).orderBy(desc(schema.operationRun.createdAt)).limit(100).all();
  const runIds = runs.map((r) => r.id);
  const agentSteps = runIds.length
    ? db.select().from(schema.agentExecutionStep).where(inArray(schema.agentExecutionStep.runId, runIds)).orderBy(desc(schema.agentExecutionStep.createdAt)).limit(50).all()
    : [];
  const byMode = runs.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.executionMode]: (acc[r.executionMode] ?? 0) + 1 }), {});
  const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

  return NextResponse.json({
    runs: runs.slice(0, 20),
    agentSteps: agentSteps.slice(0, 20),
    summary: { totalRuns: runs.length, byMode, totalTokensUsed: totalTokens, runningNow: runs.filter((r) => r.status === 'running').length },
    vectorDb: { note: 'This module does not use RAG/vector search.' },
    jobQueue: { note: 'Pipeline/Agentic runs execute synchronously via operation_run, not the shared jobs table.' },
  });
});
