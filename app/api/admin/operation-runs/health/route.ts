import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, and, lt } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

const STUCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes -- generous vs. the ~30-60s real agent runs observed this session
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';

// Shared health-check endpoint for the Operational Portal standard's
// Monitoring tabs -- real Ollama connectivity check, real stuck-run
// detection (running status past a generous timeout), and real
// categorized failure counts. Not module-specific -- any module's
// Monitoring tab can call this with its own moduleKey.
export const GET = withPermission('health', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const moduleKey = searchParams.get('moduleKey');

  // Real Ollama connectivity check -- an actual HTTP request, not assumed.
  let ollamaReachable = false;
  let ollamaLatencyMs: number | null = null;
  try {
    const start = Date.now();
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    ollamaLatencyMs = Date.now() - start;
    ollamaReachable = res.ok;
  } catch {
    ollamaReachable = false;
  }

  const cutoff = new Date(Date.now() - STUCK_THRESHOLD_MS);
  const stuckConditions = moduleKey
    ? and(eq(schema.operationRun.status, 'running'), lt(schema.operationRun.createdAt, cutoff), eq(schema.operationRun.moduleKey, moduleKey))
    : and(eq(schema.operationRun.status, 'running'), lt(schema.operationRun.createdAt, cutoff));
  const stuckRuns = db.select().from(schema.operationRun).where(stuckConditions).all();

  const failedConditions = moduleKey
    ? and(eq(schema.operationRun.status, 'failed'), eq(schema.operationRun.moduleKey, moduleKey))
    : eq(schema.operationRun.status, 'failed');
  const failedRuns = db.select().from(schema.operationRun).where(failedConditions).all();

  // Real categorization by matching against actual error-message
  // substrings this codebase's own agent/pipeline code produces -- not
  // guessed categories.
  const failureCategories = failedRuns.reduce((acc: Record<string, number>, r) => {
    const msg = (r.errorMessage || '').toLowerCase();
    let category = 'other';
    if (msg.includes('ollama') || msg.includes('timeout') || msg.includes('econnrefused')) category = 'llm_unreachable_or_timeout';
    else if (msg.includes('not found')) category = 'invalid_reference';
    else if (msg.includes('required')) category = 'missing_input';
    acc[category] = (acc[category] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    ollama: { reachable: ollamaReachable, latencyMs: ollamaLatencyMs, checkedAt: new Date().toISOString() },
    stuckRuns: stuckRuns.map((r) => ({ id: r.id, moduleKey: r.moduleKey, operationName: r.operationName, executionMode: r.executionMode, createdAt: r.createdAt })),
    stuckRunCount: stuckRuns.length,
    failedRunCount: failedRuns.length,
    failureCategories,
  });
});
