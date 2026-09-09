import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, inArray } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('campaigns', 'read')(async (_request: NextRequest, _context: unknown) => {
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'campaigns')).orderBy(desc(schema.operationRun.createdAt)).limit(100).all();
  const runIds = runs.map((r) => r.id);
  const agentSteps = runIds.length
    ? db.select().from(schema.agentExecutionStep).where(inArray(schema.agentExecutionStep.runId, runIds)).orderBy(desc(schema.agentExecutionStep.createdAt)).limit(50).all()
    : [];
  const byMode = runs.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.executionMode]: (acc[r.executionMode] ?? 0) + 1 }), {});
  const totalTokens = runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

  // Real job-queue usage -- unlike Competitor Analysis/Leads, campaigns
  // DOES use the shared jobs table: launching a campaign creates a real
  // 'campaign_send' job. Report it accurately, not "not applicable".
  const sendJobs = db.select().from(schema.jobs).where(eq(schema.jobs.type, 'campaign_send')).orderBy(desc(schema.jobs.createdAt)).limit(20).all();

  return NextResponse.json({
    runs: runs.slice(0, 20),
    agentSteps: agentSteps.slice(0, 20),
    summary: { totalRuns: runs.length, byMode, totalTokensUsed: totalTokens, runningNow: runs.filter((r) => r.status === 'running').length },
    vectorDb: { note: 'This module does not use RAG/vector search.' },
    jobQueue: {
      note: `Real usage -- launching a campaign creates a 'campaign_send' job on the shared jobs table. ${sendJobs.length} such job(s) exist.`,
      jobs: sendJobs.map((j) => ({ id: j.id, status: j.status, attempts: j.attempts, createdAt: j.createdAt })),
    },
  });
});
