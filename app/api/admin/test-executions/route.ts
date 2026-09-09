import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, and } from 'drizzle-orm';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { recordTestExecution } from '@/lib/testing/record-test-execution';

// Shared test-execution history/recorder for any module's Testing tab.
export const GET = withPermission('health', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const moduleKey = searchParams.get('moduleKey');
  const status = searchParams.get('status');

  const conditions = [];
  if (moduleKey) conditions.push(eq(schema.testExecution.moduleKey, moduleKey));
  if (status) conditions.push(eq(schema.testExecution.status, status as 'pass' | 'fail'));

  const rows = conditions.length
    ? db.select().from(schema.testExecution).where(and(...conditions)).orderBy(desc(schema.testExecution.executedAt)).all()
    : db.select().from(schema.testExecution).orderBy(desc(schema.testExecution.executedAt)).all();

  const parsed = rows.map((r) => ({ ...r, testData: r.testData ? JSON.parse(r.testData) : null }));
  const passCount = parsed.filter((r) => r.status === 'pass').length;

  return NextResponse.json({ executions: parsed, count: parsed.length, passCount, failCount: parsed.length - passCount });
});

// Allows recording a test execution via API too (not just server-side
// helper calls) -- e.g. from a future automated test runner.
export const POST = withPermission('health', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    moduleKey?: string; executionMode?: string; caseName?: string; description?: string;
    expectedResult?: string; actualResult?: string; status?: string; testData?: unknown; logOutput?: string;
  } | null;

  if (!body?.moduleKey || !body?.caseName || !body?.expectedResult || !body?.actualResult || !body?.status) {
    return NextResponse.json({ error: 'moduleKey, caseName, expectedResult, actualResult, and status are required' }, { status: 400 });
  }
  if (body.status !== 'pass' && body.status !== 'fail') {
    return NextResponse.json({ error: 'status must be "pass" or "fail"' }, { status: 400 });
  }

  const userId = await getSessionUserIdAsync(request);
  const id = recordTestExecution({
    moduleKey: body.moduleKey,
    executionMode: body.executionMode as 'manual' | 'pipeline' | 'agentic' | 'cross-module' | undefined,
    caseName: body.caseName,
    description: body.description,
    expectedResult: body.expectedResult,
    actualResult: body.actualResult,
    status: body.status,
    testData: body.testData,
    logOutput: body.logOutput,
    executedBy: userId,
  });

  return NextResponse.json({ id }, { status: 201 });
});
