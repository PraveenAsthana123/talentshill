import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, inArray } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('runs', 'read')(async () => {
  const opRuns = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'runs')).orderBy(desc(schema.operationRun.createdAt)).limit(100).all();
  const opRunIds = opRuns.map((r) => r.id);
  const agentSteps = opRunIds.length
    ? db.select().from(schema.agentExecutionStep).where(inArray(schema.agentExecutionStep.runId, opRunIds)).orderBy(desc(schema.agentExecutionStep.createdAt)).limit(50).all()
    : [];
  const byMode = opRuns.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.executionMode]: (acc[r.executionMode] ?? 0) + 1 }), {});
  const totalTokens = opRuns.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

  const activeConsoleRuns = db.select().from(schema.runs).where(eq(schema.runs.status, 'active')).orderBy(desc(schema.runs.createdAt)).limit(20).all();

  return NextResponse.json({
    runs: opRuns.slice(0, 20),
    agentSteps: agentSteps.slice(0, 20),
    summary: { totalRuns: opRuns.length, byMode, totalTokensUsed: totalTokens, runningNow: opRuns.filter((r) => r.status === 'running').length },
    activeConsoleRuns: { items: activeConsoleRuns, note: 'Real currently-active rows in the runs table (the cross-module Run Console this module monitors), distinct from the operation_run rows above.' },
    vectorDb: { note: 'This module does not use RAG/vector search.' },
    jobQueue: { note: 'The runs table is populated by real business operations (currently: broadcast sends) directly, not through this job queue.' },
  });
});
