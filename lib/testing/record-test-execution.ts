import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';

// Real test-execution recorder. Call this at the moment a real
// verification actually happens (a live curl test, a DB query check, a
// regression run) -- never after the fact for a test that wasn't run,
// and never with a fabricated actualResult/logOutput.
export function recordTestExecution(params: {
  moduleKey: string;
  executionMode?: 'manual' | 'pipeline' | 'agentic' | 'cross-module';
  caseName: string;
  description?: string;
  expectedResult: string;
  actualResult: string;
  status: 'pass' | 'fail';
  testData?: unknown;
  logOutput?: string;
  executedBy?: string | null;
}): string {
  const id = randomUUID();
  const now = new Date();
  db.insert(schema.testExecution).values({
    id,
    moduleKey: params.moduleKey,
    executionMode: params.executionMode,
    caseName: params.caseName,
    description: params.description || null,
    expectedResult: params.expectedResult,
    actualResult: params.actualResult,
    status: params.status,
    testData: params.testData !== undefined ? JSON.stringify(params.testData) : null,
    logOutput: params.logOutput || null,
    executedAt: now,
    executedBy: params.executedBy || null,
    createdAt: now,
  }).run();
  return id;
}
